const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// load User model 
const User = require('../models/User');
// load datingData model
const datingData = require('../models/DatingData');

const { forwardAuthenticated } = require('../config/auth');
const DatingData = require('../models/DatingData');

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

// update my dating info
router.get('/updatedatinginfo', (req, res) => res.render('updatedatinginfo', {'curUserEmail':req.user.email}));

router.post('/updatedatinginfo', (req, res, next) => {
  var curUserEmail = req.body.email;
  if(req.user){
    curUserEmail = req.user.email;
  }
  else{
    console.log("Haven't logged in.");
    res.redirect('/users/login');
    return;
  }

  const { email, nickname, sex, age, location, hobbies, covidStatus } = req.body;
  // console.log('email:'+email+' nickname:'+nickname+' covidStatus:'+covidStatus);
  var availability = "Yes";
  if(covidStatus == "Positive"){
    availability = "No";
  }

  // const newDatingDatum = new DatingData({ // avoid modify the immutable field '_id'
  const newDatingDatum = {
      nickName:nickname,
      sex:sex,
      age:age,
      email:curUserEmail,
      location:location,
      hobbies:hobbies,
      covidStatus:covidStatus,
      availability:availability
  };

  DatingData.updateOne({email:curUserEmail},  
    newDatingDatum, {upsert:true})
  .then(user => {
      console.log("Your dating info was updated successfully.");
  })
  .catch(err => console.log(err));

  // show my dating info after updated
  res.render('datinginfo', {'datingDatum': newDatingDatum});

  // console.log("==Your dating info was saved successfully.");
  // newDatingDatum.save()
  // .then(user => {
  //     console.log("Your dating info was saved successfully.");
  //     res.redirect('/users/datinginfo');
  // })
  // .catch(err => console.log(err));
});

// show my dating info
// router.get('/datinginfo', forwardAuthenticated, (req, res) => res.render('datinginfo'));
router.get('/datinginfo', (req, res) => {
  var curUserEmail = req.body.email;
  if(req.user){
    curUserEmail = req.user.email;
  }
  else{
    console.log("Haven't logged in.");
    res.redirect('/users/login');
    return;
  }

  DatingData.findOne({ email:curUserEmail }).then(datingDatum=>{
    if(datingDatum){
      res.render('datinginfo', {'datingDatum': datingDatum});
    }
    else{
      res.redirect('/users/updatedatinginfo');
    }
  });
});


module.exports = router;