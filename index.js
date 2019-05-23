var express = require('express');
const vm = require('./server/vinmonopolet.js')
const api = require('./server/api.js')
var bodyParser = require("body-parser");
const logger = require("./server/logger.js")
const path = require('path');
const jwt = require('jsonwebtoken');
var cors = require('cors')

var app = express();

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))

app.use(cors())

// Add headers
// app.use(function (req, res, next) {
//
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');
//
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);
//
//     // Pass to next layer of middleware
//     next();
// });


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/getFromStore/:storeName/:searchFilters', function(req, res) {
  var searchFilters = JSON.parse(req.params.searchFilters)
  vm.fetchFromStore(req.params.storeName, searchFilters).then((result) => {
    res.send(result);
  }).catch((err) => {
    logger.log("getFromStore route encountered an error: " + err)
  })

});

app.get('/api/getStores', function(req, res) {
  vm.fetchStores().then((result) => {
    res.send(result);
  }).catch((err) => {
    console.log(err)
    logger.log("getStores route encountered an error: " + err)
  });
});



// Anything that doesn't match the above, send back index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'))
  })

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
})
// module.exports = app;
