//Route to handle the tags
import express from 'express';

const router = express.Router();

//POST request to add the tags to the user data
router.post('/tags', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser=req.session.user.username;
  const newFavTags=req.session.user.favTags;

  const newTags=req.body;

    //The 30 most recent tags are stored
    for (let newTag of newTags) {
      if (newFavTags.length==30){
        newFavTags.shift();
      }

      //Relating some keywords to existing tags
      if(newTag.toLowerCase().includes("rpg") ||newTag.toLowerCase().includes("role play") ) {
        newTag="role-playing-games-rpg";
      } else if (newTag.toLowerCase().includes("open") || newTag.toLowerCase().includes("exploration")){
        newTag="adventure";
      } else if (newTag.toLowerCase().includes("tactic")){
        newTag="strategy";
      } else if (newTag.toLowerCase().includes("fps") || newTag.toLowerCase().includes("shoot")){
        newTag="shooter";
      } else if (newTag.toLowerCase().includes("mmo")){
        newTag="massively-multiplayer";
      } else if (newTag.toLowerCase().includes("board")){
        newTag="board-games";
      } else if (newTag.toLowerCase().includes("tcg")){
        newTag="card";
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

export default router;
