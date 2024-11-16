import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './db.js';

const app = express();
const hostname = 'localhost';
const port = 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/M00980001', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
  try {
    const client = await connectToDb();
    const db = client.db("CurrentUser");

    app.post('/M00980001/register', (req, res) => {
      const user = req.body;

      db.collection('Users')
        .insertOne(user)
        .then(result => {
          res.status(201).json({
            message: "User registered successfully",
            userId: result.insertedId  // Invia solo l'ID dell'utente inserito
          });
        })
        .catch(err => {
          res.status(500).json({ error: "Invalid data" });
        });
    });

    // Seleziona una collezione
    const collection = db.collection('CurrentUser');

    // Esegui un'operazione (ad esempio, trovare documenti)
    const documents = await collection.find({}).toArray();
    console.log("Documents:", documents);

    // Avvia il server Express
    app.listen(port, () => {
      console.log(`Server listening on http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("Errore durante l'avvio del server:", error);
  }
}

startServer();

