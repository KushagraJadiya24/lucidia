
require("dotenv").config();
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
const { isLoggedIn, isAuthor ,aiLimiter } = require('./middleware');
const sanitizeHtml = require('sanitize-html');
const axios = require('axios');

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
app.use(express.json());

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
app.use(async (req, res, next) => {
  if (req.user) {
    const user = await User.findById(req.user._id);
    const today = new Date().toDateString();
    const usedToday = user.aiUsage?.lastUsed?.toDateString() === today ? user.aiUsage.count : 0;
    res.locals.aiUsesLeft = Math.max(5 - usedToday, 0);
  }
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
app.get('/entries/new', isLoggedIn,(req, res) => {
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
  const cleanContent = sanitizeHtml(content, {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span'],
    allowedAttributes: {
      'a': ['href', 'target'],
      'span': ['style']
    },
    allowedStyles: {
      '*': {
        // allow some inline styles if needed
        'color': [/^.*$/],
        'background-color': [/^.*$/],
        'font-weight': [/^.*$/],
        'text-align': [/^.*$/]
      }
    }
  });

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

  const cleanContent = sanitizeHtml(content, {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span'],
    allowedAttributes: {
      'a': ['href', 'target'],
      'span': ['style']
    },
    allowedStyles: {
      '*': {
        'color': [/^.*$/],
        'background-color': [/^.*$/],
        'font-weight': [/^.*$/],
        'text-align': [/^.*$/]
      }
    }
  });
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

// =================== OPENAI ROUTES ===================
app.post('/ai/suggest',isLoggedIn, aiLimiter, async (req, res) => {

  const { prompt } = req.body;
const fullPrompt = `
You are a personal journal writing assistant. Your task is to continue this user's diary entry in a natural, emotional, and reflective tone. Focus on weather, mood, small details, and do not introduce unrelated stories.

User's diary begins:
"${prompt}"

Continue writing as if you are the same person, expanding on the same situation:
`;
  try {
    const response = await axios.post(
      'https://api.together.xyz/inference',
      {
        model: "mistralai/Mistral-7B-Instruct-v0.1", 
        prompt: fullPrompt,
        max_tokens: 80,
        temperature: 0.9,
        top_p: 0.9,
        repetition_penalty: 1.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const suggestion = response.data.output?.choices?.[0]?.text || "No suggestion available.";
    res.json({ suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Suggestion failed." });
  }
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
