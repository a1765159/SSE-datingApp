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
const helmet=require("helmet");
const cors=require("cors");

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

// 1) prevent clickjacking attacks
app.use(
  helmet.frameguard({
    action: "deny",
  })
 ); 
// 2) This header can be used to detect that the application is powered by Express, which lets hackers conduct a precise attack. so make it disable
 app.use(helmet.hidePoweredBy());
//  app.disable('x-powered-by') //alternate way to disable it

// 3) it puts another layer of security while fetching any data on your API
app.use(helmet.xssFilter());
// 4) use cors policy for security purpose if you ever make client server approch it will be helpfull too
app.use(cors({
  methods:['GET','POST'],
  // origin:'http://localhost:18080' // set this if you used client server approch or api system
  // credentials:true //this must set to be true if you fetch or recieve cookies
}))
// 5) This tells the browser to prefer HTTPS over HTTP. By default, this figure is 15552000 or 180 days.
// app.use(
//   helmet.hsts({
//     maxAge: 123456,
//     includeSubDomains: false,
//   })
//  );
// 6) This helps control DNS prefetching and improves user privacy. let it should be false for privacy
app.use(
  helmet.dnsPrefetchControl({ 
    allow: false,
  })
 );
//  7) if you dont want any third party script or api such as (bootstrap) run in your code. by making it false will allow third party script run in your code there is plenty of options for allowing specific uri and api or third party script to run.
// app.use(
//   helmet({
//     contentSecurityPolicy: true,
//   })
// );

// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitalized: true,
  // sameSite:'', // This can be set to 'strict', 'lax', 'none', or true (which maps to 'strict')
  cookie: {
    secure: true,
    // httpOnly: true,
    // domain: 'example.com',
    // path: '',
    // expires: expiredate
  } //If secure is set, and you access your site over HTTP, the cookie will not be set. If you have your node.js behind a proxy and are using secure: true, you need to set “trust proxy” in express:
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