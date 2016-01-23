/* jshint node: true */
'use strict';

module.exports = {
  prod: {
    port: 25,
    from_newregistration: 'confirm@app.com'
  },
  dev: {
    port: 25,
    from_newregistration: 'benjamin@localhost',
    testmail: 'root@localhost'
  }
};
