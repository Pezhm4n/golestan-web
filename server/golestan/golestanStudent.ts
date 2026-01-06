import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';

export interface CourseEnrollment {
  courseCode: string;
  courseName: string;
  courseUnits: number;
  courseType: string;
  gradeState: string;
  grade: number | null;
}

export interface SemesterRecord {
  semesterId: number;
  semesterDescription: string;
  semesterGpa: number;
  unitsTaken: number;
  unitsPassed: number;
  unitsFailed: number;
  unitsDropped: number;
  cumulativeGpa: number;
  cumulativeUnitsPassed: number;
  semesterStatus: string | null;
  semesterType: string | null;
  probationStatus: string | null;
  courses: CourseEnrollment[];
}

export interface Student {
  studentId: string;
  name: string;
  fatherName: string;
  faculty: string;
  department: string;
  major: string;
  degreeLevel: string;
  studyType: string;
  enrollmentStatus: string;
  registrationPermission: boolean;
  overallGpa: number | null;
  totalUnitsPassed: number;
  totalProbation: number;
  consecutiveProbation: number;
  specialProbation: number;
  semesters: SemesterRecord[];
  updatedAt: string;
  imageB64: string | null;
}

interface AspNetFields {
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
  ticket?: string | null;
}

export interface GolestanCredentials {
  username: string;
  password: string;
}

export interface GolestanClientOptions {
  timeoutMs?: number;
  captchaSolver: (image: Buffer) => Promise<string>;
}

function extractAspNetFields(html: string): AspNetFields {
  const $ = cheerio.load(html);
  const viewState = $('input[name="__VIEWSTATE"]').attr('value') ?? '';
  const viewStateGenerator =
    $('input[name="__VIEWSTATEGENERATOR"]').attr('value') ?? '';
  const eventValidation =
    $('input[name="__EVENTVALIDATION"]').attr('value') ?? '';
  const ticket = $('input[name="TicketTextBox"]').attr('value') ?? null;

  console.log('[GolestanClient][extractAspNetFields]', {
    viewStatePresent: !!viewState,
    viewStateGeneratorPresent: !!viewStateGenerator,
    eventValidationPresent: !!eventValidation,
    ticketPresent: ticket != null,
  });

  if (!viewState || !viewStateGenerator || !eventValidation) {
    throw new Error('Failed to extract ASP.NET hidden fields.');
  }

  return {
    viewState,
    viewStateGenerator,
    eventValidation,
    ticket,
  };
}

function isSslError(err: AxiosError | Error): boolean {
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('ssl') ||
    msg.includes('certificate') ||
    msg.includes('self signed')
  );
}

function isConnectionError(err: AxiosError): boolean {
  const code = err.code?.toLowerCase();
  return code === 'econnrefused' || !!err.message.match(/network error/i);
}

function toNullableNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) return null;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function toNumber(raw: string | null | undefined, defaultValue = 0): number {
  const n = toNullableNumber(raw);
  return n == null ? defaultValue : n;
}

function extractJsVar(html: string, varName: string): string {
  const pattern = new RegExp(`${varName}\\s*=\\s*'([^']*)';`);
  const match = html.match(pattern);
  return match?.[1] ?? '';
}

function extractSemesterIds(html: string): string[] {
  const match = html.match(/T01XML\s*=\s*'([^']*)';/);
  if (!match) {
    return [];
  }

  const xmlString = match[1];
  try {
    const $xml = cheerio.load(xmlString, { xmlMode: true });
    const ids: string[] = [];
    $xml('N').each((_, el) => {
      const id = $xml(el).attr('F4350');
      if (id) {
        ids.push(id);
      }
    });
    return ids;
  } catch {
    return [];
  }
}

