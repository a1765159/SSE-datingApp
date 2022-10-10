const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

// passport configuration
require('./config/passport')(passport);

// database configuration
const db = require('./config/keys').MongoURI;

// connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Body parser (for req.body)
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitalized: true
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// set up port and listen
const PORT = process.env.port || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));