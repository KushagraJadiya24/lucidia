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
const flash = require('connect-flash');
const { isLoggedIn, isAuthor } = require('./middleware');

// DB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/lucidia";
mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// App setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session & Flash
app.use(session({
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: false
}));


// Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
// Global Middleware for templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


// ===================== ROUTES ======================

// Landing page
app.get('/', (req, res) => {
  res.render('landing');
});

// Show all entries (only for logged-in user)
app.get('/entries', isLoggedIn, async (req, res) => {
  const entries = await Entry.find({ user: req.user._id });
  res.render('entries/entries', { entries });
});

// New entry form
app.get('/entries/new', isLoggedIn,isAuthor, (req, res) => {
  res.render('entries/new');
});

// Show one entry
app.get('/entries/:id', isLoggedIn, isAuthor, async (req, res) => {
  const { id } = req.params;
  const entry = await Entry.findById(id);
  if (!entry) {
    req.flash('error', 'Entry not found');
    return res.redirect('/entries');
  }
  res.render('entries/show', { entry });
});

// Create new entry
app.post('/entries', isLoggedIn, async (req, res) => {
  const { title, content } = req.body;
  const newEntry = new Entry({
    title,
    content,
    createdAt: new Date(),
    user: req.user._id
  });
  await newEntry.save();
  req.flash('success', 'Entry created!');
  res.redirect('/entries');
});

// Update entry
app.patch('/entries/:id', isLoggedIn, isAuthor, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  await Entry.findByIdAndUpdate(id, { title, content });
  req.flash('success', 'Entry updated!');
  res.redirect(`/entries/${id}`);
});

// Delete entry
app.delete('/entries/:id', isLoggedIn, isAuthor, async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  req.flash('success', 'Entry deleted!');
  res.redirect('/entries');
});

// ============== AUTH ROUTES ==============

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
      req.flash('success', 'Welcome to Lucidia!');
      res.redirect('/entries');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/signup');
  }
});

// Login form
app.get('/login', (req, res) => {
  res.render('user/login');
});

// Login logic
app.post('/login', passport.authenticate('local', {
  failureFlash: true,
  failureRedirect: '/login',
  successFlash: 'Welcome back to Lucidia!',
  successRedirect: '/entries'
}));

// Logout
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully!');
    res.redirect('/');
  });
});

// =================== SERVER ===================
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
