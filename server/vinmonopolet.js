const vinmonopolet = require('vinmonopolet');
const scraper = require('./scraper.js');
const config = require('./config.js')
const api = require('./api.js')
var Promise = require('promise');
var sqlite3 = require('sqlite3'),
    TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;


let db = new TransactionDatabase(new sqlite3.Database('inv.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  db.run("PRAGMA foreign_keys = ON")
  console.log('Connected to the inventory database.');
  //Creates a table containing all the beers
  db.run('CREATE TABLE IF NOT EXISTS beers (vmp_id INTEGER PRIMARY KEY, vmp_name TEXT NOT NULL, untappd_name TEXT, untappd_id INTEGER, untapped_score REAL, ratebeer_id INT, ratebeer_score REAL, total_score REAL, price INT, type TEXT, abv REAL)', function(err) {
    if (err){
      console.log(err.message)
    }
  });
}));

//Some store names contain commas, this function checks if that is the case, if so, formats it for sqlite3.
function formatName(name) {
  if(name.includes(",")){
    return name.replace(/, /g, '_');
  } else {
    return name
  }
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
            console.log('Done!');
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
  let {pagination, products} = await vinmonopolet.getProducts({facet: vinmonopolet.Facet.Category.BEER})

  db.beginTransaction(function(err, transaction) {
    async function insert(){
      var t0 = Date.now(); //used for time measurement
      while(pagination.hasNext){
        for(i=0; i<products.length; i++) {
            var code = products[i].code
            var name = products[i].name
            var type = products[i].mainSubCategory.name
            var price = products[i].price
            var abv = products[i].abv
            transaction.run('INSERT OR IGNORE INTO beers VALUES (?,?,?,?,?,?,?,?,?,?,?)', [code,name,"placeholder",null,null,null,null,null,price,type,abv])
        }
        const response = await pagination.next()
        products = response.products
        pagination = response.pagination
      }
      //END TRANSACTION
      transaction.commit(function(err) {
        if(err){
          console.log("Transaction failed: " + err.message)
        } else {
          var t1 = Date.now();
          console.log("Transaction successful! Took " + (t1 - t0) + " milliseconds.")
        }
      });
    }
    insert();
  });
}

/*
Checks the stock of the store in the DB against a current stock, and updates accordingly.
This is to provide correct stock information, add new beers and remove sold out beers.
*/
async function updateStore(store){
  const tableName = formatName(store)
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

  db.beginTransaction(function(err, transaction) {
    var date = new Date().toISOString();
    for(i=0; i<products.length; i++){
      transaction.run("UPDATE "+tableName+" SET stockLevel = ?, last_updated = ? WHERE vmp_id = ?",[products[i].chosenStoreStock.stockLevel, date, products[i].code]);
    }
    transaction.commit(function(err) {
      if(err){
        console.log("Transaction failed: " + err.message)
      } else {
        db.beginTransaction(function(err, transaction2) {
          transaction2.run("DELETE FROM "+tableName+" WHERE last_updated < ?", [date]);
          transaction2.commit(function(err) {
            if(err){
              console.log(err.message)
            } else {
              console.log(store + " updated successfully!")
            }
          });
        });

      }
    });
  });

}

/*
Fetches all beers from the selected Vinmonopolet store (@param store) through the API
and inserts them into the database.

@param Store (string), which store to fetch the beers from. Creates table if it does not already exist.
*/
async function getFromVinmonopolet(store){
  const tableName = formatName(store)
  console.log("Querying store: "+tableName)
  db.run('CREATE TABLE IF NOT EXISTS '+tableName+' (vmp_id INT UNIQUE, stockLevel INTEGER NOT NULL, last_updated DATETIME, FOREIGN KEY(vmp_id) REFERENCES beers(vmp_id))');

  const facets = await vinmonopolet.getFacets();
  const storeFacet = facets.find(facet => facet.name === 'Butikker')
  const storeFacetValue = storeFacet.values.find(val => val.name === store)
  const beer = vinmonopolet.Facet.Category.BEER

  let {pagination, products} = await vinmonopolet.getProducts({facet: [storeFacetValue,beer]})
  /*
  TRANSACTION BEGINS HERE
  Due to the way transactions work with async, we need to do all the async operations (await) inside a new async function after
  starting the transaction function, thus the need for a nested function. A bit clunky, but it gets the job done.
*/
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
            // console.log(products[i])
            // console.log(type)
            transaction.run('INSERT OR IGNORE INTO beers VALUES (?,?,?,?,?,?,?,?,?,?,?)', [code,name,"placeholder",null,null,null,null,null,price,type,abv])
            transaction.run('INSERT OR IGNORE INTO '+tableName+' VALUES (?,?,?)', [code,stockLevel,date])
          }
        }
        const response = await pagination.next()
        products = response.products
        // products = products.concat(response.products)
        pagination = response.pagination
      }
      //END TRANSACTION
      transaction.commit(function(err) {
        if(err){
          console.log("Transaction failed: " + err.message)
        } else {
          var t1 = Date.now();
          console.log("Transaction successful! Took " + (t1 - t0) + " milliseconds.")
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

function getIdsTest(){
  db.getAsync("SELECT * FROM beers WHERE untappd_id IS NULL OR untappd_id = ''").then(async function (rows) {
    var updated_rows = await api.getBIDs(rows);
    db.beginTransaction(function(err, transaction) {
      for(i=0; i<updated_rows.length; i++){
        transaction.run('UPDATE beers SET untappd_id = ?, abv = ? WHERE vmp_id = ?',[updated_rows[i].untappd_id, updated_rows[i].abv, updated_rows[i].vmp_id]);
      }
      transaction.commit(function(err) {
        if(err){
          console.log("Transaction failed: " + err.message)
        } else {
          var t1 = Date.now();
          console.log("Transaction successful!")
        }
      });
    });
  });
}

getAllStores();
// getFromVinmonopolet("Trondheim, Bankkvartalet");
// getIdsTest();
// api.getBID("hei")
// updateStore("Trondheim, Bankkvartalet");
// api.test("Nøgne Ø Porter");
// getAllBeers();
// check_store('Trondheim, Bankkvartalet')
// check_store('Trondheim, Valentinlyst')
// check_store('Malvik')
// scraper.getRatingByName("Omnipollo Buxton Original Double Vanilla Ice Cream IIPA").then(function(value) {
//   console.log(value)
// });
