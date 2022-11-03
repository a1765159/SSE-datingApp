const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodemailer = require("nodemailer");

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

    // let transporter = nodemailer.createTransport({
    //     host: "smtp.mailtrap.io",
    //     port: 2525,
    //     auth: {
    //         user: "ce728bbf78176e",
    //         pass: "73ed4df8e532b2"
    //     }
    // });

    // Reference of how to send gmail emails through nodemailer: https://www.jianshu.com/p/fff61040c384
    // The Google project and API I created is: sse-g11-test, passwd: SSE123456
    // https://console.cloud.google.com/apis/credentials?project=sse-g11-test&supportedpurview=project
    // https://developers.google.com/oauthplayground/?code=4/0ARtbsJrhoYd5rIVjTrXt6xt3a-P435Hq4ff6L6MFjNIbErGh9MCnjeKLNguVHXKi6U_rCQ&scope=https://mail.google.com/
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
        type: "OAuth2",
        user: "sse.g11.test@gmail.com",
        clientId:
            "601823238879-rajmopnkg4kqq21pl998666spgqj00k5.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken:
            "1//04URXBVFu1HfYCgYIARAAGAQSNwF-L9IrR8AfwZzP-1sMXYrBMEVkMLk_evhP94evhl44IgGMj9t6Kx4dbnPU-pFxjhWGyQg-G24",
        accessToken:
            "ya29.a0Aa4xrXOlLlQRMT9-C14CoMBwqYeOS1OmKMKui-qkPVXxDddXV7I32_GL42OR0n88kGpiG0VjiZREIi7qGi_wQow8kDWxBZozjfJf-OTex5-UUmHnq6yBZv4jE4MawP3C_P07XS8qK6xZKZhDXVlHxAO-i9-KaCgYKATASAQ4SFQEjDvL9-uKefpFHd1iBj9LEXzpPGw0163",
        },
    });

    let mailOptions = {
        from: '"sse.g11.test" <sse.g11.test@gmail.com>',
        //TODO: send email to the one you want to date
        to: "kiwijason.kang@gmail.com",
        subject: "Hello ✔, New Date Notification",
        text: "How are you? Are you available for a date?",
        html: "<b>How are you? Are you available for a date?</b>"
    }

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(err, info){
        if (err) {
            res.json(err);
        } else {
            res.json(info);
        }
    });

    res.redirect("/datingmatch");
});


module.exports = router;