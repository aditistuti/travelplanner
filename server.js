const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const Comment = require('./models/comment');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
  resave: false,
  saveUninitialized: false
}));

// Static assets. `index: false` so directory requests (like "/") fall through
// to the route below that renders the EJS home page instead of public/index.html.
// `views` is served first so the EJS pages' assets (e.g. css/style.css) win over
// same-named files under `public/` (which only the /index.html "Reviews" page uses).
app.use(express.static('views', { index: false }));
app.use(express.static('public', { index: false }));

// --- Database ---
const mongoUrl = process.env.MONGODB_URL || process.env.DATABASE_URL;
if (!mongoUrl) {
  console.error('Missing MONGODB_URL environment variable. Set it in your .env file.');
  process.exit(1);
}
mongoose.connect(mongoUrl)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', userSchema);

// --- Auth helpers ---
// eslint-disable-next-line no-unused-vars
const requireLogin = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

// --- Routes ---

// Home page (public; shows user info if logged in)
app.get('/', async (req, res) => {
  try {
    let user = null;
    if (req.session.userId) {
      user = await User.findById(req.session.userId);
    }
    res.render('index', { user });
  } catch (err) {
    console.error('Error loading home page:', err.message);
    res.render('index', { user: null });
  }
});

// Signup
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hash });
    await newUser.save();
    res.redirect('/login.html');
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send('An account with that email already exists');
    }
    console.error('Signup error:', err.message);
    res.status(500).send('Signup failed');
  }
});

// Login (returns JSON so the client can react to success/failure)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ ok: false, message: 'Login failed' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// --- Comment API ---
app.post('/api/comments', async (req, res) => {
  const { username, comment } = req.body;
  if (!username || !comment) {
    return res.status(400).json({ error: 'username and comment are required' });
  }
  try {
    const saved = await new Comment({ username, comment }).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving comment:', err.message);
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// --- Server + Socket.io ---
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('comment', (data) => {
    data.time = new Date();
    socket.broadcast.emit('comment', data);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
});
