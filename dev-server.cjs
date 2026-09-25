const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 8765);
const contentTypes = {
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer from 1 to 65535');
}

http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.split(/[\\/]/).some(segment => segment.startsWith('.'))) {
      response.writeHead(403).end();
      return;
    }

    let filePath = path.resolve(root, `.${pathname}`);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }

    let stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stats = await fs.promises.stat(filePath);
    }
    if (!stats.isFile()) {
      response.writeHead(404).end();
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': 'no-store'
    });
    if (request.method === 'HEAD') {
      response.end();
    } else {
      fs.createReadStream(filePath).pipe(response);
    }
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 400).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`PokeChill dev server: http://127.0.0.1:${port}/`);
});
