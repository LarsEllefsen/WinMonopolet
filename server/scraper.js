let cheerio = require('cheerio')
var request = require('request');

module.exports = {

  getRatingByName: async function (beer){
    var searchTerm = beer.replace(/ /g,"+");
    console.log('https://untappd.com/search?q='+searchTerm)
    var scores = [];

    request('https://untappd.com/search?q='+searchTerm, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('.num').each(function(i, element){
          scores[i] = $(this).text();
        });
      }
      console.log(scores)
    });
//----Returns a promise wit
    return new Promise(resolve => {
      setTimeout(() => {
        var res = scores[0].slice(1,-1);
        resolve(res);
      }, 2000);
    });
  }

}
