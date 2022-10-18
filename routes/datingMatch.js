const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// load DatingProfile model 
const DatingData = require('../models/DatingData');

const { forwardAuthenticated } = require('../config/auth');

// test: save one document
// const newDatingDatum = new DatingData({
//     nickName: 'Lily',
//     sex: 'Male',
//     age: '18',
//     email: 'Jim@gmail.com',
//     location: 'Adelaide',
//     hobbies: 'Swimming',
//     covidStatus: 'Negative'
// });

// newDatingDatum.save()
// .then(user => {
//     console.log("Document was saved successfully.");
// })
// .catch(err => console.log(err));

// List users
router.get('/', forwardAuthenticated, (req, res) => {
    DatingData.find().then( datingData => {
        // for (var i=0; i<datingData.length; i++){
        //     console.log("datingDatum:" datingData[i]);
        //     res.render('datingmatch', datingData[i]);
        // }
        res.render('datingmatch', {'datingData': datingData});
    });
});

module.exports = router;