const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Log model
const Log = require('../models/Log');
const DatingData = require("../models/DatingData");

// Welcome page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated,  (req, res) => 
  res.render('dashboard', {
    name: req.user.name
  })
);

router.get('/', (req, res) => {
    Log.find().then( log => {
        res.render('dashboard', {'log': Log});
    });
});
router.post('/', (req, res) => {
    const date = req.body;
    res.redirect("/dashboard");
});

module.exports = router;