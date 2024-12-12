import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.API_KEY;
const router = express.Router();

router.get('/games/:id', async (req, res) => {
  const pageNo = req.params.id;
  const favTags = req.session.user.favTags;
  let url = '';

  try {
    if (favTags.length > 0) {
      let maxTag = favTags.reduce((acc, tag) => {
        const count = favTags.filter(t => t === tag).length;
        return count > acc.count ? { tag, count } : acc;
      }, { tag: null, count: 0 }).tag.toLowerCase();

      url = `https://api.rawg.io/api/games?key=${apiKey}&genres=${maxTag}&page=${pageNo}`;
    } else {
      url = `https://api.rawg.io/api/games?key=${apiKey}&page=${pageNo}`;
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
    res.status(500).json({ error: 'Error fetching games' });
  }
});

router.post('/addFavourite', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser = req.session.user.username;
  const newGame = req.body;

  try {
    await db.collection('Users').updateOne(
      { username: currentUser },
      { $push: { favGames: newGame } }
    );
    res.status(200).json({ message: '✅ Game saved' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving favourite game' });
  }
});

router.delete('/removeFavourite/:id', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser = req.session.user.username;
  const gameToRemove = req.params.id;

  try {
    await db.collection('Users').updateOne(
      { username: currentUser },
      { $pull: { favGames: { name: gameToRemove } } }
    );
    res.status(200).json({ message: '✅ Game removed from favourites' });
  } catch (err) {
    res.status(500).json({ error: 'Error removing favourite game' });
  }
});

router.get('/showFavourite', async (req, res) => {
  const db = req.app.locals.db;
  const currentUser = req.session.user.username;
  try {

    const user = await db.collection('Users').findOne({ username: currentUser });

    res.status(200).json(user.favGames);
  } catch (err) {
    console.error('Error updating user data:', err);
    res.status(500).json({ error: 'Error processing user action' });
  }
});

router.get('/searchGame/:game/:id', async (req, res) => {
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

export default router;
