const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const ejs = require('ejs');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));

mongoose.connect('mongodb://localhost:27017/tripperdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', userSchema);

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (req.session.userId) {
    next(); // User is logged in, proceed to the next middleware
  } else {
    res.redirect('/login'); // Redirect to login page if user is not logged in
  }
};

// Routes
app.get('/', (req, res) => {
    const { user } = req.session;
    res.render('index', { user });
  });
// Home page route
app.get('/', requireLogin, (req, res) => {
  User.findById(req.session.userId)
    .then(user => {
      if (user) {
        res.render('index', { user }); // Render index.ejs with user data
      } else {
        res.redirect('/login'); // Redirect to login if user data is not found
      }
    })
    .catch(err => {
      console.error('Error finding user:', err);
      res.redirect('/login'); // Redirect to login in case of an error
    });
});

// Signup route
app.post('/signup', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const newUser = new User({ firstName, lastName, email, password });
  newUser.save()
    .then(() => res.send('User registered successfully'))
    .catch(err => res.status(400).send('Error registering user'));
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email, password })
    .then(user => {
      if (user) {
        req.session.userId = user._id; // Store user ID in session
        res.redirect('/'); // Redirect to home page after successful login
      } else {
        res.status(401).send('Invalid credentials');
      }
    })
    .catch(err => res.status(500).send('Login failed'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
