const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require("ejs-mate");
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Entry = require('./models/entry');
const User = require('./models/user');
const { isLoggedIn } = require('./middleware'); // custom middleware

// DB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/lucidia";
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

// App config
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session config
app.use(session({
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: false
}));

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass current user to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ===================== ROUTES ======================

// Landing page
app.get('/', (req, res) => {
  res.render('landing.ejs');
});

// Show all entries - only user's own
app.get('/entries', isLoggedIn, async (req, res) => {
  const entries = await Entry.find({ user: req.user._id });
  res.render('entries/entries.ejs', { entries });
});

// Form to create a new entry
app.get('/entries/new', isLoggedIn, (req, res) => {
  res.render('entries/new.ejs');
});

// Show single entry
app.get('/entries/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const entry = await Entry.findById(id);
  if (!entry) return res.status(404).send("Entry not found");
  res.render('entries/show.ejs', { entry });
});

// Create new entry
app.post('/entries', isLoggedIn, async (req, res) => {
  const { title, content } = req.body;
  const newEntry = new Entry({
    title,
    content,
    createdAt: new Date(),
    user: req.user._id // associate entry with logged-in user
  });
  await newEntry.save();
  res.redirect('/entries');
});

// Edit entry
app.patch('/entries/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const entry = await Entry.findById(id);

  if (!entry) return res.status(404).send("Entry not found");
  if (!entry.user.equals(req.user._id)) return res.status(403).send("Unauthorized");

  entry.title = title;
  entry.content = content;
  await entry.save();
  res.redirect(`/entries/${id}`);
});

// Delete entry
app.delete('/entries/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const entry = await Entry.findById(id);
  if (!entry) return res.status(404).send("Entry not found");
  if (!entry.user.equals(req.user._id)) return res.status(403).send("Unauthorized");

  await Entry.findByIdAndDelete(id);
  res.redirect('/entries');
});

// =================== AUTH ===================

// Signup form
app.get('/signup', (req, res) => {
  res.render('user/signup');
});

// Signup logic
app.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      res.redirect('/entries');
    });
  } catch (e) {
    res.send("Signup error: " + e.message);
  }
});

// Login form
app.get('/login', (req, res) => {
  res.render('user/login');
});

// Login logic
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/entries'
}));

// Logout
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// ====================================================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
