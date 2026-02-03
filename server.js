const http = require('http');
const fs = require('fs');
const path = require('path');
const { transform } = require('sucrase');

const port = process.env.PORT || 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  // Prevent directory traversal and normalize path
  const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  // Remove query strings
  let filePath = '.' + safePath.split('?')[0];
  
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = path.extname(filePath).toLowerCase();

  const serveFile = (targetPath, contentType, transformCode = false) => {
    fs.readFile(targetPath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // SPA Fallback: serve index.html for non-asset routes
          if (!extname) {
             fs.readFile('./index.html', (err, indexContent) => {
                if (err) {
                   res.writeHead(500);
                   res.end('Error loading index.html');
                } else {
                   res.writeHead(200, { 'Content-Type': 'text/html' });
                   res.end(indexContent, 'utf-8');
                }
             });
          } else {
             res.writeHead(404);
             res.end('Not found');
          }
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        }
      } else {
        if (transformCode) {
          try {
            // Transform TypeScript/JSX to JS on the fly using Sucrase
            // transforms: ['typescript', 'jsx'] keeps imports as ESM (import/export), which browsers support
            const result = transform(content.toString(), {
              transforms: ['typescript', 'jsx'],
              filePath: targetPath,
              production: true
            });
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(result.code, 'utf-8');
          } catch (e) {
            console.error('Transpilation Error:', e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Transpilation Error: ' + e.message);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      }
    });
  };

  // 1. Exact match for static files
  if (mimeTypes[extname]) {
    serveFile(filePath, mimeTypes[extname]);
    return;
  }

  // 2. Explicit .tsx/.ts requests
  if (extname === '.tsx' || extname === '.ts') {
    serveFile(filePath, 'application/javascript', true);
    return;
  }

  // 3. Extensionless import resolution (e.g. import App from './App')
  if (!extname) {
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    let foundPath = null;
    let needsTransform = false;
    
    for (const ext of extensions) {
      if (fs.existsSync(filePath + ext)) {
        foundPath = filePath + ext;
        needsTransform = (ext === '.tsx' || ext === '.ts' || ext === '.jsx');
        break;
      }
    }

    if (foundPath) {
      const type = 'application/javascript';
      serveFile(foundPath, type, needsTransform);
      return;
    }
  }

  // Fallback
  serveFile(filePath, 'application/octet-stream');
});

// Explicitly bind to 0.0.0.0 to ensure Cloud Run health checks pass
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});