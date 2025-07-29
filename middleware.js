const Entry = require('./models/entry');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in.');
    return res.redirect('/login');
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const entry = await Entry.findById(id);

  if (!entry) {
    req.flash('error', "Entry not found.");
    return res.redirect('/entries');
  }

  if (!entry.user.equals(req.user._id)) {
    req.flash('error', "You don't have permission to access this entry.");
    return res.redirect('/entries');
  }

  next();
};

// middleware/aiLimiter.js
const User = require('./models/user');

module.exports.aiLimiter = async (req, res, next) => {
  const userId = req.user._id; // or req.session.user._id if using sessions

  const user = await User.findById(userId);

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const today = new Date();
  const lastUsed = user.aiUsage.lastUsed || new Date(0);
  const isSameDay = today.toDateString() === lastUsed.toDateString();

  if (isSameDay && user.aiUsage.count >= 5) {
    return res.status(429).json({ error: "Daily AI limit reached (5/day)" });
  }

  // Update count or reset for new day
  if (isSameDay) {
    user.aiUsage.count += 1;
  } else {
    user.aiUsage.count = 1;
    user.aiUsage.lastUsed = today;
  }

  await user.save();
  next();
};

