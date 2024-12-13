//Route to handle users
import express from 'express';

const router = express.Router();

//GET request to get all the users in the website 
router.get('/people', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser=req.session.user.username;

  try {
    const users = await db.collection('Users').find({ username: { $ne: currentUser } }).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

//GET request to search for users
router.get('/users/search/:id', async (req, res) => {
  const db = req.app.locals.db;
  const targetName = req.params.id;

  try {
    //using case insensitive search and searching for users whose username contain the target word
    const users = await db.collection('Users').find({
      username: { $regex: targetName, $options: 'i' }
    }).toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

export default router;
