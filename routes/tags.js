import express from 'express';

const router = express.Router();

router.post('/tags', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser = req.session.user.username;
  const newTags = req.body;

  const normalizedTags = newTags.map(tag => {
    if (tag.toLowerCase().includes("rpg") || tag.toLowerCase().includes("role play")) {
      return "role-playing-games-rpg";
    } else if (tag.toLowerCase().includes("open world") || tag.toLowerCase().includes("exploration")) {
      return "adventure";
    } else if (tag.toLowerCase().includes("tactic")) {
      return "strategy";
    } else if (tag.toLowerCase().includes("fps") || tag.toLowerCase().includes("shoot")) {
      return "shooter";
    } else if (tag.toLowerCase().includes("mmo")) {
      return "massively-multiplayer";
    } else if (tag.toLowerCase().includes("board")) {
      return "board-games";
    } else if (tag.toLowerCase().includes("tcg")) {
      return "card";
    }
    return tag.toLowerCase();
  });

  try {
    await db.collection('Users').updateOne(
      { username: currentUser },
      { $set: { favTags: normalizedTags } }
    );
    res.status(200).json({ message: "Tags added" });
  } catch (err) {
    res.status(500).json({ error: 'Error processing tags' });
  }
});

export default router;
