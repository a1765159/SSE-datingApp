module.exports = {
  // redirect user to login if they are not authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'Please log in to view this content');
    res.redirect('/users/login');
  },

  // redirect user to dashboard if they are authenticated and trying to access content for unauthenticated users
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  }
};