const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  try {
    let parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Rewrites as configured in vercel.json
    if (pathname === '/' || pathname === '') {
      pathname = '/pages/index.html';
    } else if (pathname === '/about' || pathname === '/about/') {
      pathname = '/pages/about.html';
    }

    let filePath = path.normalize(path.join(ROOT, pathname));

    // Prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        // Clean URL fallback (e.g. /pages/about -> /pages/about.html)
        if (fs.existsSync(filePath + '.html')) {
          filePath = filePath + '.html';
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h1>404 Not Found</h1><p>The requested URL <code>${pathname}</code> was not found.</p><p><a href="/">Go to Home</a> | <a href="/about">Go to About</a></p>`);
          return;
        }
      } else if (stats.isDirectory()) {
        const indexFile = path.join(filePath, 'index.html');
        if (fs.existsSync(indexFile)) {
          filePath = indexFile;
        } else {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('403 Directory Listing Denied');
          return;
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error: ' + error.message);
  }
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n==============================================`);
    console.log(`  GSAP Bhavin Project Server is Running!`);
    console.log(`  Local URL:   http://localhost:${port}`);
    console.log(`  Home Page:   http://localhost:${port}/`);
    console.log(`  About Page:  http://localhost:${port}/about`);
    console.log(`==============================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    PORT += 1;
    startServer(PORT);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
