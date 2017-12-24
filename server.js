var express = require('express');
var config = require('./config');

// var router = express.Router();

//express server
var app = express();
var port = process.env.PORT || 3000;

require('/routes')(app);

app.get('*', function (request, response){
  response.redirect('/');
})


app.listen(port, function() {
  console.log(`Server is running on port ${port}`);
});