import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  getStudentRecord,
  GolestanCredentials,
} from './golestan/golestanStudent';

const PORT = 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execFileAsync = promisify(execFile);

process.on('uncaughtException', err => {
  console.error('[uncaughtException]', err);
});

process.on('unhandledRejection', reason => {
  console.error('[unhandledRejection]', reason);
});

/**
 * Captcha solver that delegates to the Python TensorFlow/Keras model.
 *
 * Behavior:
 * - Saves the captcha image to a temporary PNG file
 * - Runs server/python/captcha_wrapper.py as a child process
 * - Reads the predicted text from STDOUT
 * - Deletes the temporary file and returns the recognized text
 *
 * You can override the Python binary by setting the PYTHON_BIN environment variable.
 */
async function captchaSolver(image: Buffer): Promise<string> {
  const tmpDir = path.join(__dirname, '..', 'tmp', 'captchas');
  await fs.mkdir(tmpDir, { recursive: true });

  const filename = `captcha-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.png`;
  const tempImagePath = path.join(tmpDir, filename);

  await fs.writeFile(tempImagePath, image);

  const pythonBin =
    process.env.PYTHON_BIN ||
    (process.platform === 'win32' ? 'python' : 'python3');
  const scriptPath = path.join(__dirname, 'python', 'captcha_wrapper.py');

  try {
    console.log('[captchaSolver] Calling Python solver', {
      pythonBin,
      scriptPath,
      tempImagePath,
    });

    const { stdout } = await execFileAsync(pythonBin, [scriptPath, tempImagePath], {
      maxBuffer: 1024 * 1024, // 1MB should be plenty for a short prediction
    });

    const prediction = stdout.toString().trim();

    if (!prediction) {
      throw new Error('Empty captcha prediction from Python solver');
    }

    return prediction;
  } catch (error) {
    console.error('Error while running Python captcha solver:', error);
    throw new Error('Failed to solve captcha using Python solver');
  } finally {
    try {
      await fs.unlink(tempImagePath);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        console.warn('Failed to delete temporary captcha image:', err);
      }
    }
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