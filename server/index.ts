import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getStudentRecord,
  GolestanCredentials,
} from './golestan/golestanStudent';

const PORT = 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Placeholder captcha solver (Option B).
 *
 * Current behavior:
 * - Saves the captcha image to disk under ./tmp/captchas/
 * - Throws an error instructing you to implement a real solver
 *
 * To integrate your own OCR:
 * - Replace the body of this function with a call to your OCR service
 *   that returns the recognized text as a string.
 */
async function captchaSolver(image: Buffer): Promise<string> {
  const outputDir = path.join(__dirname, '..', 'tmp', 'captchas');
  await fs.mkdir(outputDir, { recursive: true });

  const filename = `captcha-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.png`;
  const filePath = path.join(outputDir, filename);

  await fs.writeFile(filePath, image);

  const message =
    `CAPTCHA_SOLVER_NOT_IMPLEMENTED: Captcha image saved to ${filePath}. ` +
    'Open this image to see the captcha text, then either implement an OCR-based ' +
    'captchaSolver in server/index.ts or integrate your own external service.';

  console.error(message);
  throw new Error(message);
}

function sendJson(res: http.ServerResponse, statusCode: number, body: unknown) {
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
        sendJson(res, 500, { detail: message });
      }

      return;
    }

    sendJson(res, 404, { detail: 'Not Found' });
  } catch (error) {
    const message = (error as Error).message || 'Internal server error';
    sendJson(res, 500, { detail: message });
  }
});

server.listen(PORT, () => {
  console.log(`Golestan Node server listening on http://localhost:${PORT}`);
});