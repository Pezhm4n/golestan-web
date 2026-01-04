import http from 'http';
import {
  getStudentRecord,
  GolestanCredentials,
} from './golestan/golestanStudent';

const PORT = 8000;

const CAPTCHA_API_URL =
  process.env.CAPTCHA_API_URL ||
  'https://golestan-captcha-solvers-golestan-captcha-solver.hf.space/predict';

process.on('uncaughtException', err => {
  console.error('[uncaughtException]', err);
});

process.on('unhandledRejection', reason => {
  console.error('[unhandledRejection]', reason);
});

/**
 * Captcha solver that delegates to an external Hugging Face API.
 *
 * Behavior:
 * - Sends the captcha image as multipart/form-data to the external API
 * - Parses the JSON/text response and extracts the captcha text
 */
async function captchaSolver(image: Buffer): Promise<string> {
  try {
    const formData = new FormData();
    const blob = new Blob([image], { type: 'image/png' });
    formData.append('file', blob, 'captcha.png');

    const response = await fetch(CAPTCHA_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('[captchaSolver] CAPTCHA API error', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(
        `Captcha API request failed with status ${response.status} ${response.statusText}`,
      );
    }

    const raw = (await response.text()).trim();
    if (!raw) {
      throw new Error('Empty captcha prediction from external API');
    }

    let extracted = raw;

    // Try to parse JSON and read captcha_text field
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as { captcha_text?: unknown; captcha?: unknown; text?: unknown };
        const candidate =
          (typeof obj.captcha_text === 'string' && obj.captcha_text) ||
          (typeof obj.captcha === 'string' && obj.captcha) ||
          (typeof obj.text === 'string' && obj.text);

        if (candidate && candidate.trim()) {
          extracted = candidate.trim();
        }
      }
    } catch {
      // Not JSON, fall back to raw text
    }

    console.log('[captchaSolver] Raw CAPTCHA API response:', raw.slice(0, 300));
    console.log('[captchaSolver] Extracted captcha text:', `"${extracted}"`);

    if (!extracted) {
      throw new Error('Failed to extract captcha text from external API response');
    }

    return extracted;
  } catch (error) {
    console.error('[captchaSolver] Error while calling external CAPTCHA API:', error);
    throw new Error('Failed to solve captcha using external CAPTCHA API');
  }
}

function sendJson(res: http.ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    console.log('[request]', req.method, req.url ?? '');

    // Basic CORS handling to allow the Vite dev server (http://localhost:8080)
    const origin = req.headers.origin;
    const allowedOrigin = 'http://localhost:8080';

    if (origin && origin === allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }

    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, x-username, x-password',
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // Preflight request
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (!req.url) {
      sendJson(res, 400, { detail: 'Bad Request' });
      return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/api/student/profile') {
      const queryUsername = url.searchParams.get('username');
      const queryPassword = url.searchParams.get('password');

      const headerUsername = req.headers['x-username'];
      const headerPassword = req.headers['x-password'];

      const username =
        typeof queryUsername === 'string' && queryUsername.trim()
          ? queryUsername.trim()
          : typeof headerUsername === 'string'
          ? headerUsername.trim()
          : '';

      const password =
        typeof queryPassword === 'string' && queryPassword.trim()
          ? queryPassword.trim()
          : typeof headerPassword === 'string'
          ? headerPassword.trim()
          : '';

      if (!username || !password) {
        sendJson(res, 400, {
          detail:
            'Missing credentials. Provide username and password via query params (?username=...&password=...) or headers (x-username, x-password).',
        });
        return;
      }

      const credentials: GolestanCredentials = { username, password };

      try {
        const student = await getStudentRecord(credentials, {
          timeoutMs: 30000,
          captchaSolver,
        });
        sendJson(res, 200, student);
      } catch (error) {
        const message = (error as Error).message || 'Unknown error';
        console.error('[student/profile] Error while fetching student record:', error);
        sendJson(res, 500, { detail: message });
      }

      return;
    }

    sendJson(res, 404, { detail: 'Not Found' });
  } catch (error) {
    const message = (error as Error).message || 'Internal server error';
    console.error('[request] Unhandled error in HTTP handler:', error);
    sendJson(res, 500, { detail: message });
  }
});

server.listen(PORT, () => {
  console.log(`Golestan Node server listening on http://localhost:${PORT}`);
});

server.on('error', err => {
  console.error('[server] HTTP server error:', err);
});