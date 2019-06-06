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
