'use strict';

var passport = require('passport');
var router = require('express').Router();
var Users = require('../models/users');


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
  
  // Register the user
  var userParticulars = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  };

  Users.register(new Users(userParticulars), req.body.password, function(err, user) {

    if(err) {
      req.flash('error', 'Unable to register user: ' + err);
      res.redirect('/register');
      return;
    }

    // Log the new user in.
    passport.authenticate('local')(req, res, function() {
        res.redirect('/dashboard');
    });
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
