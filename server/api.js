//Imports
var config = require("./config.js")
var request = require('request-promise-native');
const https = require('https');

const clientID = config.unt_clientId;
const clientSecret = config.unt_clientSecret;

var options = {
    uri: 'https://api.untappd.com/v4/search/beer',
    qs: {
        client_id: clientID, // -> uri + '?access_token=xxxxx%20xxxxx'
        client_secret: clientSecret,
        q: "Nøgne Ø Imperial Stout"
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true, // Automatically parses the JSON string in the response
    resolveWithFullResponse: true
};

// var url = 'https://api.untappd.com/v4/search/beer?client_id='+config.unt_clientId+'&client_secret='+config.unt_clientSecret+'&q=Mack Mikrobryggeri Error 404 Dubbel/Saison'
//
// request(url, function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     var res = JSON.parse(body)
//     var count =  res.response.beers.count
//     var remaining = parseInt(response.headers['x-ratelimit-remaining'])
//     // console.log(res.response.beers.items[0].beer.bid)
//     console.log(count)
//   } else {
//     console.log(response.statusCode)
//   }
// });

module.exports = {

/*
Tries to get the BID (beer ID) that untappd uses for the given beer.
Since the naming convetion between vinmonopolet and Untappd is different, it is no guaranteed to find it.
*/
  // getBID : async function(name){
  //   var url = 'https://api.untappd.com/v4/search/beer?client_id='+clientID+'&client_secret='+clientSecret+'&q='+name
  //
  //   request(url, function (error, response, body) {
  //     var res = JSON.parse(body)
  //     var count =  res.response.beers.count
  //     var remaining = parseInt(response.headers['x-ratelimit-remaining'])
  //     if (!error && response.statusCode == 200 && remaining >1 ) {
  //       if(count == 0){
  //         return null
  //       }
  //       console.log(res.response.beers.items[0].beer.bid)
  //       var bid = res.response.beers.items[0].beer.bid
  //       return bid
  //     } else {
  //       console.log(response.statusCode)
  //       return false
  //     }
  //   });
  // }

//rewrite to allow ALL rows, and do the iteration in here instead
  getBID : function(row){
    return new Promise(function (resolve, reject){
      setTimeout(function() {
      options.qs.q = row.vmp_name;
      request(options).then(function(res) {
        var remaining = res.headers['x-ratelimit-remaining'];
        var count = res.body.response.beers.count;
        // console.log(res.body.response.beers.items[0].beer.bid);
        if(res.statusCode == 200 && remaining >50){
          console.log(remaining);
            if(count != 0){
              row.untappd_id = res.body.response.beers.items[0].beer.bid;
              row.abv = res.body.response.beers.items[0].beer.beer_abv;
              resolve(row);
            } else {
              row.vmp_id = 0;
              row.abv = 0;
              resolve(row);
            }
        } else {
          if(remaining <=50){
            reject("API limit is reached");
        } else {
            reject("Something went wrong. Returned statuscode is: " + res.statusCode);
        }
        }
      });
    },1000);//timeout
  });//Klamma her
  }

}
