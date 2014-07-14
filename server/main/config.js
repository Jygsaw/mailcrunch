"use strict";


var mongoose    = require('mongoose'),
    morgan      = require('morgan'),
    bodyParser  = require('body-parser'),
    middle      = require('./middleware'),
    passport    = require('passport');
/*
 * Include all your global env variables here.
*/
module.exports = exports = function (app, express, routers) {
  app.set('port', process.env.PORT || 3000);
  app.set('base url', process.env.URL || 'http://localhost');
  app.use(morgan('dev'));
  app.use(middle.cors);
  app.use(express.static(__dirname + '/../../client'));
  app.use('/note', routers.NoteRouter);
  app.use('/crunch', routers.CrunchRouter);
  app.use(middle.emailGetter);
  app.use(middle.emailSender);
  app.use(middle.logError);
  app.use(middle.handleError);
};

