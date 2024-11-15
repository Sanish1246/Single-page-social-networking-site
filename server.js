const express = require('express');
const path = require('path');
const app = express();

const hostname = 'localhost';
const port = 8000;

// Servire file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servire 'index.html' per il percorso /M00980001
app.get('/M00980001', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avvio del server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
