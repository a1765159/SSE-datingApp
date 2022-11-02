const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// load DatingProfile model 
const DatingData = require('../models/DatingData');

const { forwardAuthenticated } = require('../config/auth');

// List users
// router.get('/', forwardAuthenticated, (req, res) => {
router.get('/', (req, res) => {
    DatingData.find().then( datingData => {
        res.render('datingmatch', {'datingData': datingData});
    });
});

router.post('/', (req, res) => {
    const date = req.body;
    // TODO: 1. check the day availability for the user, 2. change the button to be non-clickable
    res.redirect("/datingmatch");
});


module.exports = router;