const express = require('express');
const path = require('path');
const app = express();


const hostname = 'localhost';
const port = 8000;


// Servire file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Definire la rotta per la home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});