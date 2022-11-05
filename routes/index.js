const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

var fs = require('fs')
var morgan = require('morgan');
var path = require('path')

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
router.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', { stream: accessLogStream }))

// Welcome page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated,  (req, res) => 
  res.render('dashboard', {
    name: req.user.name
  })
);

router.post('/', (req, res) => {
    const date = req.body;
    res.redirect("/dashboard");
});

module.exports = router;