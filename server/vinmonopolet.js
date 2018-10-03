const vinmonopolet = require('vinmonopolet')
const sqlite3 = require('sqlite3')

let db = new sqlite3.Database('inv.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the inventory database.');
});

//Some store names contain commas, this function checks if that is the case, if so, formats it for sqlite3.
function formatName(name) {
  if(name.includes(",")){
    return name.replace(/, /g, '_');
  } else {
    return name
  }
}

//Gets
function getBeersByStore(store){
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
    console.log(response.products[0])
    console.log(response.pagination)
  })
}

getBeersByStore('Trondheim, Bankkvartalet')