function parseSemesterData(html: string): SemesterRecord | null {
  const semesterNumber = extractJsVar(html, 'F43501');
  const semesterDescription = extractJsVar(html, 'F57551');
  const semesterStatus = extractJsVar(html, 'F44551');
  const semesterType = extractJsVar(html, 'F43551');
  const probationStatus = extractJsVar(html, 'F44151');

  let semesterGpa = 0;
  let unitsTaken = 0;
  let unitsPassed = 0;
  let cumulativeGpa = 0;
  let cumulativeUnitsPassed = 0;
  let unitsFailedStr: string | null = null;
  let unitsDroppedStr: string | null = null;

  const t01Match = html.match(/T01XML\s*=\s*'([^']*)';/);
  if (t01Match) {
    const t01Xml = t01Match[1];
    try {
      const $xml = cheerio.load(t01Xml, { xmlMode: true });
      const nodes = $xml('N');

      if (nodes.length >= 1) {
        const first = nodes.eq(0);
        const gpaStr = (first.attr('F4360') ?? '').trim();
        const gpa = toNullableNumber(gpaStr);
        semesterGpa = gpa ?? 0;
        unitsTaken = toNumber(first.attr('F4365'), 0);
        unitsPassed = toNumber(first.attr('F4370'), 0);
        unitsFailedStr = extractJsVar(html, 'F4385');
        unitsDroppedStr = extractJsVar(html, 'F4375');
      }

      if (nodes.length >= 2) {
        const second = nodes.eq(1);
        cumulativeGpa = toNumber(second.attr('F4360'), 0);
        cumulativeUnitsPassed = toNumber(second.attr('F4370'), 0);
      }
    } catch (e) {
      console.warn('Warning: Failed to parse T01XML', e);
    }
  }

  const courses: CourseEnrollment[] = [];
  const t02Match = html.match(/T02XML\s*=\s*'([^']*)';/);
  if (t02Match) {
    const t02Xml = t02Match[1];
    try {
      const $xml = cheerio.load(t02Xml, { xmlMode: true });
      $xml('N').each((_, el) => {
        const node = $xml(el);
        const courseCode =
          (node.attr('F5560') ?? '') + '_' + (node.attr('F5565') ?? '');
        const courseName = node.attr('F0200') ?? '';
        const courseUnits = toNumber(node.attr('F0205'), 0);
        const courseType = node.attr('F3952') ?? '';
        const gradeState = node.attr('F3965') ?? '';
        const gradeStr = (node.attr('F3945') ?? '').trim();
        const grade = gradeStr ? toNullableNumber(gradeStr) : null;

        courses.push({
          courseCode,
          courseName,
          courseUnits,
          courseType,
          gradeState,
          grade,
        });
      });
    } catch (e) {
      console.warn('Warning: Failed to parse T02XML', e);
    }
  }

  if (semesterGpa === 0 && courses.length > 0) {
    let totalPoints = 0;
    let totalUnitsForGpa = 0;
    for (const c of courses) {
      if (c.grade == null) continue;
      totalUnitsForGpa += c.courseUnits;
      totalPoints += c.grade * c.courseUnits;
    }
    if (totalUnitsForGpa > 0) {
      const raw = totalPoints / totalUnitsForGpa;
      semesterGpa = Math.round(raw * 100) / 100;
    }
  }

  const semesterId = semesterNumber ? Number.parseInt(semesterNumber, 10) : 0;

  const semester: SemesterRecord = {
    semesterId,
    semesterDescription,
    semesterGpa,
    unitsTaken,
    unitsPassed,
    unitsFailed: toNumber(unitsFailedStr, 0),
    unitsDropped: toNumber(unitsDroppedStr, 0),
    cumulativeGpa,
    cumulativeUnitsPassed,
    semesterStatus: semesterStatus || null,
    semesterType: semesterType || null,
    probationStatus: probationStatus || null,
    courses,
  };

  return semester;
}

