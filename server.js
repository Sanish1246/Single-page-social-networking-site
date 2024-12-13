//Main server
//Importing needed dependencies
import express from 'express';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDb } from './db.js';

//Routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import followRoutes from './routes/follow.js';
import gameRoutes from './routes/games.js';
import chatRoutes from './routes/chat.js';
import newsRoutes from './routes/news.js';
import profileRoutes from './routes/profile.js';
import userRoutes from './routes/users.js';
import tagRoutes from './routes/tags.js';

dotenv.config();
//Initializing express
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(fileUpload());
app.use(express.json());

//Session data
app.use(session({ secret: 'Sanish12', resave: false, saveUninitialized: true, cookie: { secure: false } }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//Serving the public folder
app.use(express.static(path.join(__dirname, 'public')));

//Using the routes
app.use('/M00980001', authRoutes);
app.use('/M00980001', postRoutes);
app.use('/M00980001', followRoutes);
app.use('/M00980001', gameRoutes);
app.use('/M00980001', chatRoutes);
app.use('/M00980001', newsRoutes);
app.use('/M00980001', profileRoutes);
app.use('/M00980001', userRoutes);
app.use('/M00980001', tagRoutes);

//Serving the HTML file
app.get('/M00980001', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = 8000;
const hostname = 'localhost';

//Connecting to the DB
async function startServer() {
  try {
    const client = await connectToDb();
    app.locals.db = client.db("CurrentUser");

    app.listen(port, () => {
      console.log(`Server listening on http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

startServer();
