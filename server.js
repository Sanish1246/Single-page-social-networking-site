import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './db.js';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import { ObjectId } from 'mongodb';

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
    res.status(200).json({});
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
        user.savedPosts=[];
        user.profileImg='/images/default-photo.jpg'
    
        const result = await db.collection('Users').insertOne(user);
        req.session.user = {
          username: user.username,
          email: user.email,
          password: user.password,
          followers:user.followers,
          following:user.following,
          profileImg:'/images/default-photo.jpg',
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
            profileImg: result.profileImg || '/images/default-photo.jpg',
            savedPosts: result.savedPosts || []
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
        const { owner, title, content, tags, date, time, level} = req.body;

        const likedBy=[];
        const dislikedBy=[];
    
        // Controlla se ci sono file caricati
        let mediaFiles = req.files ? req.files.media : null;
    
        const uploadDir = path.join(__dirname, 'uploads');

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }
    
        const savedFiles = [];
        if (mediaFiles) {
          const fileArray = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];
          for (const file of fileArray) {
            const filePath = path.join('/uploads', file.name);  
            await file.mv(path.join(uploadDir, file.name)); 
            savedFiles.push({
              name: file.name,
              path: filePath  
            });
          }
        }
    
        const newPost = {
          owner,
          title,
          content,
          tags,
          level: parseInt(level),
          likedBy,
          dislikedBy,
          date,
          time,
          media: savedFiles.length ? savedFiles : undefined  
        };
    
        await db.collection('Posts').insertOne(newPost);
    
        res.json({ message: '✅ Post uploaded successfully!' });
    
      } catch (error) {
        res.status(500).json({ message: '❌ An error occurred.', error: error.message });
      }
    });


    app.get('/M00980001/user/posts', async (req, res) => {
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
    
    app.get('/M00980001/people', async (req, res) => {
      const currentUser=req.session.user.username;
    
      try {
        const users = await db.collection('Users').find({ username: { $ne: currentUser } }).toArray();
        res.status(200).json(users);
      } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });

    app.post('/M00980001/follow/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = req.params.id;    
      try {
        
        await db.collection('Users').updateOne(
          { username: currentUser },
          { $push: { following: targetId } }
        );
    
        await db.collection('Users').updateOne(
          { username: targetId },
          { $push: { followers: currentUser } }
        );

        req.session.user.following.push(targetId);
    
        res.status(200).json({ message: 'Follow action successful' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.delete('/M00980001/unfollow/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = req.params.id;
    
      try {
        
        await db.collection('Users').updateOne(
          { username: currentUser },
          { $pull: { following: targetId } }
        );
    
        await db.collection('Users').updateOne(
          { username: targetId },
          { $pull: { followers: currentUser } }
        );

        req.session.user.following = req.session.user.following.filter(user => user !== targetId);
    
        res.status(200).json({ message: 'Unfollow action successful' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.get('/M00980001/feed', async (req, res) => {
      const currentUser=req.session.user.username;
    
      try {
        const posts = await db.collection('Posts').find({ owner: { $ne: currentUser } }).toArray();
        console.log("Posts for feed:", currentUser);
        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });


    app.get('/M00980001/latest', async (req, res) => {
      try {
        const posts = await db.collection('Posts').find().toArray();
        console.log("Posts for feed:", posts);
        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });

    app.get('/M00980001/postOwner/:id', async (req, res) => {
      try {
        const user = await db.collection('Users').findOne({username: req.params.id});
        res.status(200).json(user);
      } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });

    app.post('/M00980001/uploadProfilePicture', async (req, res) => {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

      let uploadedFile = req.files.media;
    
      const uploadPath = __dirname + '/uploads/' + uploadedFile.name;

      req.session.user.profileImg=uploadPath;
    
      uploadedFile.mv(uploadPath, async function(err) {
        if (err) {
          return res.status(500).send(err);
        }
    
        try {
          await db.collection('Users').updateOne(
            { username: req.session.user.username },
            { $set: { profileImg: '/uploads/' + uploadedFile.name } }
          );
    
          res.json({ message: 'File uploaded successfully', path: '/uploads/' + uploadedFile.name });
          
        } catch (dbErr) {
          console.error('Error updating profile image in the database:', dbErr);
          res.status(500).json({ error: 'Failed to update profile image in the database.' });
        }
      });
    });

    app.post('/M00980001/like/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = new ObjectId(req.params.id);    
      try {
        
        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $addToSet: { likedBy: currentUser } }
        );

        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $inc: { level:1} }
        );

        console.log('Post liked successfully');
        res.status(200).json({ message: 'Post liked' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.delete('/M00980001/removeLike/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = new ObjectId(req.params.id);    
      try {
        
        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $pull: { likedBy: currentUser } }
        );

        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $inc: { level:-1} }
        );

        console.log('Like removed successfully');
        res.status(200).json({ message: 'Like removed successfully' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.post('/M00980001/dislike/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = new ObjectId(req.params.id);    
      try {
        
        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $addToSet: { dislikedBy: currentUser } }
        );

        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $inc: { level:-1} }
        );

        console.log('Post Disliked successfully');
        res.status(200).json({ message: 'Post disliked' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.delete('/M00980001/removeDislike/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = new ObjectId(req.params.id);    
      try {
        
        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $pull: { dislikedBy: currentUser } }
        );

        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $inc: { level:1} }
        );

        console.log('Dislike removed successfully');
        res.status(200).json({ message: 'Dislike removed' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.post('/M00980001/save/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = new ObjectId(req.params.id);    
      try {
        
        await db.collection('Users').updateOne(
          { username: currentUser},
          { $push: { savedPosts: targetId } }
        );

        console.log('Post saved successfully');
        res.status(200).json({ message: 'Post saved' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.delete('/M00980001/removeSaved/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const targetId = new ObjectId(req.params.id);    
      try {
        
        await db.collection('Users').updateOne(
          { username: currentUser },
          { $pull: { savedPosts: targetId } }
        );

        console.log('Post unsaved successfully');
        res.status(200).json({ message: 'Post unsaved' });
      } catch (err) {
        console.error('Error updating follow data:', err);
        res.status(500).json({ error: 'Error processing follow action' });
      }
    });

    app.get('/M00980001/savedPosts', async (req, res) => {
      try {
        // Trova l'utente corrente per accedere al suo array savedPosts
        const user = await db.collection('Users').findOne({ username: currentUser });
    
        if (!user || !user.savedPosts || user.savedPosts.length === 0) {
          return res.status(200).json([]); // Se non ci sono post salvati, ritorna un array vuoto
        }
    
        // Trova i post il cui _id è nell'array savedPosts dell'utente
        const posts = await db.collection('Posts').find({
          _id: { $in: user.savedPosts }
        }).toArray(); // Converti il risultato in un array
    
        console.log("Saved posts for user:", currentUser);
        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching saved posts:', err);
        res.status(500).json({ error: 'Error fetching saved posts' });
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

