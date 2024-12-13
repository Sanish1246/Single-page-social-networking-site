import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/login', (req, res) => {
  const user = req.body;
  const db = req.app.locals.db;

  db.collection('Users')
    .findOne({ email: user.email })
    .then(result => {
      if (!result) return res.status(401).json({ error: "Invalid email" });
      if (result.password !== user.password) return res.status(401).json({ error: "Invalid password" });

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
    .catch(err => res.status(500).json({ error: "Internal server error" }));
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      username: req.session.user.username,
      email: req.session.user.email,
      followers: req.session.user.followers,
      following: req.session.user.following,
      profileImg: req.session.user.profileImg,
      savedPosts: req.session.user.savedPosts,
      favGames: req.session.user.favGames,
      favTags: req.session.user.favTags
    });
  } else {
    res.status(200).json({error: "Error"});
  }
});

router.post('/users', async (req, res) => {
  const user = req.body;
  const db = req.app.locals.db;

  try {
    const usernameExists = await db.collection('Users').findOne({ username: user.username });
    if (usernameExists) return res.status(401).json({ error: "Username already in use!" });

    const emailExists = await db.collection('Users').findOne({ email: user.email });
    if (emailExists) return res.status(401).json({ error: "Email already in use!" });

    user.followers = [];
    user.following = [];
    user.savedPosts = [];

    const result = await db.collection('Users').insertOne(user);
    req.session.user = {
      username: user.username,
      email: user.email,
      password: user.password,
      followers: user.followers,
      following: user.following,
      profileImg: '/images/default-photo.jpg',
      savedPosts: [],
      favGames: [],
      favTags: []
    };

    res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/login', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.status(200).json({ message: "User logged out successfully" });
  });
});

export default router;
