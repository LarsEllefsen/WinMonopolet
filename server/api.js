//Imports
var config = require("./config.js")
var request = require('request');
const https = require('https');


var propertiesObject = { field1:'Nøgne Ø Porter'};

var url = 'https://api.untappd.com/v4/search/beer?client_id='+config.unt_clientId+'&client_secret='+config.unt_clientSecret+'&q=pliny'

request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body);
  } else {
    console.log(response.statusCode)
  }
});
