import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/chat/:id', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser = req.session.user.username;
  const otherUser = req.params.id;

  try {
    let chat = await db.collection('Chats').findOne({
      $or: [
        { $and: [{ user1: otherUser }, { user2: currentUser }] },
        { $and: [{ user2: otherUser }, { user1: currentUser }] }
      ]
    });

    if (!chat) {
      chat = {
        user1: currentUser,
        user2: otherUser,
        messages: []
      };
      await db.collection('Chats').insertOne(chat);
    }

    res.status(200).json(chat.messages);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chat' });
  }
});

router.post('/send/:id', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser = req.session.user.username;
  const otherUser = req.params.id;
  const message = req.body;

  try {
    await db.collection('Chats').updateOne(
      {
        $or: [
          { $and: [{ user1: otherUser }, { user2: currentUser }] },
          { $and: [{ user2: otherUser }, { user1: currentUser }] }
        ]
      },
      { $push: { messages: message } }
    );

    res.status(200).json({ message: 'Message sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

export default router;
