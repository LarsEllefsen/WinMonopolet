//Imports
var config = require("./config.js")
var request = require('request-promise-native');
const https = require('https');
var async = require('async');

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

array = ["item1","item2","item3","item4","item5","item6"];

function getBID(row){
  return new Promise(function (resolve, reject){
        options.qs.q = row.vmp_name;
        request(options).then(function(res) {
          var remaining = res.headers['x-ratelimit-remaining'];
          var count = res.body.response.beers.count;
          // console.log(res.body.response.beers.items[0].beer.bid);
          if(res.statusCode == 200 && remaining >=1){
            console.log(remaining);
              if(count != 0){
                row.untappd_id = res.body.response.beers.items[0].beer.bid;
                row.abv = res.body.response.beers.items[0].beer.beer_abv;
                resolve(row);
              } else {
                row.untappd_id = 0;
                row.abv = 0.0;
                resolve(row);
              }
          } else {
            if(res.headers['status'] == 429){
              reject("Api limit reached for this hour");
            } else {
              reject("The API encountered an error, statusCode " + res.statusCode)
            }

          }
    }).catch(function (err) {
      reject("API limit reached for this hour");
    });

  });//Klamma her
  }

var fetchData = function (item) {
  return new Promise(function (resolve, reject){
    resolve(item);
  });
}

function testSub(item){
  return new Promise(function (resolve, reject) {
    setTimeout(() =>{
      var upper = item.toUpperCase()
      if(upper=="ITEM4"){
        reject("Item4 failed")
      } else {
        resolve(upper);
    }
    }, 1000)
  });
}

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

test : function(input){
  return new Promise(function(resolve, reject) {
    var newArr = [];
    async.eachSeries(input, function(eachitem,next){
      testSub(eachitem.vmp_name).then((item) =>{
        newArr.push(item);
        console.log(item)
        next();
      }).catch((err) => {
        return next(err);
      });
    }, function done(e) {
      if(e){
        console.log(e + "But these items worked: " + newArr)
        resolve(newArr);
      } else {
        resolve(newArr);
      }
    });
  });
},

  getBIDs : function(rows){
    return new Promise(function(resolve, reject) {
      updatedBeers = [];
      async.eachSeries(rows, function(item,callback){
        getBID(item).then((updatedItem) => {
          updatedBeers.push(updatedItem);
          callback();
        }).catch((err) => {
          return callback(err);
        });
      }, function done(e) {
        if(e){
          console.log(e);
          resolve(updatedBeers);
        } else {
          resolve(updatedBeers);
        }
      });
    });
  }

}
