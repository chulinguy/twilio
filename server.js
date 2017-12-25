var express = require('express');

// var router = express.Router();

//express server
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static("public"));
require('./routes')(app);

app.get('*', function (request, response){
  response.redirect('/');
})


app.listen(port, function() {
  console.log(`Server is running on port ${port}`);
});