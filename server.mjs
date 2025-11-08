// server.mjs — jeden serwer: statyki (dist/public) + API (app.json)
import path from 'path';
import { fileURLToPath } from 'url';
import jsonServer from 'json-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();

// statyki: najpierw build Vite (dist), potem pliki z public (obrazy/mp3)
server.use(jsonServer.defaults({ static: path.join(__dirname, 'dist'), noCors: true }));
server.use(jsonServer.defaults({ static: path.join(__dirname, 'public'), noCors: true }));

// API z app.json (w root projektu)
const router = jsonServer.router(path.join(__dirname, 'app.json'));
server.use(router);

const port = process.env.PORT || 3131;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
