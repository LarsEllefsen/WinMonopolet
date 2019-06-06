const vinmonopolet = require('vinmonopolet');
const api = require('./api.js')
const cron = require('node-cron')
var async = require('async');
var db_cursor = require('./cursor.js')
const logger = require("./logger.js")
const fs = require('fs');
var request = require('request-promise-native');
var req = require('request')
const http = require('http')
var ndjson = require('ndjson')
var jsonstream = require('JSONStream')
var sqlite3 = require('sqlite3'),
    TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;


let db = new TransactionDatabase(new sqlite3.Database('inv.db', (err) => {
  if (err) {
    logger.error("DB connection failed: " + err.message);
  }
  db.run("PRAGMA foreign_keys = ON")
  console.log('Connected to the inventory database.');
  //Creates a table containing all the beers
  db.run('CREATE TABLE IF NOT EXISTS beers (vmp_id INTEGER PRIMARY KEY, vmp_name TEXT NOT NULL, untappd_name TEXT,' +
  'untappd_id INTEGER, untapped_score REAL, ratebeer_id INT, ratebeer_score REAL, total_score REAL, price INT,' +
  'type TEXT, abv REAL, data TEXT, untappd_ratings INTEGER, ratebeer_ratings INTEGER, active INTEGER DEFAULT 1, brewery TEXT, new INTEGER)', function(err) {
    if (err){
      logger.log("Table creation failed: " + err.message)
    }
  });
}));

let cursor = new db_cursor();

//Some store names contain commas, this function checks if that is the case, if so, formats it for sqlite3.
function formatName(name) {
  if(name.includes(",") || name.includes(' ') || name.includes("&")){
    if(name.includes(".")){
      name = name.substring(0, name.length-1);
    }
    return name.replace(/[,& ]+/g, '_');
  } else {
    return name
  }
}

function jsonData(vmp_url="", containerSize="", untappd_url="", picture_url="",sub_category=""){
  var json = {
    "vmp_url": vmp_url,
    "container_size":  containerSize,
    "untappd_url": untappd_url,
    "picture_url": picture_url,
    "sub_category": sub_category
    }
  return json;
}

function getAllStores(){
    db.run('CREATE TABLE IF NOT EXISTS stores (store_id INTEGER PRIMARY KEY, name TEXT, tableName TEXT, category INTEGER, address TEXT, city TEXT, zip INTEGER, lon REAL, lat REAL)');
    db.beginTransaction(function (err, transaction) {

      vinmonopolet.stream.getStores().on('data', function(store) {
        var tableName = formatName(store.name)
        var category = store.category.substr(-1);
        transaction.run("INSERT OR IGNORE INTO stores VALUES(?,?,?,?,?,?,?,?,?)",[store.butikknummer, store.name, tableName, category, store.streetAddress, store.streetCity, store.postalZip, store.longitude, store.latitude])
      }).on('end', function() {
        transaction.commit(function(err) {
          if(err){
            console.log("Transaction failed: " + err);
          } else {
            console.log('All stores fetched!');
          }
        });
      });

    });

}


/*
Fetches ALL beers from vinmonopolet and writes them to the Beer table.
Takes a long time, so only really used for the initial DB fill or making sure the DB is up to date.
*/
async function getAllBeers(){
  return new Promise(async function (resolve, reject){
    db.run("UPDATE beers SET active = 0 WHERE active = 1");
    let {pagination, products} = await vinmonopolet.getProducts({facet: vinmonopolet.Facet.Category.BEER})
    while (pagination.hasNext) {
      const response = await pagination.next()
      products = products.concat(response.products)
      pagination = response.pagination
    }

    db.beginTransaction(function(err, transaction) {
      async function insert(){
        var t0 = Date.now(); //used for time measurement
        for(i=0; i<products.length; i++) {
            var code = products[i].code
            var name = products[i].name
            var type = products[i].mainSubCategory.name
            var price = products[i].price
            var abv = products[i].abv
            var json = jsonData(products[i].url,products[i].containerSize)
            var vmp_data = JSON.stringify(json);
            var isNew = 0
            if(products[i].newProduct == true){
              isNew = 1
            }
            // transaction.run('INSERT OR IGNORE INTO beers VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [code,name,"placeholder",null,null,null,null,null,price,type,abv,vmp_data.toString()])
            transaction.run('INSERT INTO beers VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (vmp_id) DO UPDATE SET active = 1, new = excluded.new',
            [code,name,"placeholder",null,null,null,null,null,price,type,abv,vmp_data,null,null,1,null,isNew])
        }
      //END TRANSACTION
      transaction.commit(function(err) {
        if(err){
          reject(err.message);
        } else {
          var t1 = Date.now();
          console.log("Hell yeah")
          resolve(true);
        }
      });
    }
      insert();
    });
  })
}

