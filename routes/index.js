var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;
if (process.env.PORT){
  var config = {
  accountSid: process.env.accountSid,
  authToken: process.env.authToken,
  twilioNumber: process.env.twilioNumber
  }
} else {
  var config = require('../config');
}



// Create a Twilio REST API client for authenticated requests to Twilio
var client = twilio(config.accountSid, config.authToken);


// Configure application routes
module.exports = function(app) {

    // Express static file middleware - serves up JS, CSS, and images from the
    // "public" directory where we started our webapp process
    // app.use(express.static(path.join(process.cwd(), 'public')));

    // Parse incoming request bodies as form-encoded
    app.use(bodyParser.urlencoded({
        extended: true,
    }));

    // Use morgan for HTTP request logging
    app.use(morgan('dev'));

    // Handle an AJAX POST request to place an outbound call
    app.post('/call', function(request, response) {
        // This should be the publicly accessible URL for your application
        // Here, we just use the host for the application making the request,
        // but you can hard code it or use something different if need be
        // var salesNumber = request.body.salesNumber;
        var url = 'http://' + request.headers.host + '/outbound/' + encodeURIComponent(config.twilioNumber)
        // var url = 'http://' + request.headers.host + '/outbound'
        // console.log('url is', url)
        // console.log('phoneNumber is', request.body.phoneNumber)
        var options = {
            to: request.body.phoneNumber,
            from: config.twilioNumber,
            url: url,
        };
  
        // Place an outbound call to the user, using the TwiML instructions
        // from the /outbound route
        client.calls.create(options)
          .then((message) => {
            console.log(message.responseText);
            response.send({
                message: 'Thank you! Chi-bot will be calling you shortly.',
            });
          })
          .catch((error) => {
            console.log(error);
            response.status(500).send(error);
          });
    });

    // Return TwiML instuctions for the outbound call
    app.post('/outbound/:twilioNumber', function(request, response) {
        const twimlResponse = new VoiceResponse();
        const timeout = 4;  
        // console.log('got to outbound route')
        twimlResponse.say("Welcome to Chi's Twilio testing app");
        response.gather({
          hints: 'yes, no',
          input: 'speech',
          timeout: timeout,
          action:'/saidSomething'
        }).say('Please say Yes, or, No.')
        twimlResponse.say(`No response given in ${timeout} seconds `);
        twimlResponse.hangup();
        // twimlResponse.redirect({
        //   method:'POST'
        // }, '/outbound/123')

        console.log("outbound", twimlResponse.toString());
        response.send(twimlResponse.toString());
      });
      
      app.post('/saidSomething', (req, res) => {
        console.log('req.SpeechResult is', req.SpeechResult)
        console.log(req)
        res.end(req.SpeechResult)
    })
};