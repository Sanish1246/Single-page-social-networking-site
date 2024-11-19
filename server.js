import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './db.js';
import session from 'express-session';
import { error } from 'console';

const app = express();
const hostname = 'localhost';
const port = 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(session({
  secret: 'Sanish12',  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }    
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/M00980001', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00980001/user', (req, res) => {
  if (req.session.user) {
    return res.status(200).json(req.session.user);
  } else {
    return res.status(401).json({ error: 'Not logged in' });
  }
});

async function startServer() {
  try {
    const client = await connectToDb();
    const db = client.db("CurrentUser");

    app.post('/M00980001/register', async (req, res) => {
      const user = req.body;
    
      try {
        const usernameExists = await db.collection('Users').findOne({ username: user.username });
        if (usernameExists) {
          return res.status(401).json({ error: "Username already in use!" });
        }
    
        const emailExists = await db.collection('Users').findOne({ email: user.email });
        if (emailExists) {
          return res.status(401).json({ error: "Email already in use!" });
        }
    
        const result = await db.collection('Users').insertOne(user);
        res.status(201).json({
          message: "User registered successfully",
          userId: result.insertedId
        });
    
        req.session.user = {
          username: user.username,
          email: user.email,
          password: user.password
        };
    
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
    

    app.post('/M00980001/login', (req, res) => {
      const user = req.body;

      db.collection('Users')
        .findOne({ email: user.email})
        .then(result => {
          if (!result) {
            return res.status(401).json({ error: "Invalid email" });
          }
          if(result.password!=user.password){
            return res.status(401).json({ error: "Invalid password" });
          }
          req.session.user = {
            username: result.username,
            email: result.email,
            password: result.password 
          };
          res.status(200).json({
            message: "User logged in! " + result.username,
            userId: result._id
          });
        })
        .catch(err => {
          res.status(500).json({ error: "Internal server error" });
        });
    });

    app.post('/M00980001/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.status(200).json({ message: "✅ User logged out successfully" });
      });
    });

    app.post('/M00980001/publish', (req, res) => {
      // Recupera i dati dal form
      const { title, content, tags, owner, date, time } = req.body;
      
      // Verifica se un file è stato caricato
      if (req.files && req.files.media) {
        const media = req.files.media; // Gestisce un singolo file o array di file
    
        // Percorso dove salvare i file localmente
        const uploadPath = path.join(__dirname, 'uploads', media.name);
        
        // Salva il file localmente
        media.mv(uploadPath, (err) => {
          if (err) {
            return res.status(500).send(err);
          }
    
          // Salva i dati del post e il percorso del file su MongoDB
          const post = {
            owner,
            title,
            content,
            tags: tags.split(','), // Trasforma la stringa dei tag in array
            date,
            time,
            mediaPath: uploadPath // Salva il percorso del file nel database
          };
    
          db.collection('Posts').insertOne(post, (err, result) => {
            if (err) {
              return res.status(500).send({ error: "An error has occurred" });
            }
            res.send({ message: "Post uploaded" });
          });
        });
      } else {
        // Se non ci sono file, salva solo i dati testuali
        const post = {
          owner,
          title,
          content,
          tags: tags.split(','),
          date,
          time,
          mediaPath: null // Nessun file, quindi nessun percorso media
        };
    
        db.collection('Posts').insertOne(post, (err, result) => {
          if (err) {
            return res.status(500).send({ error: "An error has occurred" });
          }
          res.send({ message: "Post uploaded" });
        });
      }
    });

    app.listen(port, () => {
      console.log(`Server listening on http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("Error upon starting the server:", error);
  }
}

startServer();

