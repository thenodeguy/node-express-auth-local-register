'use strict';

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var dbConfig = require('./configs/db');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));

// Database setup
mongoose.connect(dbConfig[process.env.NODE_ENV].url);

// Authentication setup
var Users = require('./models/users');
app.use(session({ secret: "elsecretodesussochos", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

// Routing configuration
app.use(express.static(__dirname + '/public'));

var routes = require('./routes/index');
app.use('/', routes);

module.exports = app;
