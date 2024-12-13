//Route for the post and reactions
import express from 'express';
import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

//POST request to upload a post
router.post('/contents', async (req, res) => {
  const db = req.app.locals.db;
  const { owner, title, content, tags, date, time, level } = req.body;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const likedBy = [];
  const dislikedBy = [];

  let mediaFiles = req.files ? req.files.media : null;
  const uploadDir = path.join(__dirname, '../uploads');

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  //Uploading the media to the uploads folder
  const savedFiles = [];
  if (mediaFiles) {
    const fileArray = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];
    for (const file of fileArray) {
      const filePath = path.join('/uploads', file.name);
      await file.mv(path.join(uploadDir, file.name));
      savedFiles.push({ name: file.name, path: filePath });
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
    comments: []
  };

  try {
    await db.collection('Posts').insertOne(newPost);
    res.json({ message: 'Post uploaded successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred.', error: err.message });
  }
});

//GET request to get the feed posts
router.get('/feed/:id', async (req, res) => {
  const currentUser=req.session.user.username;
  const sortBy=req.params.id;
  const db = req.app.locals.db;

  try {
    //Getting all the posts, except the ones created by the current user
    let posts = await db.collection('Posts').find({ owner: { $ne: currentUser } }).toArray();
    //Sorting the posts
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

//GET request to get the latest post
router.get('/latest/:id', async (req, res) => {
  const sortBy=req.params.id;
  const db = req.app.locals.db;

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

//GET request to get the posts from users which are being followed
router.get('/contents', async (req, res) => {
  const db = req.app.locals.db;
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


//GET request to get the owner of a post
router.get('/postOwner/:id', async (req, res) => {
  const db = req.app.locals.db;
  try {
    const user = await db.collection('Users').findOne({username: req.params.id});
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});


// GET request to etch current user’s posts
router.get('/user/posts', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser = req.session.user.username;

  try {
    const posts = await db.collection('Posts').find({ owner: currentUser }).toArray();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

//GET request to fetch the posts of another user
router.get('/posts/:id', async (req, res) => {
  const db = req.app.locals.db;
  const user=req.params.id;

  try {
    const posts = await db.collection('Posts').find({ owner: user}).toArray();
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

//POST request to like a post
router.post('/like/:id', async (req, res) => {
  const db = req.app.locals.db;
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

//DELETE request to remove like from a post
router.delete('/removeLike/:id', async (req, res) => {
  const db = req.app.locals.db;
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

//POST request to dislike a post
router.post('/dislike/:id', async (req, res) => {
  const db = req.app.locals.db;
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

//DELETE request to remove dislike from a post
router.delete('/removeDislike/:id', async (req, res) => {
  const db = req.app.locals.db;
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

// GET request to fetch comments for a specific post
router.get('/comments/:id', async (req, res) => {
  const db = req.app.locals.db;
  const targetId = new ObjectId(req.params.id);

  try {
    const post = await db.collection('Posts').findOne({ _id: targetId });
    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// POST reques to add a comment to a specific post
router.post('/comment/:id', async (req, res) => {
  const db = req.app.locals.db;
  const comment = req.body;
  const targetId = new ObjectId(req.params.id);

  try {
    await db.collection('Posts').updateOne(
      { _id: targetId },
      { $push: { comments: comment } }
    );
    res.status(200).json({ message: 'Comment posted' });
  } catch (err) {
    res.status(500).json({ error: 'Error posting comment' });
  }
});

//POST request to save a post
router.post('/save/:id', async (req, res) => {
  const db = req.app.locals.db;
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

//DELETE request to remove a post from saved
router.delete('/removeSaved/:id', async (req, res) => {
  const db = req.app.locals.db;
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

//GET request to fetch the saved posts
router.get('/savedPosts', async (req, res) => {
  const db = req.app.locals.db;
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

//GET request to get the searched posts
router.get('/contents/search/:id/:filter', async (req, res) => {
  const db = req.app.locals.db;
  const targetContent=req.params.id;
  const filter=req.params.filter;

  try {
    let posts = await db.collection('Posts').find({
      //using case insensitive search and searching for posts whose title or content contain the target word
      $or: [
        { title: { $regex: targetContent, $options: 'i' } }, 
        { content: { $regex: targetContent, $options: 'i' } } 
      ]
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

export default router;
