const vinmonopolet = require('vinmonopolet')
var sqlite3 = require('sqlite3'),
    TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;

let db = new TransactionDatabase(new sqlite3.Database('inv.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the inventory database.');
  db.run('CREATE TABLE IF NOT EXISTS stores (store_id INTEGER PRIMARY KEY, name TEXT NOT NULL, last_updated TEXT NOT NULL)', function(err) {
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


function createOrUpdate(store, exists){
  var date = new Date();
  if(exists){
    db.run('UPDATE stores SET last_updated = ? WHERE name = ?', [date,store])
  } else {
    db.run('INSERT INTO stores VALUES (?,?,?)', [null,store,date], function(err) {
      if (err){
        console.log(err.message)
      }
    })
  }
}

//Gets all beers from the selected store and inserts into table.
function getBeersByStore(store, exists){
  const tableName = formatName(store)
  console.log(tableName)
  db.run('CREATE TABLE IF NOT EXISTS '+tableName+' (id INTEGER PRIMARY KEY ON CONFLICT IGNORE, name TEXT NOT NULL, type TEXT NOT NULL, price REAL NOT NULL, score REAL NOT NULL, stockLevel INTEGER NOT NULL)');

  vinmonopolet.getFacets().then(facets => {
    const storeFacet = facets.find(facet => facet.name === 'Butikker')
    const storeFacetValue = storeFacet.values.find(val => val.name === store)

    const productFacet = facets.find(facet => facet.name === 'productCategory')
    const beer = vinmonopolet.Facet.Category.BEER

    return vinmonopolet.getProducts({facet: [storeFacetValue, beer]})
  }).then(response => {
    var pagination = response.pagination
      while(pagination.hasNext){
        for(i=0; i<response.products.length; i++) {
          if(response.products[i].chosenStoreStock.stockLevelStatus == 'inStock') {
            var code = response.products[i].code
            var name = response.products[i].name
            var type = response.products[i].mainSubCategory.name
            var stockLevel = response.products[i].chosenStoreStock.stockLevel
            var price = response.products[i].price
            // console.log(type)
            db.run('INSERT OR IGNORE INTO '+tableName+' VALUES (?,?,?,?,?,?)', [code,name,type,price,69.0,stockLevel])
          }
        }
        pagination = pagination.next();
      }
    console.log(typeof response)
    console.log(pagination)

  })
  createOrUpdate(store,exists)
}

//Checks the store against the store table to see when it was last updated.
//If it exists and is fresher than a set threshold (tbd), select from DB, else getBeersByStore
function check_store(store){
  db.get('SELECT * FROM stores WHERE name=?', [store], (err, row) =>{
    if(err){
      console.log(err.message)
    } else {
      //If undefined, the store has yet to be created.
      if(row == undefined) {
        getBeersByStore(store, false)
      } else {
        console.log(row)
      }
    }
  });
}

async function test(store){
  const tableName = formatName(store)
  console.log("Querying store: "+tableName)
  db.run('CREATE TABLE IF NOT EXISTS '+tableName+' (id INTEGER PRIMARY KEY ON CONFLICT IGNORE, name TEXT NOT NULL, type TEXT NOT NULL, price REAL NOT NULL, score REAL NOT NULL, stockLevel INTEGER NOT NULL)');

  const facets = await vinmonopolet.getFacets();
  const storeFacet = facets.find(facet => facet.name === 'Butikker')
  const storeFacetValue = storeFacet.values.find(val => val.name === store)
  const beer = vinmonopolet.Facet.Category.BEER

  let {pagination, products} = await vinmonopolet.getProducts({facet: [storeFacetValue,beer]})
  db.beginTransaction(function(err, transaction) {
    async function insert(){
      while(pagination.hasNext){
        for(i=0; i<products.length; i++) {
          if(products[i].chosenStoreStock.stockLevelStatus == 'inStock') {
            var code = products[i].code
            var name = products[i].name
            var type = products[i].mainSubCategory.name
            var stockLevel = products[i].chosenStoreStock.stockLevel
            var price = products[i].price
            // console.log(type)
            transaction.run('INSERT OR IGNORE INTO '+tableName+' VALUES (?,?,?,?,?,?)', [code,name,type,price,69.0,stockLevel])
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
          console.log("Transaction successful!")
        }
      });
    }
    insert()
  });
}

// check_store('Trondheim, Bankkvartalet')
// check_store('Trondheim, Valentinlyst')
test('Trondheim, Bankkvartalet')
//getBeersByStore('Trondheim, Bankkvartalet')
