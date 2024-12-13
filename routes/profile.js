import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';


const router = express.Router();

router.get('/profile/:id', async (req, res) => {
  const db = req.app.locals.db;
  const targetUser = req.params.id;

  try {
    const user = await db.collection('Users').findOne({ username: targetUser });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

router.post('/uploadProfilePicture', async (req, res) => {
  const db = req.app.locals.db;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadedFile = req.files.media;
  const uploadPath = `${__dirname}/../uploads/${uploadedFile.name}`;
  req.session.user.profileImg = `/uploads/${uploadedFile.name}`;

  try {
    await uploadedFile.mv(uploadPath);

    await db.collection('Users').updateOne(
      { username: req.session.user.username },
      { $set: { profileImg: `/uploads/${uploadedFile.name}` } }
    );

    res.json({ message: 'Profile picture updated successfully!', path: `/uploads/${uploadedFile.name}` });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
});

export default router;
