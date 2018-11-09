//Imports
var UntappdClient = require("node-untappd");
var config = require("./config.js")

//Set up credentials
var clientId = config.unt_clientId;
var clientSecret = config.unt_clientSecret;

// Set to true if you want to see all sort of nasty output on stdout.
var debug = false;

//Create and set up the Untappd client
var untappd = new UntappdClient(debug);
untappd.setClientId(clientID);
untappd.setClientSecret(clientSecret)
