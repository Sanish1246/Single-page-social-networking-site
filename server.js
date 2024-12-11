import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './db.js';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import dotenv from 'dotenv'; 
import puppeteer from 'puppeteer'
import { error } from 'console';

const app = express();
dotenv.config();
const apiKey= process.env.API_KEY;
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

app.get('/M00980001', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00980001/login', (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      username: req.session.user.username,
      email: req.session.user.email,
      password: req.session.user.password, 
      followers: req.session.user.followers,
      following: req.session.user.following,
      profileImg: req.session.user.profileImg,
      savedPosts: req.session.user.savedPosts,
      favGames:req.session.user.favGames,
      favTags:req.session.user.favTags
    });
  } else {
    res.status(200).json({error});
  }
});

async function startServer() {
  try {
    const client = await connectToDb();
    const db = client.db("CurrentUser");

    app.post('/M00980001/users', async (req, res) => {
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
    
        const result = await db.collection('Users').insertOne(user);
        req.session.user = {
          username: user.username,
          email: user.email,
          password: user.password,
          followers:user.followers,
          following:user.following,
          profileImg:'/images/default-photo.jpg',
          savedPosts:[],
          favGames:[],
          favTags:[]
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
            savedPosts: result.savedPosts || [],
            favGames: result.favGames || [],
            favTags: result.favTags || []
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

    app.delete('/M00980001/login', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.status(200).json({ message: "✅ User logged out successfully" });
      });
    });

    app.post('/M00980001/contents', async (req, res) => {
      try {
        const { owner, title, content, tags, date, time, level} = req.body;

        const likedBy=[];
        const dislikedBy=[];

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
          media: savedFiles.length ? savedFiles : undefined,
          comments:[]
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
        res.status(500).json({ error: 'Error fetching users' });
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

    app.delete('/M00980001/follow/:id', async (req, res) => {
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
        console.error('Error updating unfollow data:', err);
        res.status(500).json({ error: 'Error processing unfollow action' });
      }
    });

    app.get('/M00980001/contents/:id', async (req, res) => {
      const currentUser=req.session.user.username;
      const sortBy=req.params.id;
    
      try {
        let posts = await db.collection('Posts').find({ owner: { $ne: currentUser } }).toArray();
        if (sortBy==="recent"){
          posts=posts.reverse();
        } else if (sortBy === "level") {
          posts = posts.sort((a, b) => b.level - a.level);
        } else if (sortBy === "comments") {
          posts = posts.sort((a, b) => b.comments.length - a.comments.length);
        }
        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });


    app.get('/M00980001/latest/:id', async (req, res) => {
      const sortBy=req.params.id;

      try {
        let posts = await db.collection('Posts').find().toArray();
        if (sortBy==="recent"){
          posts=posts.reverse();
        } else if (sortBy === "level") {
          posts = posts.sort((a, b) => b.level - a.level);
        } else if (sortBy === "comments") {
          posts = posts.sort((a, b) => b.comments.length - a.comments.length);
        }
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
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Error fetching user' });
      }
    });

    app.post('/M00980001/uploadProfilePicture', async (req, res) => {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

      let uploadedFile = req.files.media;
    
      const uploadPath = __dirname + '/uploads/' + uploadedFile.name;

      req.session.user.profileImg= '/uploads/' + uploadedFile.name;
    
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

        res.status(200).json({ message: 'Post liked' });
      } catch (err) {
        console.error('Error with liking post:', err);
        res.status(500).json({ error: 'Error processing like action' });
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

        res.status(200).json({ message: 'Like removed successfully' });
      } catch (err) {
        console.error('Error updating like data:', err);
        res.status(500).json({ error: 'Error processing removing like action' });
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

        res.status(200).json({ message: 'Post disliked' });
      } catch (err) {
        console.error('Error updating dislike data:', err);
        res.status(500).json({ error: 'Error processing dislike action' });
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

        res.status(200).json({ message: 'Dislike removed' });
      } catch (err) {
        console.error('Error updating dislike data:', err);
        res.status(500).json({ error: 'Error processing remove dislike action' });
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

        res.status(200).json({ message: '✅ Post saved' });
      } catch (err) {
        console.error('Error updating save data:', err);
        res.status(500).json({ error: 'Error processing save action' });
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

        res.status(200).json({ message: '✅Post unsaved' });
      } catch (err) {
        console.error('Error updating save data:', err);
        res.status(500).json({ error: 'Error processing unsave action' });
      }
    });

    app.get('/M00980001/savedPosts', async (req, res) => {
      const currentUser = req.session.user.username;
      try {
        
        const user = await db.collection('Users').findOne({ username: currentUser });
    
        if (!user || !user.savedPosts || user.savedPosts.length === 0) {
          return res.status(200).json([]); 
        }
    
        const posts = await db.collection('Posts').find({
          _id: { $in: user.savedPosts }
        }).toArray(); 

        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching saved posts:', err);
        res.status(500).json({ error: 'Error fetching saved posts' });
      }
    });

    app.get('/M00980001/following', async (req, res) => {
      const currentUser = req.session.user.username;
      try {
        
        const user = await db.collection('Users').findOne({ username: currentUser });
    
        if (!user || !user.savedPosts || user.savedPosts.length === 0) {
          return res.status(200).json([]); 
        }
    
        const posts = await db.collection('Posts').find({
          owner: { $in: user.following }
        }).toArray(); 

        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching following:', err);
        res.status(500).json({ error: 'Error fetching following' });
      }
    });

    app.get('/M00980001/comments/:id', async (req, res) => {
      const targetId = new ObjectId(req.params.id); 
      try {
        const post = await db.collection('Posts').findOne({_id: targetId});
        res.status(200).json(post.comments);
      } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Error fetching comments' });
      }
    });

    app.post('/M00980001/comment/:id', async (req, res) => {
      const comment=req.body;
      const targetId = new ObjectId(req.params.id);  
      console.log("Trying to update");
      try {
        
        await db.collection('Posts').updateOne(
          { _id: targetId },
          { $push: { comments: comment } }
        );

        res.status(200).json({ message: '✅ Comment posted' });
      } catch (err) {
        console.error('Error updating comment data:', err);
        res.status(500).json({ error: 'Error processing comment action' });
      }
    });

    app.get('/M00980001/users/search/:id', async (req, res) => {
      const targetName=req.params.id;
    
      try {
        const users = await db.collection('Users').find({
          username: { $regex: targetName, $options: 'i' }
        }).toArray();
        res.status(200).json(users);
      } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
      }
    });

    app.get('/M00980001/contents/search/:id/:filter', async (req, res) => {
      const targetContent=req.params.id;
      const filter=req.params.filter;
    
      try {
        let posts = await db.collection('Posts').find({
          content: { $regex: targetContent, $options: 'i' }
        }).toArray();

        if (filter==="recent"){
          posts=posts.reverse();
        } else if (filter === "level") {
          posts = posts.sort((a, b) => b.level - a.level);
        } else if (filter === "comments") {
          posts = posts.sort((a, b) => b.comments.length - a.comments.length);
        }

        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });

    app.get('/M00980001/profile/:id', async (req, res) => {
      const targetUser=req.params.id;

      try {
        const user = await db.collection('Users').findOne({ username: targetUser});
        res.status(200).json(user);
      } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Error fetching user' });
      }
    });

    app.get('/M00980001/posts/:id', async (req, res) => {
      const user=req.params.id;
    
      try {
        const posts = await db.collection('Posts').find({ owner: user}).toArray();
        res.status(200).json(posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
      }
    });

    app.get('/M00980001/games/:id', async (req, res) => {
      const pageNo=req.params.id;
      const favTags=req.session.user.favTags;
      let url='';

      try {
        if (favTags.length>0) {
          let frequency = {};
          let maxCount = 0;
          let maxTag = null;
        
          for (let i = 0; i < favTags.length; i++) {
            let item = favTags[i];
            frequency[item] = (frequency[item] || 0) + 1;
        
            if (frequency[item] > maxCount) {
              maxCount = frequency[item];
              maxTag = item;
            }
          }
          maxTag=maxTag.toLowerCase();
          console.log(maxTag);
          url = `https://api.rawg.io/api/games?key=${apiKey}&genres=${maxTag}&page=${pageNo}`;
        } else {
          url = `https://api.rawg.io/api/games?key=${apiKey}&page=${pageNo}`;
          console.log("No favTags")
        }
        const games = await axios.get(url);
    
        const allGames = games.data.results.map(game => ({
          name: game.name,
          genre: game.genres.map(genre => genre.name).join(', '), 
          image: game.background_image,
          rating: game.rating
        }));
    
        res.status(200).json(allGames); 
      } catch (err) {
        console.error('Error fetching games:', err);
        res.status(500).json({ error: 'Error fetching games' });
      }
    });

    app.post('/M00980001/addFavourite', async (req, res) => {
      const currentUser = req.session.user.username;
      const newGame=req.body;  
      try {
        
        await db.collection('Users').updateOne(
          { username: currentUser},
          { $push: { favGames: newGame} }
        );

        res.status(200).json({ message: '✅ Game saved' });
      } catch (err) {
        console.error('Error updating favourite data:', err);
        res.status(500).json({ error: 'Error processing favourite action' });
      }
    });

    app.delete('/M00980001/removeFavourite/:id', async (req, res) => {
      const currentUser = req.session.user.username;
      const newGame=req.params.id;  

      try {
        await db.collection('Users').updateOne(
          { username: currentUser },
          { $pull: { favGames: { name: newGame } } }
        );
        res.status(200).json({ message: '✅ Game removed from favourites' });
      } catch (err) {
        console.error('Error updating unfavourite data:', err);
        res.status(500).json({ error: 'Error processing unfavourite action' });
      }
    });

    app.get('/M00980001/showFavourite', async (req, res) => {
      const currentUser = req.session.user.username;
      try {
    
        const user = await db.collection('Users').findOne({ username: currentUser });

        res.status(200).json(user.favGames);
      } catch (err) {
        console.error('Error updating user data:', err);
        res.status(500).json({ error: 'Error processing user action' });
      }
    });

    app.get('/M00980001/searchGame/:game/:id', async (req, res) => {
      const pageNo=req.params.id;
      const targetGame=req.params.game;
      try {
        const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${targetGame}&page=${pageNo}`;
        const games = await axios.get(url);
    
        const allGames = games.data.results.map(game => ({
          name: game.name,
          genre: game.genres.map(genre => genre.name).join(', '), 
          image: game.background_image,
          rating: game.rating
        }));
    
        res.status(200).json(allGames); 
      } catch (err) {
        console.error('Error fetching games:', err);
        res.status(500).json({ error: 'Error fetching games' });
      }
    });

    app.get('/M00980001/news/:page', async (req, res) => {
      let page = req.params.page;
      let limit = 10;

      let skip = (page - 1) * limit;
      try {
         if (page==1){
          const browser = await puppeteer.launch({ headless: true });
          const page = await browser.newPage();
  
          await page.setRequestInterception(true);
          page.on('request', (req) => {
              if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                  req.abort();
              } else {
                  req.continue();
              }
          });
  
          await page.goto('https://www.ign.com/news', { timeout: 60000, waitUntil: 'domcontentloaded' });
          await page.waitForSelector('.item-body', { timeout: 60000 });
  
          let news = await page.evaluate(() => {
              const newsElements = document.querySelectorAll('.item-body');
              const newsArray = [];
  
              for (const newsElement of newsElements) {
                  const isGameNews = newsElement.querySelector('[data-cy="icon-game-object"]');
  
                  if (isGameNews) {
                      const newsTitle = newsElement.querySelector('.item-title')?.innerText;
                      const newsImgElement = newsElement.querySelector('.item-thumbnail img');
                      const newsLink = newsElement.getAttribute('href');
                      let newsImg = newsImgElement?.src;
  
                      if (newsImg.includes('dpr=')) {
                          newsImg = newsImg.replace(/dpr=\d+/, 'dpr=2');
                      }
  
                      const newsContent = newsElement.querySelector('.item-subtitle')?.innerText;
                      let cleanNewsContent = newsContent ? newsContent.split(' - ').slice(1).join(' - ') : null;
  
                      if (newsTitle && newsImg) {
                          newsArray.push({
                              title: newsTitle,
                              img: newsImg,
                              content: cleanNewsContent,
                              link: `https://www.ign.com${newsLink}`
                          });
                      }
                  }
              }
              return newsArray;
          });
  
          await browser.close();
  
          news = news.reverse();
  
              for (const article of news) {
                  await db.collection('News').updateOne(
                      { link: article.link },
                      { $set: article },
                      { upsert: true }
                  );
              }
          console.log("Page 1")    
         }

          let allNews = await db.collection('News')
          .find()
          .sort({ _id: -1 }) 
          .skip(skip) 
          .limit(limit) 
          .toArray();
  
          res.status(200).json(allNews);
  
      } catch (err) {
          console.error('Error fetching news:', err);
          res.status(500).json({ error: 'Error fetching news' });
      }
  });

  app.post('/M00980001/tags', async (req, res) => {
    const currentUser=req.session.user.username;
    const newFavTags=req.session.user.favTags;

    const newTags=req.body;

    for (const newTag of newTags) {
      if (newFavTags.length===30){
        newFavTags.shift();
      }

      if(newTag.toLowerCase().contains("rpg") ||newTag.toLowerCase().contains("role play") ) {
        newTag="role-playing-games-rpg";
      } else if (newTag.toLowerCase().contains("open world") || newTag.toLowerCase().contains("exploration")){
        newTag="adventure";
      } else if (newTag.toLowerCase().contains("tactic")){
        newTag="strategy";
      } else if (newTag.toLowerCase().contains("fps") || newTag.toLowerCase().contains("shoot")){
        newTag="shooter";
      } else if (newTag.toLowerCase().contains("mmo")){
        newTag="massively-multiplayer";
      } else if (newTag.toLowerCase().contains("board")){
        newTag="board-games";
      } else if (newTag.toLowerCase().contains("tcg")){
        newTag="cards";
      }
      newFavTags.push(newTag.toLowerCase());
    }

    try {
      await db.collection('Users').updateOne(
        { username: currentUser},
        {$set: {favTags: newFavTags}}
      );
      res.status(200).json({message: "Tags added"});
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error' });
    }
  });

  app.get('/M00980001/chat/:id', async (req, res) => {
    const otherUser=req.params.id;
    const currentUser=req.session.user.username;
  
    try {
      let chat = await db.collection('Chats').findOne(
        {$or:[{$and:[{user1: otherUser},{user2:currentUser}]},
        {$and:[{user2: otherUser},{user1:currentUser}]}]});

        if (!chat) {
          const newChat = {
            user1: currentUser,
            user2: otherUser,
            messages: [] 
          };
    
          const result = await db.collection('Chats').insertOne(newChat);
          chat = newChat; 
        }

      res.status(200).json(chat.messages);
    } catch (err) {
      console.error('Error fetching chat:', err);
      res.status(500).json({ error: 'Error fetching chat' });
    }
  });

  app.post('/M00980001/send/:id', async (req, res) => {
    const message=req.body;
    const currentUser=req.session.user.username;
    const otherUser=req.params.id;
  
    try {
      const chat = await db.collection('Chats').updateOne(
        {$or:[{$and:[{user1: otherUser},{user2:currentUser}]},
        {$and:[{user2: otherUser},{user1:currentUser}]}]},
        {$push: {messages : message}});

      res.status(200).json({message: "message added!"});
    } catch (err) {
      console.error('Error fetching message:', err);
      res.status(500).json({ error: 'Error fetching message' });
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

