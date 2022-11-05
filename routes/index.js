const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

var fs = require('fs')
var morgan = require('morgan');
var path = require('path')

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

morgan.token('host', function(req, res) {
    return req.hostname;
});

morgan.token('ip', function(req, res) {
    return req.ip;
});

// setup the logger
router.use(morgan('Date-[:date[clf]], User :host, IP :ip, Method-:method, url-:url, version-HTT' +
    'P/:http-version, status-:status , contentLength-:res[content-length] responseTime-:response-time ms',
    { stream: accessLogStream }))

// Welcome page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated,  (req, res) => 
  res.render('dashboard', {
    name: req.user.name
  })
);

module.exports = router;