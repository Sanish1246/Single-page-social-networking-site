import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './db.js';
import session from 'express-session';
import { error } from 'console';
import fileUpload from 'express-fileupload';
import fs from 'fs';

const app = express();
const hostname = 'localhost';
const port = 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(fileUpload());

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
    res.status(200).json({
      username: req.session.user.username,
      email: req.session.user.email,
      password: req.session.user.password, 
      followers: req.session.user.followers,
      following: req.session.user.following,
      profileImg: req.session.user.profileImg
    });
  } else {
    res.status(401).json({ error: "No user logged in" });
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

        user.followers = [];
        user.following = [];
        user.profileImagePath = 'public/images/default-profile.png';
    
        const result = await db.collection('Users').insertOne(user);
        req.session.user = {
          username: user.username,
          email: user.email,
          password: user.password,
          followers:user.followers,
          following:user.following,
          profileImg:'public/images/default-profile.png',
        };
        res.status(201).json({
          message: "User registered successfully",
          userId: result.insertedId
        });
    
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
            password: result.password,
            followers: result.followers || [], 
            following: result.following || [], 
            profileImg: result.profileImg || 'public/images/default-profile.png' 
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

    app.delete('/M00980001/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.status(200).json({ message: "✅ User logged out successfully" });
      });
    });

    app.post('/M00980001/publish', async (req, res) => {
      try {
        const { owner, title, content, tags, date, time, level } = req.body;
    
        // Controlla se ci sono file caricati
        let mediaFiles = req.files ? req.files.media : null;
    
        const uploadDir = path.join(__dirname, 'uploads');
    
        // Verifica se la cartella di destinazione esiste, altrimenti la crea
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }
    
        // Se vengono caricati file, salvali sul server
        const savedFiles = [];
        if (mediaFiles) {
          const fileArray = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];
          for (const file of fileArray) {
            const filePath = path.join(uploadDir, file.name);
            await file.mv(filePath);  // Salva il file
            savedFiles.push({
              name: file.name,
              path: filePath
            });
          }
        }
    
        // Crea un nuovo oggetto post (incluso solo se i file sono presenti)
        const newPost = {
          owner,
          title,
          content,
          tags,
          level: parseInt(level),
          date,
          time,
          media: savedFiles.length ? savedFiles : undefined  // Salva solo se ci sono file
        };
    
        // Inserisci il post nella collezione di MongoDB
        await db.collection('Posts').insertOne(newPost);
    
        // Risposta di successo
        res.json({ message: '✅ Post uploaded successfully!' });
    
      } catch (error) {
        res.status(500).json({ message: '❌ An error occurred.', error: error.message });
      }
    });


    app.get('/M00980001/user/posts', async (req, res) => {
      console.log(req.session.user.username);
      const currentUser=req.session.user.username;
    
      try {
        const posts = await db.collection('Posts').find({ owner: currentUser }).toArray();
        console.log("Posts for user:", currentUser);
        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
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

