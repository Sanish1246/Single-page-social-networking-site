import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const hostname = 'localhost';
const port = 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/M00980001', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', (req, res) =>{

})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

