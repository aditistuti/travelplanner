const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const ejs = require('ejs');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));

mongoose.connect('mongodb://localhost:27017/tripperDB');

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
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const newUser = new User({ firstName, lastName, email, password });
 await newUser.save()

 res.redirect("/login.html");
  
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Login Route: ", req.body, email, password);
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


// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });






app.use(express.static('public'))

// const dbConnect = require('./db')
function dbConnect() {
  // Db connection
  // const mongoose = require('mongoose')
  // const url = 'mongodb://localhost:27017/comments'

  // mongoose.connect(url, {
  //     userNewUrlParser: true,
  //     useUnifiedTopology: true,
  //     useFindAndModify: true
  // })

  const connection = mongoose.connection
  connection.once('open', function () {
      console.log('Database connected...')
  })
}

module.exports = dbConnect
dbConnect()
const Comment = require('./models/comment')

app.use(express.json())

// Routes 
app.post('/api/comments', (req, res) => {
    const comment = new Comment({
        username: req.body.username,
        comment: req.body.comment
    })
    comment.save().then(response => {
        res.send(response)
    })

})

app.get('/api/comments', (req, res) => {
    Comment.find().then(function(comments) {
        res.send(comments)
    })
})

const port = process.env.PORT || 8080

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

let io = require('socket.io')(server)

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`)
    // Recieve event
    socket.on('comment', (data) => {
        data.time = Date()
        socket.broadcast.emit('comment', data)
    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data) 
    })
})