/*
A method for streaming all beers from Vinmonopolet through our heroku proxy.
This is needed to avoid heroku request timeouts, as it is a lengthy operation.
*/
async function fetchFromApi(store=null){
  if(store === null){
    endpoint = 'getAllBeers'
  } else {
    endpoint = 'getStoreInventory/' + store
  }
  var options = {
      uri: 'http://wmp-backend.herokuapp.com/api/' + endpoint,
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true, // Automatically parses the JSON string in the response
      resolveWithFullResponse: true
  };
  return new Promise(async function (resolve, reject){
    var allProducts = []
    request(options)
    .pipe(jsonstream.parse())
    .on('data', function(product){
      allProducts.push(product)
    })
    .on('end', function() {
      resolve(allProducts)
    })

  })
}

/*
Checks the stock of the store in the DB against a current stock, and updates accordingly.
This is to provide correct stock information, add new beers and remove sold out beers.
TODO: Rewrite this to an upsert statement instead, so updatestore can replace "getFromVinmonopolet"
*/
async function updateStore(store){
  return new Promise(async function(resolve, reject){
    const tableName = formatName(store)
    db.run('CREATE TABLE IF NOT EXISTS '+tableName+' (vmp_id INT UNIQUE, stockLevel INTEGER NOT NULL, last_updated DATETIME, FOREIGN KEY(vmp_id) REFERENCES beers(vmp_id))');

    const facets = await vinmonopolet.getFacets();
    const storeFacet = facets.find(facet => facet.name === 'Butikker')
    const storeFacetValue = storeFacet.values.find(val => val.name === store)
    const beer = vinmonopolet.Facet.Category.BEER

    let {pagination, products} = await vinmonopolet.getProducts({facet: [storeFacetValue,beer]})
    while (pagination.hasNext) {
      const response = await pagination.next()
      products = products.concat(response.products)
      pagination = response.pagination
    }

    db.beginTransaction(async function(err, transaction) {
      var date = new Date().toISOString();
      for(i=0; i<products.length; i++){
        transaction.run("INSERT INTO "+tableName+" VALUES (?,?,?) ON CONFLICT (vmp_id) DO UPDATE SET stockLevel = excluded.stockLevel, last_updated = ?",[products[i].code, products[i].chosenStoreStock.stockLevel, date, date]);
      }
      transaction.commit(function(err) {
        if(err){
          logger.log("Transaction failed for updateStore: " + err.message)
        } else {
          db.beginTransaction(function(err, transaction2) {
            transaction2.run("DELETE FROM "+tableName+" WHERE last_updated < ?", [date]);
            transaction2.commit(function(err) {
              if(err){
                reject(err)
              } else {
                console.log("hei")
                resolve(true)
              }
            });
          });

        }
      });
    });
  })

}

