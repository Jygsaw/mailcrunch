"use strict";

var Crunch      = require('./crunch_model.js'),
    Q           = require('q'),
    nodemailer  = require('nodemailer'),
    Imap        = require('imap'),
    inspect     = require('util').inspect,
    Parser      = require('imap-parser'),
    parser      = new Parser();

module.exports = exports = {
  get: function (req, res, next) {
    var $promise = Q.nbind(Crunch.find, Crunch);
    $promise()
      .then(function (crunch) {
        res.json(crunch);
      })
       .fail(function (reason) {
        next(reason);
      });
  },

  post: function (req, res, next) {

    var buffer = '';
    req.on('data', function(data){
      buffer += data.toString('utf8')
    });
    req.on('end', function(){
      buffer = buffer.split('###');
      var to = buffer[1];
      var subject = buffer[2];
      var message = buffer[3];

      var smtpTransport = nodemailer.createTransport("SMTP",{
          service: "Gmail",
          auth: {
              user: "bizarroforrest",
              pass: "mailcrunch"
          }
      });
      var mailOptions = {
          from: "<bizarroforrest@gmail.com>", 
          to: to, 
          subject: subject, 
          text: message, 
          html: "<b>" + message + "</b>" 
      }
      smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              console.log("Message sent to: ", to);
          }
      });
    });
    res.end();
  },

  postUpdate: function(req, res, next){
    var buffer = '';
    req.on('data', function(chunk){
      buffer += chunk.toString('utf8');
    });
    req.on('end', function(){
      console.log('buffer: ', buffer)
      var imap = new Imap({
        user: 'bizarroforrest',
        password: 'mailcrunch',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
      });
      var openInbox = function(cb) {
        imap.openBox('INBOX', false, cb);
      };
      imap.connect();
      imap.once('ready', function() {
        openInbox(function(err, box) {
          if (err) throw err;
          imap.search([ buffer ], function(err, results){
            if (err) throw err;
            imap.addFlags(results, 'SEEN');
          });
        });
      });
        
      imap.once('error', function(err) {
        console.log(err);
      });

      imap.once('end', function() {
        console.log('Connection ended');
        imap.end();
      });
    });
    res.end();
  }
};