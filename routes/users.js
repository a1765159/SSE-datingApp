const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// load models 
const User = require('../models/User');
const DatingData = require('../models/DatingData');
const xss = require("xss");

// load authorization functions
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


// Register page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register new user
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 10) {
    errors.push({ msg: 'Password should be at least 10 characters '});
  }

  if (errors.length > 0) {
    //console.log(errors)
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } 
  
  // no errors with account details
  else {
    User.findOne({ email: email }).then( user => {
      // User exists
      if(user) {
        errors.push({ msg: 'Email is already registered' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } 
      
      // User does not exist, register them
      else {
        const newUser = new User({
          name,
          email,
          password
        });

        // salt and hash password, 10 is the # of salt rounds
        bcrypt.hash(newUser.password, 10, function(err, hash) {
          if (err) throw err;

          // set password to the hash and save user
          newUser.password = hash;
          newUser.save()
            .then(user => {
              req.flash('success_msg', 'You are now registered. Please log in');
              res.redirect('/users/login');
            })
            .catch(err => console.log(err));
        }); 
      }
    });
  }
});

// Login page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Login a user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    //TODO: Notify users to update their dating info, if they haven't done that before.
    // successRedirect: '/users/datinginfo',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout a user
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err) }
    res.redirect('/users/login');
  });
});

// update info page
router.get('/updatedatinginfo', ensureAuthenticated, (req, res) => {
  res.render('updatedatinginfo', {'email':req.user.email})
});

// Update info
router.post('/updatedatinginfo', ensureAuthenticated, (req, res) => {
  var { nickname, sex, age, location, hobbies, covidStatus } = req.body;
  let errors = [];

  if (!nickname || !sex || !age || !location || !hobbies || !covidStatus) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // XSS prevention
  nickname = xss(nickname);
  age = xss(age);
  location = xss(location);
  hobbies = xss(hobbies);

  // console.log('email:'+email+' nickname:'+nickname+' covidStatus:'+covidStatus);
  var availability = "Yes";
  if(covidStatus == "Positive"){
    availability = "No";
  }

  var email = req.user.email;

  if (errors.length > 0) {
    //console.log(errors)
    res.render('updatedatinginfo', {
      errors,
      email,
      nickname,
      sex,
      age,
      location,
      hobbies,
      covidStatus,
      availability
    });
  } else {
    // const newDatingDatum = new DatingData({ // avoid modify the immutable field '_id'
    const newDatingDatum = {
        nickName:nickname,
        sex:sex,
        age:age,
        location:location,
        hobbies:hobbies,
        covidStatus:covidStatus,
        availability:availability
    };

    // update database
    DatingData.updateOne({email:req.user.email},  
      newDatingDatum, {upsert:true})
    .then(user => {
        console.log("Your dating info was updated successfully.");
    })
    .catch(err => console.log(err));

    // show my dating info after updated
    res.render('datinginfo', { 'datingDatum': newDatingDatum, 'email': req.user.email });
  }
});

// show my dating info
// router.get('/datinginfo', forwardAuthenticated, (req, res) => res.render('datinginfo'));
router.get('/datinginfo', ensureAuthenticated, (req, res) => {
  DatingData.findOne({ email:req.user.email }).then(datingDatum=>{
    if(datingDatum){
      res.render('datinginfo', {'datingDatum': datingDatum, 'email' : req.user.email });
    }
    else{
      res.redirect('/users/updatedatinginfo');
    }
  });
});


module.exports = router;