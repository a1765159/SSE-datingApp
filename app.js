const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const morgan = require('morgan');

const app = express();

var privateKey = fs.readFileSync('./config/https/private.pem', 'utf8');
var certificate = fs.readFileSync('./config/https/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

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

// formidable upload
app.use(express.static('public'))

// connect flash
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,   // 15 minute window
	max: 100,                   // max number of requests per window for each IP address
	standardHeaders: true,
	legacyHeaders: false
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// redirect any http traffic to https
app.use((req, res, next) => {
  if ( !req.secure ) {
    return res.redirect('https://localhost:18081' + req.url);
  }
  return next();
});

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

morgan.token('email', function(req, res) {
  if (req.user) {
    return req.user.email;
  }
  // user is not logged in
  return "N/A";
});

morgan.token('host', function(req, res) {
    return req.hostname;
});

morgan.token('ip', function(req, res) {
    return req.ip;
});

// setup the logger
app.use(morgan('Date-[:date[clf]], User :host, IP :ip, email :email Method-:method, url-:url, version-HTT' +
    'P/:http-version, status-:status , contentLength-:res[content-length] responseTime-:response-time ms',
    { stream: accessLogStream }))

// routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/datingmatch', require('./routes/datingMatch'));

// app.get('/upload', (req, res) => res.render('upload'))
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm()
  const filePath = path.join(__dirname, 'public', 'images')
  form.uploadDir = filePath
  form.parse(req, async (err, fields, files) => {
    if (err) res.send("Error parsing the files")
    const file = files.upload
    const fileName = file.originalFilename
    fs.renameSync(file.filepath, path.join(filePath, fileName))
    // res.redirect("/users/updatedatinginfo")
    return;
  })
})

// set up port and listen
// const PORT = process.env.port || 5001;
// app.listen(PORT, console.log(`Server started on port ${PORT}`));

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
var PORT = 18080;
var SSLPORT = 18081;

httpServer.listen(PORT, function() {
  console.log('HTTP Server is running on: http://localhost:%s', PORT);
});
httpsServer.listen(SSLPORT, function() {
  console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});