function parseStudentInfoFromHtml(html: string, username: string): Student {
  const $ = cheerio.load(html);
  const script = $('#clientEventHandlersJS').first();

  if (!script || !script.text()) {
    throw new Error('Failed to find student info script block in HTML.');
  }

  const scriptText = script.text();

  const extractVar = (varName: string): string => {
    const pattern = new RegExp(`${varName}\\s*=\\s*'([^']*)';`);
    const match = scriptText.match(pattern);
    return match?.[1] ?? '';
  };

  const name = extractVar('F51851');
  const fatherName = extractVar('F34501');
  const faculty = extractVar('F61151');
  const department = extractVar('F16451');
  const major = extractVar('F17551');
  const degreeLevel = extractVar('F41301');
  const studyType = extractVar('F41351');
  const enrollmentStatus = extractVar('F43301');
  const registrationPermission = extractVar('F42251') === 'دارد';

  const imageRaw = extractVar('F15871');
  const imageB64 =
    imageRaw && imageRaw.includes(',')
      ? imageRaw.split(',')[1] ?? null
      : imageRaw || null;

  const overallGpaStr = extractVar('F41701');
  const totalUnitsStr = extractVar('F41801');
  const totalProbationStr = extractVar('F42401');
  const consecutiveProbationStr = extractVar('F42451');
  const specialProbationStr = extractVar('F42371');

  const overallGpa = toNullableNumber(overallGpaStr);
  const totalUnitsPassed = toNumber(totalUnitsStr, 0);
  const totalProbation = totalProbationStr ? Number.parseInt(totalProbationStr, 10) : 0;
  const consecutiveProbation = consecutiveProbationStr
    ? Number.parseInt(consecutiveProbationStr, 10)
    : 0;
  const specialProbation = specialProbationStr
    ? Number.parseInt(specialProbationStr, 10)
    : 0;

  const student: Student = {
    studentId: username,
    name,
    fatherName,
    faculty,
    department,
    major,
    degreeLevel,
    studyType,
    enrollmentStatus,
    registrationPermission,
    overallGpa,
    totalUnitsPassed,
    totalProbation,
    consecutiveProbation,
    specialProbation,
    semesters: [],
    updatedAt: new Date().toISOString(),
    imageB64,
  };

  return student;
}

class GolestanClient {
  private readonly baseUrl: string;
  private readonly jar: CookieJar;
  private readonly http: AxiosInstance;
  private readonly timeoutMs: number;
  private readonly captchaSolver: (image: Buffer) => Promise<string>;

  private sessionId?: string;
  private lt?: string;
  private u?: string;
  private tck?: string;
  private rnd?: number;
  private seq = 1;
  private username?: string;

  private readonly defaultHeaders = {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua':
      '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Site': 'same-origin',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  };

  constructor(options: GolestanClientOptions) {
    this.baseUrl = options.baseUrl ?? 'https://golestan.ikiu.ac.ir';
    this.jar = new CookieJar();
    this.http = wrapper(
      axios.create({
        jar: this.jar,
        withCredentials: true,
      }),
    );
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.captchaSolver = options.captchaSolver;
  }

  private async setCookies(pairs: [string, string][]): Promise<void> {
    const url = this.baseUrl;
    for (const [name, value] of pairs) {
      await this.jar.setCookie(
        `${name}=${value}; Domain=golestan.ikiu.ac.ir; Path=/`,
        url,
      );
    }
  }

  private async getCookieHeaderString(): Promise<string> {
    const cookies = await this.jar.getCookies(this.baseUrl);
    if (!cookies.length) return '';
    return cookies.map(c => `${c.key}=${c.value}`).join('; ');
  }

  private async logSessionCookies(label: string): Promise<void> {
    try {
      const cookies = await this.jar.getCookies(this.baseUrl);
      const hasSession = cookies.some(c => c.key === 'ASP.NET_SessionId');
      const hasLt = cookies.some(c => c.key === 'lt');
      const hasU = cookies.some(c => c.key === 'u');

      console.log('[GolestanClient][session]', label, {
        aspNetSessionPresent: hasSession,
        ltPresent: hasLt,
        uPresent: hasU,
        cookieCount: cookies.length,
      });
    } catch {
      console.warn('[GolestanClient][session] Failed to read cookies', label);
    }
  }

