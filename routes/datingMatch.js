const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// load DatingProfile model 
const DatingData = require('../models/DatingData');

const { forwardAuthenticated } = require('../config/auth');

// test showing info
 var data={
        name: 'Jim',
        sex: 'Male',
        age: '18',
        email: 'Jim@gmail.com',
        location: 'Adelaide',
        hobbies: 'Swimming',
        covidStatus: 'Negative'
    };
// router.get('/', (req,res) => res.render('datingmatch', data));

// List users
router.get('/', forwardAuthenticated, (req, res) => res.render('datingmatch', data));
// DatingData.find().then( user => {
//   res.render('datingmatch');
// });


module.exports = router;