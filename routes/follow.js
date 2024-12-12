import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/follow/:id', async (req, res) => {
  const db = req.app.locals.db;
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
    res.status(500).json({ error: 'Error processing follow action' });
  }
});

router.delete('/follow/:id', async (req, res) => {
  const db = req.app.locals.db;
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
    res.status(500).json({ error: 'Error processing unfollow action' });
  }
});

export default router;
