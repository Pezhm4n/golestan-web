import 'dotenv/config';
import http from 'http';
import {
  getStudentRecord,
  GolestanCredentials,
} from './golestan/golestanStudent';

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
};

const PORT = Number(process.env.PORT || '8000');
const HOST = process.env.HOST || '127.0.0.1';
const ALLOWED_ORIGIN = getEnv('ALLOWED_ORIGIN');
const CAPTCHA_API_URL = getEnv('CAPTCHA_API_URL');

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

type RateLimitInfo = {
  count: number;
  windowStart: number;
};

const rateLimitMap = new Map<string, RateLimitInfo>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const info = rateLimitMap.get(ip);

  if (!info || now - info.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  info.count += 1;
  return info.count > RATE_LIMIT_MAX_REQUESTS;
}

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
      });
      if (errorBody) {
        console.error('[captchaSolver] CAPTCHA API response body (truncated)', {
          snippet: errorBody.slice(0, 200),
        });
      }
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

    if (!extracted) {
      throw new Error('Failed to extract captcha text from external API response');
    }

    return extracted;
  } catch (error) {
    console.error(
      '[captchaSolver] Error while calling external CAPTCHA API:',
      (error as Error).message,
    );
    throw new Error('Failed to solve captcha using external CAPTCHA API');
  }
}

function setSecurityHeaders(res: http.ServerResponse) {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Protect against clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // HSTS: enforce HTTPS at the browser level (should be served over HTTPS in production)
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  );
  // Limit referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Basic CSP – this service only returns JSON; this mainly prevents accidental script execution
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self';",
  );
}

function sendJson(res: http.ServerResponse, statusCode: number, body: unknown) {
  setSecurityHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      sendJson(res, 400, { detail: 'Bad Request' });
      return;
    }

    const ip =
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.socket.remoteAddress) || 'unknown';

    const url = new URL(req.url, `http://${HOST || '127.0.0.1'}:${PORT}`);

    console.log('[request]', req.method, url.pathname, 'from', ip);

    // Basic CORS handling
    const origin = req.headers.origin;
    const allowedOrigin = ALLOWED_ORIGIN;

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
      setSecurityHeaders(res);
      res.statusCode = 204;
      res.end();
      return;
    }

    // Health check endpoint for load balancers / uptime probes
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/student/profile') {
      // Explicitly disallow credentials in query parameters
      const queryUsername = url.searchParams.get('username');
      const queryPassword = url.searchParams.get('password');
      if (queryUsername || queryPassword) {
        sendJson(res, 400, {
          detail:
            'Do not send credentials via query parameters. Use x-username and x-password headers instead.',
        });
        return;
      }

      // Basic per-IP rate limiting
      if (isRateLimited(ip)) {
        sendJson(res, 429, { detail: 'Too Many Requests' });
        return;
      }

      const headerUsername = req.headers['x-username'];
      const headerPassword = req.headers['x-password'];

      const username =
        typeof headerUsername === 'string' ? headerUsername.trim() : '';
      const password =
        typeof headerPassword === 'string' ? headerPassword.trim() : '';

      if (!username || !password) {
        sendJson(res, 400, {
          detail:
            'Missing credentials. Provide username and password via headers (x-username, x-password).',
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
        const rawMessage = (error as Error).message || 'UNKNOWN_ERROR';
        console.error(
          '[student/profile] Error while fetching student record:',
          (error as Error).message,
        );

        const allowedMessages = new Set([
          'CONNECTION_ERROR',
          'REMOTE_SERVICE_ERROR',
          'LOGIN_FAILED',
          'UNKNOWN_ERROR',
        ]);

        const safeMessage = allowedMessages.has(rawMessage)
          ? rawMessage
          : 'UNKNOWN_ERROR';

        sendJson(res, 500, { detail: safeMessage });
      }

      return;
    }

    sendJson(res, 404, { detail: 'Not Found' });
  } catch (error) {
    const message = (error as Error).message || 'Internal server error';
    console.error('[request] Unhandled error in HTTP handler:', error);
    sendJson(res, 500, { detail: 'UNKNOWN_ERROR' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Golestan Node server listening on http://${HOST}:${PORT}`);
});

server.on('error', err => {
  console.error('[server] HTTP server error:', err);
});