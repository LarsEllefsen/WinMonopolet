//Imports
var config = require("./config.js")
var request = require('request-promise-native');
const https = require('https');
var async = require('async');
const logger = require("./logger.js")
var mailgun = require('mailgun-js')(config.emailConfig);
const clientID = config.unt_clientId;
const clientSecret = config.unt_clientSecret;


var options_BID = {
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

var options_SCORE = {
    uri: 'https://api.untappd.com/v4/beer/info/',
    qs: {
        client_id: clientID, // -> uri + '?access_token=xxxxx%20xxxxx'
        client_secret: clientSecret
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true, // Automatically parses the JSON string in the response
    resolveWithFullResponse: true
};


var words = ["Dobbel","APA","IPA","Imperial","Stout","2017", "2018", "2016", "2015", "Red Ale", "Witbier", "Doppelbock", "Hefeweissbier", "Pastry", "Quadrupel", "Coffee", "Amber Ale", "Porter", "Barley Wine", "Saison", "Red IPA", "Amber", "American Barley Wine",  "East Coast IPA", "American Pale Ale", "Double IPA"];

function getBID(row){
  return new Promise(function (resolve, reject){
    var new_name = formatName(row.vmp_name)
        options_BID.qs.q = row.vmp_name;
        request(options_BID).then(function(res) {
          var remaining = res.headers['x-ratelimit-remaining'];
          var count = res.body.response.beers.count;
          if(res.statusCode == 200 && remaining >=1){
              if(count != 0){
                row.untappd_id = res.body.response.beers.items[0].beer.bid;
                row.abv = res.body.response.beers.items[0].beer.beer_abv;
                logger.info(row.vmp_name + " - id found: " + row.untappd_id);
                resolve(row);
              } else {
                getBID_smart(row).then(function(res) {
                  resolve(res);
                }).catch(function (err) {
                  reject(err.message);
                })
              }
          } else {
            if(res.headers['status'] == 429){
              reject("Api limit reached for this hour");
            } else {
              reject("The API encountered an error, statusCode " + res.statusCode)
            }

          }
    }).catch(function (err) {
      reject(err.message);
    });

  });
}

function getBID_smart(row){
  return new Promise(function (resolve, reject){
    var new_name = formatName(row.vmp_name)
    options_BID.qs.q = new_name;
        request(options_BID).then(function(res) {
          var remaining = res.headers['x-ratelimit-remaining'];
          var count = res.body.response.beers.count;
          if(res.statusCode == 200 && remaining >=1){
              if(count != 0){
                row.untappd_id = res.body.response.beers.items[0].beer.bid;
                row.abv = res.body.response.beers.items[0].beer.beer_abv;
                logger.info(row.vmp_name + " - id found: " + row.untappd_id);
                resolve(row);
              } else {
                row.untappd_id = 0;
                row.abv = 0.0;
                logger.info(row.vmp_name + " - could not find ID!");
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
      reject(err.message);
    });

  });
}

function getScore(row){
  return new Promise(function (resolve, reject){
    var data = JSON.parse(row.data);
    var options = options_SCORE;
    options.uri = 'https://api.untappd.com/v4/beer/info/'+row.untappd_id;
    request(options).then(function(res) {
      var remaining = res.headers['x-ratelimit-remaining'];
      if(res.statusCode == 200 && remaining >=1){
        row.untappd_name = res.body.response.beer.beer_name;
        row.untapped_score = res.body.response.beer.rating_score;
        row.untappd_ratings = res.body.response.beer.rating_count;
        data.untappd_url = res.body.response.beer.beer_slug + "/"+res.body.response.beer.bid;
        data.picture_url = res.body.response.beer.beer_label;
        row.brewery = res.body.response.beer.brewery.brewery_name;
        data.sub_category = res.body.response.beer.beer_style;
        row.data = JSON.stringify(data);
        resolve(row)
      } else {
        if(res.headers['status'] == 429){
          reject("API limit reached for this hour");
        } else {
          reject("The API encountered an error, statusCode " + res.statusCode);
        }
      }
    }).catch(function (err) {
      reject("The API encountered an error: " + err.message);
    })
  });
}

/*
A function that tries to reformat the name of the beer coming from Vinmonopolet better search in Untappd.
Usually this is just stripping the style at end of the name (APA, IPA, imperial stout etc), because
vinmonopolet loves to add differnet stuff to the name.
*/
function formatName(name){
    var re = new RegExp('\\b('+words.join('|')+')\\b', 'g');
    var new_name = (name || '').replace(re,'').replace(/[]{2,}/,' ');
    return new_name;
}
module.exports = {

/*
Tries to get the BID (beer ID) that untappd uses for the given beer.
Since the naming convetion between vinmonopolet and Untappd is different, it is no guaranteed to find it.
*/
  getBIDs : function(rows){
    return new Promise(function(resolve, reject) {
      var updatedBeers = [];
      async.eachSeries(rows, function(item,callback){
        getBID(item).then((updatedItem) => {
          updatedBeers.push(updatedItem);
          callback();
        }).catch((err) => {
          return callback(err);
        });
      }, function done(e) {
        if(e){
          logger.log(e)
          resolve(updatedBeers);
        } else {
          resolve(updatedBeers);
        }
      });
    });
  },

  getScores: function(rows){
    return new Promise(function(resolve, reject) {
      var updatedBeers = [];
      async.eachSeries(rows, function(item,callback){
        getScore(item).then((updatedItem) => {
          updatedBeers.push(updatedItem);
          callback();
        }).catch((err) => {
          return callback(err);
        });
      }, function done(e) {
        if(e){
          logger.log(e)
          resolve(updatedBeers);
        } else {
          resolve(updatedBeers);
        }
      });
    });
  },

  sendMail: function(data){
    return new Promise(function(resolve, reject) {
      mailgun.messages().send(data, function (error, body) {
        if(!error) {
          resolve(body)
        } else {
          console.log(error)
          reject(error)
        }
      });
    })
  },

  sendLogs: function(){
    return new Promise(function(resolve, reject) {
      logs = logger.getInfoLogs()
      if(logs){
        attach = new mailgun.Attachment({data: logs, filename: "info_logs.txt"});
        var data = {
          from: 'Logger <mail@mg.winmonopolet.com>',
          to: 'mail@winmonopolet.com',
          subject: '[INFO LOGS] ' + logger.time_now(),
          text: 'Info logs for winmonopolet.com are attached below',
          attachment: attach
        };

        mailgun.messages().send(data, function (error, body) {
          if(!error) {
            resolve(body)
          } else {
            reject(error)
          }
        });
      } else {
        reject("No logs to send")
      }
    })
  }

}
