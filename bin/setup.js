'use strict';

/**
 * Run this script once before running the application, to create the users
 * collection and to insert a single default user. The script should only be run
 * once.
 *
 * The default user will have the following credentials:
 *
 * Username: admin
 * Password: admin
 */
var mongoose = require('mongoose');
var dbConfig = require('../configs/db');
var Users = require('../models/users');

mongoose.connect(dbConfig["dev"].url);
process.on('SIGINT', function() {
  console.log('Closing database connection.');
  mongoose.connection.close();
});
    
// Gather the default user details
var userPassword = "admin";
var userParticulars = {
  username: "admin",
  firstName: "admin",
  lastName: "admin"
};

// Add the default user to the database.
Users.register(new Users(userParticulars), userPassword, function(err, user) {
  if (err) {
    console.log('Unable to add default user: ' + err);
  }
  else {
    console.log('Default user successfully added.');
  }
  
  process.exit(0);
});
