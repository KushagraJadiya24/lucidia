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