/*
Fetches all beers from the selected Vinmonopolet store (@param store) through the API
and inserts them into the database.

@param Store (string), which store to fetch the beers from. Creates table if it does not already exist.
*/
async function getFromVinmonopolet(store){
  const tableName = formatName(store)
  db.run('CREATE TABLE IF NOT EXISTS '+tableName+' (vmp_id INT UNIQUE, stockLevel INTEGER NOT NULL, last_updated DATETIME, FOREIGN KEY(vmp_id) REFERENCES beers(vmp_id))');

  const facets = await vinmonopolet.getFacets();
  const storeFacet = facets.find(facet => facet.name === 'Butikker');
  const storeFacetValue = storeFacet.values.find(val => val.name === store)
  const beer = vinmonopolet.Facet.Category.BEER;

  let {pagination, products} = await vinmonopolet.getProducts({facet: [storeFacetValue,beer]})
  db.beginTransaction(function(err, transaction) {
    async function insert(){
      var t0 = Date.now(); //used for time measurement
      var date = new Date().toISOString();
      while(pagination.hasNext){
        for(i=0; i<products.length; i++) {
          if(products[i].chosenStoreStock.stockLevelStatus == 'inStock') {
            var code = products[i].code
            var name = products[i].name
            var type = products[i].mainSubCategory.name
            var stockLevel = products[i].chosenStoreStock.stockLevel
            var price = products[i].price
            var abv = products[i].abv
            var json = jsonData(products[i].url,products[i].containerSize)
            var vmp_data = JSON.stringify(json);
            var isNew = 0
            if(products[i].newProduct == true){
              isNew = 1
            }
            transaction.run('INSERT OR IGNORE INTO beers VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [code,name,"Placeholder",null,null,null,null,null,price,type,abv,vmp_data,null,null,1,null, isNew]);
            transaction.run('INSERT OR IGNORE INTO '+tableName+' VALUES (?,?,?)', [code,stockLevel,date])
          }
        }
        const response = await pagination.next()
        products = response.products
        pagination = response.pagination
      }
      //END TRANSACTION
      transaction.commit(function(err) {
        if(err){
          logger.log("Transaction failed for getFromVinmonopolet: " + err.message)
        } else {
          var t1 = Date.now();
        }
      });
    }
    insert();
  });
}

db.getAsync = function(sql) {
  var that = this;
  return new Promise(function(resolve, reject){
    that.all(sql, function (err, row) {
      if(err){
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function getIds(){
  return new Promise(async function(resolve, reject){
  db.getAsync("SELECT * FROM beers WHERE untappd_id IS NULL OR untappd_id = '' AND active = 1").then(async function (rows) {
    var updated_rows = await api.getBIDs(rows);
    db.beginTransaction(function(err, transaction) {
      for(i=0; i<updated_rows.length; i++){
        transaction.run('UPDATE beers SET untappd_id = ?, abv = ? WHERE vmp_id = ?',[updated_rows[i].untappd_id, updated_rows[i].abv, updated_rows[i].vmp_id]);
      }
      transaction.commit(function(err) {
        if(err){
          logger.log("getIDS Transaction failed: " + err.message)
          reject(err)
        } else {
          var t1 = Date.now();
          resolve(true)
        }
      });
    });
  });
  })
}

function getScores(){
  return new Promise(async function(resolve, reject) {
    db.getAsync("SELECT * FROM beers WHERE (untapped_score IS NULL OR untapped_score = '') AND active = 1 AND untappd_id != 0").then(async function (rows) {
      var updated_rows = await api.getScores(rows);
      db.beginTransaction(function(err, transaction) {
        for(i=0; i<updated_rows.length; i++){
          transaction.run('UPDATE beers SET untappd_name = ?, untapped_score = ?, untappd_ratings = ?, data = ?, brewery = ? WHERE vmp_id = ?',
          [updated_rows[i].untappd_name, updated_rows[i].untapped_score, updated_rows[i].untappd_ratings, updated_rows[i].data, updated_rows[i].brewery ,updated_rows[i].vmp_id]);
        }
        transaction.commit(function(err) {
          if(err){
            reject(err)
          } else {
            var t1 = Date.now();
            resolve(true)
          }
        });
      });
    });
  })
}

async function updateAllStores(){
  return new Promise(async function (resolve, reject) {
    db.getAsync("SELECT * FROM stores").then( async function(stores) {
      async.eachSeries(stores, function(item,callback){
        updateStore(item.name).then((success) => {
          callback()
        }).catch((err) => {
          logger.log("UpdateStore encountered an error: " + err.message)
          return callback(err)
        })
      }, function done(e) {
        if(e){
          logger.log(e)
          resolve(true)
        } else {
          resolve(true)
        }
      });
    }).catch((err) => {
      reject(err)
    })

  });
}

/*

A function to keep the ratings in the DB updated, since scores change over time, especially for new beers.
Takes in a database cursor that traverses rows.

*/
async function updateDB(cursor){
  return new Promise(function(resolve, reject){
    db.getAsync("SELECT * FROM beers WHERE active = 1 LIMIT 100 OFFSET " + cursor._pos ).then(async function(rows) {
      var updated_rows = await api.getScores(rows);
      db.beginTransaction(function(err, transaction) {
        for(i=0; i<updated_rows.length; i++){
          cursor.inc();
          transaction.run('UPDATE beers SET untapped_score = ?, untappd_ratings = ?, data = ?, brewery = ? WHERE vmp_id = ?',
          [updated_rows[i].untapped_score, updated_rows[i].untappd_ratings, updated_rows[i].data, updated_rows[i].brewery, updated_rows[i].vmp_id]);
        }
        transaction.commit(function(err) {
          if(err){
            reject(err)
          } else {
            console.log(updated_rows.length + " rows updated successfully!")
            if(rows.length < 100){ // If less than 100 rows are returned, we've wrapped around
              cursor.resetPos();
            }
            cursor.savePos();
            resolve(true)
          }
        });
      });
    })
  })
}

/*

A function that gets the beers with the least ratings and updates the score.
Beers with a low amount of ratings is more prone to rapid change. E.G the beer
was very new when it was added to the DB.

*/
async function updateLeastRated(){
  return new Promise(function(resolve, reject){
    db.getAsync("SELECT * FROM beers WHERE active = 1 AND untappd_id != 0 ORDER BY untappd_ratings ASC LIMIT 100").then(async function(rows) {
      var updated_rows = await api.getScores(rows);
      db.beginTransaction(function(err, transaction) {
        for(i=0; i<updated_rows.length; i++){
          transaction.run('UPDATE beers SET untapped_score = ?, untappd_ratings = ?, data = ?, brewery = ? WHERE vmp_id = ?',
          [updated_rows[i].untapped_score, updated_rows[i].untappd_ratings, updated_rows[i].data, updated_rows[i].brewery, updated_rows[i].vmp_id]);
        }
        transaction.commit(function(err) {
          if(err){
            reject(err)
          } else {
            resolve(updated_rows.length + " of the least rated beers have been updated.")
          }
        });
      });
    })
  })
}



function createSQLStatement(filters, table){
  return new Promise(function(resolve, reject){
    var styles=''
    var price=''
    var abv = ''
    var new_only = ''
    var sql = 'SELECT * FROM ' + table + ' NATURAL JOIN beers WHERE '
    var activeFilters = []

    if(filters.style.length && filters.style != null){
      styles = 'type IN ('
      filters.style.forEach((item) => {
        styles += '"'+item+'",'
      })
      styles = styles.slice(0, -1) + ")"
      activeFilters.push(styles)
    }


    if(filters.price != null){
      price = 'price >= ' + filters.price[0] + ' AND price <= ' + filters.price[1]
      activeFilters.push(price)
    }

    if(filters.abv != null){
      abv = 'abv >= ' + filters.abv[0] + ' AND abv <= ' + filters.abv[1]
      activeFilters.push(abv)
    }

    if(filters.new_only != false){
      new_only = 'new = 1'
      activeFilters.push(new_only)
    }

    if(activeFilters.length){
      // sql += 'WHERE '
      activeFilters.forEach((item) =>{
        sql += item + ' AND '
      })
    }

    sql += ' active = 1 AND untapped_score IS NOT NULL'
    sql += ' ORDER BY untapped_score DESC'
    resolve(sql);
  });
}

function updateRoutine(){
  return new Promise((resolve, reject) => {
    getAllBeers().then((success) => {
      updateAllStores().then((success) => {
        getIds().then((success) => {
          getScores().then((success) =>{
            updateDB(cursor).then((success) => {
              logger.info("Routine update was successfully executed.")
              /* Everything worked!!*/
              api.sendLogs().then((success) => {
                logger.flush_log()
                resolve("Routine update was successfully executed.")
              }).catch((err) =>{

              })
            }).catch((err) =>{
              logger.log("updateDB encountered an error: " + err.message)
              reject("updateDB encountered an error: " + err.message)
            })
          }).catch((err) =>{
            logger.log("getScores encountered an error: " + err.message)
            reject("getScores encountered an error: " + err.message)
          })
        }).catch((err) => {
          logger.log("getIDs encountered an error: " + err.message)
          reject("getIDs encountered an error: " + err.message)
        })

      }).catch((err) =>{
        logger.log("updateAllStores encountered an error: " + err.message)
        reject("updateAllStores encountered an error: " + err.message)
      })
      //getBIDs
      //getScores
    }).catch((err) => {
      logger.log("getAllBeers encountered an error: " + err)
      reject("getAllBeers encountered an error: " + err)
    })
  })
}


cron.schedule('15 0 * * *', () => {
// cron.schedule('0 0 0 * * *', () => {
  console.log("Starting routine update")
  updateRoutine().then((success) => {
    console.log(success)
  })

});


cron.schedule('0 0 2 * * *', () => {
  updateLeastRated().then((success) => {
    console.log("Updating least rated!")
  }).catch((err) => {
    logger.log("updateLeastRated encountered an error: " + err)
  });
});

updateStore("Skien")


module.exports = {

  fetchFromStore: async function (store, filters){
    return new Promise(async function(resolve, reject) {
      var table = formatName(store);
      var sql = await createSQLStatement(filters, table)
      db.getAsync(sql).then((rows) => {
        resolve(rows);
      }).catch((err) => {
        reject(err.message);
      });
    });
  },

  fetchStores: async function(){
    return new Promise(function(resolve, reject) {
      db.getAsync("SELECT * FROM stores").then((rows) => {
        resolve(rows);
      }).catch((err) => {
        reject(err.message);
      });
    });
  },

  getBeersAdmin: async function(type){
    return new Promise(function(resolve, reject) {
      var query = ''
      if(/^\d+$/.test(type) && type !== '0' && type !== 'null'){
        query = "SELECT * FROM beers WHERE vmp_id = " + type
      } else if(type !== '0' && type !== 'null'){
        query = "SELECT * FROM beers WHERE vmp_name LIKE '%" + type + "%'"
      } else {
        query = 'SELECT * FROM beers WHERE untappd_id IS '+type+' OR untappd_id = '+type
      }
      db.getAsync(query).then((rows)=>{
        resolve(rows)
      }).catch((err)=>{
        console.log(err)
        reject(err.message)
      })
    })
  },

  updateBeer: async function(item){
    beer = item.beer
    return new Promise(function(resolve, reject) {
      db.beginTransaction(function(err, transaction) {
        transaction.run('UPDATE beers SET untapped_score = ?, untappd_id = ?, untappd_ratings = ?, price = ?, type= ?, abv = ?, data = ?, brewery = ? WHERE vmp_id = ?',
        [beer.untapped_score, beer.untappd_id, beer.untappd_ratings, beer.price, beer.type, beer.abv, beer.data, beer.brewery, beer.vmp_id]);
        transaction.commit(function(err) {
          if(err){
            reject(err)
          } else {

            resolve(beer.vmp_name + " was updated successfully!")
          }
        });
      });
    })
  },

  triggerUpdateRoutine: function(){
    console.log("Update routine triggered from admin")
    updateRoutine()
  }

}