  private async safeRequest<T = any>(
    method: 'get' | 'post',
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    const finalConfig: AxiosRequestConfig = {
      timeout: this.timeoutMs,
      ...config,
      headers: { ...this.defaultHeaders, ...(config.headers || {}) },
    };

    console.log('[GolestanClient][request]', {
      method,
      url,
      hasData: typeof finalConfig.data !== 'undefined',
    });

    try {
      let response: AxiosResponse<T>;
      if (method === 'get') {
        response = await this.http.get<T>(url, finalConfig);
      } else if (method === 'post') {
        response = await this.http.post<T>(url, finalConfig.data, finalConfig);
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      console.log('[GolestanClient][response]', {
        method,
        url,
        status: response.status,
        statusText: response.statusText,
      });

      return response;
    } catch (err) {
      console.error('[GolestanClient][request-error]', {
        method,
        url,
        errorMessage: (err as Error).message,
        code: (axios.isAxiosError(err) && err.code) || undefined,
      });

      if (axios.isAxiosError(err)) {
        if (isSslError(err) || isConnectionError(err) || err.code === 'ECONNABORTED') {
          throw new Error('CONNECTION_ERROR');
        }
        throw new Error('REMOTE_SERVICE_ERROR');
      }

      const e = err as Error;
      if (isSslError(e)) {
        throw new Error('CONNECTION_ERROR');
      }

      throw new Error('UNKNOWN_ERROR');
    }
  }

  public async authenticate(
    username: string,
    password: string,
    maxAttempts = 5,
  ): Promise<void> {
    this.username = username;

    const unvarmUrl =
      'https://golestan.ikiu.ac.ir/_templates/unvarm/unvarm.aspx?typ=1';
    await this.safeRequest('get', unvarmUrl);

    {
      const cookies = await this.jar.getCookies(this.baseUrl);
      const sessionCookie = cookies.find(
        c => c.key === 'ASP.NET_SessionId',
      );
      this.sessionId = sessionCookie?.value;
      await this.logSessionCookies('after-unvarm');
    }

    // Initialize state cookies but keep the ASP.NET_SessionId coming from the server.
    await this.setCookies([
      ['ASP.NET_SessionId', this.sessionId ?? ''],
      ['f', ''],
      ['ft', ''],
      ['lt', ''],
      ['seq', ''],
      ['su', ''],
      ['u', ''],
    ]);

    const authGetUrl =
      'https://golestan.ikiu.ac.ir/Forms/AuthenticateUser/AuthUser.aspx?fid=0;1&tck=&&&lastm=20240303092318';
    const authGetResp = await this.safeRequest<string>('get', authGetUrl);
    let aspnetFields = extractAspNetFields(authGetResp.data);

    const initialPayload = new URLSearchParams({
      '__VIEWSTATE': aspnetFields.viewState,
      '__VIEWSTATEGENERATOR': aspnetFields.viewStateGenerator,
      '__EVENTVALIDATION': aspnetFields.eventValidation,
      'TxtMiddle': '<r/>',
      'Fm_Action': '00',
      'Frm_Type': '',
      'Frm_No': '',
      'TicketTextBox': '',
    });

    const authPostUrl =
      'https://golestan.ikiu.ac.ir/Forms/AuthenticateUser/AuthUser.aspx?fid=0%3b1&tck=&&&lastm=20240303092318';

    const initialPostResp = await this.safeRequest<string>('post', authPostUrl, {
      data: initialPayload,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    aspnetFields = extractAspNetFields(initialPostResp.data);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      // Log session just before requesting captcha
      await this.logSessionCookies(`attempt-${attempt}-before-captcha`);

      const captchaUrl = `https://golestan.ikiu.ac.ir/Forms/AuthenticateUser/captcha.aspx?${Math.random()}`;
      const captchaResp = await this.safeRequest<ArrayBuffer>('get', captchaUrl, {
        responseType: 'arraybuffer',
      });

      const captchaBuffer = Buffer.from(captchaResp.data);
      const captchaText = await this.captchaSolver(captchaBuffer);
      console.log('[GolestanClient][captcha]', {
        attempt,
        captchaText,
      });

      // Log session just before submitting login POST
      await this.logSessionCookies(`attempt-${attempt}-before-login-post`);

      const payload = new URLSearchParams({
        '__VIEWSTATE': aspnetFields.viewState,
        '__VIEWSTATEGENERATOR': aspnetFields.viewStateGenerator,
        '__EVENTVALIDATION': aspnetFields.eventValidation,
        'TxtMiddle': `<r F51851=\"\" F80351=\"${username}\" F80401=\"${password}\" F51701=\"${captchaText}\" F83181=\"1\" F51602=\"\" F51803=\"0\" F51601=\"1\"/>`,
        'Fm_Action': '09',
        'Frm_Type': '',
        'Frm_No': '',
        'TicketTextBox': '',
      });

      const respPost = await this.safeRequest<string>('post', authPostUrl, {
        data: payload,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const cookies = await this.jar.getCookies(this.baseUrl);
      const ltCookie = cookies.find(c => c.key === 'lt');
      const uCookie = cookies.find(c => c.key === 'u');

      this.lt = ltCookie?.value;
      this.u = uCookie?.value;

      if (this.lt && this.u) {
        aspnetFields = extractAspNetFields(respPost.data);
        this.tck = aspnetFields.ticket ?? undefined;

        const sessionCookie = cookies.find(
          c => c.key === 'ASP.NET_SessionId',
        );
        this.sessionId = sessionCookie?.value;

        await this.logSessionCookies(`attempt-${attempt}-after-login-success`);
        break;
      }

      // Login failed on this attempt – log attempt count only (no HTML or credentials)
      console.warn('[GolestanClient][login-failed]', {
        attempt,
      });

      await this.logSessionCookies(`attempt-${attempt}-after-login-failed`);

      if (attempt === maxAttempts) {
        console.error(
          '[GolestanClient][login-failed-max-attempts]',
        );
        throw new Error('LOGIN_FAILED');
      }
    }

    await this.setCookies([
      ['ASP.NET_SessionId', this.sessionId ?? ''],
      ['f', '1'],
      ['ft', '0'],
      ['lt', this.lt ?? ''],
      ['seq', String(this.seq)],
      ['stdno', ''],
      ['su', '0'],
      ['u', this.u ?? ''],
    ]);

    const rnd = Math.random();
    const menuGetUrl = `${this.baseUrl}/Forms/F0213_PROCESS_SYSMENU/F0213_01_PROCESS_SYSMENU_Dat.aspx?r=${rnd}&fid=0;11130&b=&l=&tck=${this.tck ?? ''}&&lastm=20240303092316`;
    const menuGetResp = await this.safeRequest<string>('get', menuGetUrl);
    aspnetFields = extractAspNetFields(menuGetResp.data);
    const ticket = aspnetFields.ticket ?? '';

    this.seq += 1;
    await this.setCookies([
      ['ASP.NET_SessionId', this.sessionId ?? ''],
      ['f', '11130'],
      ['ft', '0'],
      ['lt', this.lt ?? ''],
      ['seq', String(this.seq)],
      ['su', '3'],
      ['u', this.u ?? ''],
    ]);

    const menuPayload = new URLSearchParams({
      '__VIEWSTATE': aspnetFields.viewState,
      '__VIEWSTATEGENERATOR': aspnetFields.viewStateGenerator,
      '__EVENTVALIDATION': aspnetFields.eventValidation,
      'Fm_Action': '00',
      'Frm_Type': '',
      'Frm_No': '',
      'TicketTextBox': ticket,
      'XMLStdHlp': '',
      'TxtMiddle': '<r/>',
      'ex': '',
    });

    const menuPostUrl = `${this.baseUrl}/Forms/F0213_PROCESS_SYSMENU/F0213_01_PROCESS_SYSMENU_Dat.aspx?r=${rnd}&fid=0%3b11130&b=&l=&tck=${this.tck ?? ''}&&lastm=20240303092316`;
    const menuPostResp = await this.safeRequest<string>('post', menuPostUrl, {
      data: menuPayload,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    aspnetFields = extractAspNetFields(menuPostResp.data);
    this.tck = aspnetFields.ticket ?? undefined;
  }

  public async fetchStudentInfo(): Promise<{
    html: string;
    aspnetFields: AspNetFields;
    semesterIds: string[];
  }> {
    if (!this.tck || !this.lt || !this.u || !this.sessionId) {
      throw new Error('fetchStudentInfo called before authenticate.');
    }

    this.rnd = Math.random();
    const basePath =
      '/Forms/F1802_PROCESS_MNG_STDJAMEHMON/F1802_01_PROCESS_MNG_STDJAMEHMON_Dat.aspx';
    const getUrl = `${this.baseUrl}${basePath}?r=${this.rnd}&fid=0;12310&b=10&l=1&tck=${this.tck}&&lastm=20250906103728`;

    const getResp = await this.safeRequest<string>('get', getUrl);
    let aspnetFields = extractAspNetFields(getResp.data);
    let ticket = aspnetFields.ticket ?? '';

    this.seq += 1;

    await this.setCookies([
      ['ASP.NET_SessionId', this.sessionId ?? ''],
      ['f', '12310'],
      ['ft', '0'],
      ['lt', this.lt ?? ''],
      ['seq', String(this.seq)],
      ['sno', ''],
      ['stdno', ''],
      ['su', '3'],
      ['u', this.u ?? ''],
    ]);

    const firstPayload = new URLSearchParams({
      '__VIEWSTATE': aspnetFields.viewState,
      '__VIEWSTATEGENERATOR': aspnetFields.viewStateGenerator,
      '__EVENTVALIDATION': aspnetFields.eventValidation,
      'Fm_Action': '00',
      'Frm_Type': '',
      'Frm_No': '',
      'TicketTextBox': ticket,
      'XMLStdHlp': '',
      'TxtMiddle': '<r/>',
      'ex': '',
    });

    const postUrl = `${this.baseUrl}${basePath}?r=${this.rnd}&fid=0%3b12310&b=10&l=1&tck=${this.tck}&&lastm=20250906103728`;
    const firstPostResp = await this.safeRequest<string>('post', postUrl, {
      data: firstPayload,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    aspnetFields = extractAspNetFields(firstPostResp.data);
    ticket = aspnetFields.ticket ?? '';

    const username = this.username ?? '';
    const secondPayload = new URLSearchParams({
      '__VIEWSTATE': aspnetFields.viewState,
      '__VIEWSTATEGENERATOR': aspnetFields.viewStateGenerator,
      '__EVENTVALIDATION': aspnetFields.eventValidation,
      'Fm_Action': '08',
      'Frm_Type': '',
      'Frm_No': '',
      'TicketTextBox': ticket,
      'XMLStdHlp': '',
      'TxtMiddle': `<r F41251="${username}" F01951="" F02001=""/>`,
      'ex': '',
    });

    const secondPostResp = await this.safeRequest<string>('post', postUrl, {
      data: secondPayload,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const finalAspNet = extractAspNetFields(secondPostResp.data);
    const semesterIds = extractSemesterIds(secondPostResp.data);

    return {
      html: secondPostResp.data,
      aspnetFields: finalAspNet,
      semesterIds,
    };
  }

  public async fetchSemesterCourses(
    semesterId: string,
    aspnetFields: AspNetFields,
  ): Promise<{ semester: SemesterRecord | null; aspnetFields: AspNetFields }> {
    if (!this.rnd || !this.tck || !this.username) {
      throw new Error('fetchSemesterCourses called before fetchStudentInfo/authenticate.');
    }

    const basePath =
      '/Forms/F1802_PROCESS_MNG_STDJAMEHMON/F1802_01_PROCESS_MNG_STDJAMEHMON_Dat.aspx';

    const payload = new URLSearchParams({
      '__VIEWSTATE': aspnetFields.viewState,
      '__VIEWSTATEGENERATOR': aspnetFields.viewStateGenerator,
      '__EVENTVALIDATION': aspnetFields.eventValidation,
      'Fm_Action': '80',
      'Frm_Type': '',
      'Frm_No': '',
      'TicketTextBox': aspnetFields.ticket ?? '',
      'XMLStdHlp': '',
      'TxtMiddle': `<r F41251="${this.username}" F01951="" F02001="" F43501="${semesterId}"/>`,
      'ex': '',
    });

    const semesterUrl = `${this.baseUrl}${basePath}?r=${this.rnd}&fid=0%3b12310&b=10&l=1&tck=${this.tck}&&lastm=20250906103728`;
    const resp = await this.safeRequest<string>('post', semesterUrl, {
      data: payload,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const nextFields = extractAspNetFields(resp.data);
    const semester = parseSemesterData(resp.data);

    return {
      semester,
      aspnetFields: nextFields,
    };
  }
}

export async function getStudentRecord(
  credentials: GolestanCredentials,
  options: GolestanClientOptions,
): Promise<Student> {
  const client = new GolestanClient(options);

  await client.authenticate(
    credentials.username,
    credentials.password,
    5,
  );

  const { html, aspnetFields, semesterIds } = await client.fetchStudentInfo();
  const student = parseStudentInfoFromHtml(html, credentials.username);

  let currentFields = aspnetFields;
  const semesters: SemesterRecord[] = [];

  for (const semId of semesterIds) {
    const { semester, aspnetFields: nextFields } = await client.fetchSemesterCourses(
      semId,
      currentFields,
    );
    currentFields = nextFields;
    if (semester) {
      semesters.push(semester);
    }
  }

  student.semesters = semesters;
  return student;
}