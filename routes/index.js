'use strict';

var passport = require('passport');
var router = require('express').Router();
var Users = require('../models/users');
var EmailTemplate = require('email-templates').EmailTemplate;
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var path = require('path');
var globalConfig = require('../configs/global');
var mailConfig = require('../configs/mail');


// Set the 'isLoggedIn' variable is used on the web templates.
router.use(function(req, res, next) {
  res.locals.isLoggedIn = req.isAuthenticated();
  next();
});


router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/register', suppressLoggedInUsers, function(req, res, next) {
  res.render('register', { message: req.flash('error') });
});


router.post('/register', suppressLoggedInUsers, function(req, res, next) {

  var promise = new Promise(function(resolve, reject) {  
    
    // Register the user
    var userDetails = {
      username: req.body.username,
      firstname: req.body.firstName,
      lastname: req.body.lastName
    };

    Users.register(new Users(userDetails), req.body.password, function(err, user) {
      if(err) {
        err.message = 'Unable to register user';
        err.status = 500;
        reject(err);
        return;
      }
      resolve(user);
    });
  })
  .then(function(user) {
    
    // Generate token for email verification.
    return new Promise(function(resolve, reject) {
      crypto.randomBytes(48, function(ex, buf) {
        user.verifytoken = buf.toString('hex');
        user.save(function(err) {
          if(err) {
            err.message = 'Unable to configure email verification';
            err.status = 500;
            reject(err);
            return;
          }
          resolve(user);
        });
      });
    });
  })
  .then(function(user) {
  
    // Prepare the user verification email.
    return new Promise(function(resolve, reject) {

      var templateDir = path.join(__dirname, '..', 'templates', 'confirm-registration');
      var confirmEmail = new EmailTemplate(templateDir);
      var confirmUrl = globalConfig[process.env.NODE_ENV].url + '/register/' + user.verifytoken;
      var data = {
        firstName: user.firstname,
        confirmUrl: confirmUrl
      };
      
      confirmEmail.render(data, function (err, results) {
        if(err) {
          err.message = 'Unable to render confirmation email';
          err.status = 500;
          reject(err);
          return;
        }
      
        var mail = {
          port: mailConfig[process.env.NODE_ENV].port,
          from: mailConfig[process.env.NODE_ENV].from_newregistration,
          to: user.username,
          subject: 'Please confirm your App registration',
          html: results.html
        };
        
        // Do not send email to real email address if in dev mode.
        if(process.env.NODE_ENV == 'dev') {
          mail['to'] = mailConfig[process.env.NODE_ENV].testmail;
        }
        
        resolve(mail);
      });
    });   
  })
  .then(function(mail) {
  
    // Send the user verification email.
    return new Promise(function(resolve, reject) {

      var transporter = nodemailer.createTransport();
      transporter.sendMail(mail, function(err, info){
        if(err) {
          err.message = 'Unable to send mail';
          err.status = 500;
          reject(err);
          return;
        }
        resolve();
      });
    });
  })
  .then(function() {
  
    // Log the new user in.
    passport.authenticate('local')(req, res, function() {
      res.redirect('/dashboard');
    });
  })
  .catch(function(err) {
  
    req.flash('error', err.message);
    res.redirect('/register');
    return;
  });
  
});


router.get('/dashboard', forceLogIn, function(req, res, next) {
  res.render('dashboard');
});


router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});


function suppressLoggedInUsers(req, res, next) {
  if(req.user) {
    // User is logged in. Clear any flash messages and then redirect.
    req.flash('error', null);
    res.redirect('/dashboard');
    return;
  }
  // User is not logged in. Proceed.
  next();
}

function forceLogIn(req, res, next) {
  if(req.user) {
    // User is logged in.
    next();
  }
  else {
    // User is not logged in
    res.redirect('/register');
  }
}

module.exports = router;
