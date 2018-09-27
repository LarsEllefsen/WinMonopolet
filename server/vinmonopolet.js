const vinmonopolet = require('vinmonopolet')
const sqlite3 = require('sqlite3')

let db = new sqlite3.Database('inv.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the inventory database.');
});

db.run('CREATE TABLE IF NOT EXISTS beers(id INTEGER PRIMARY KEY ON CONFLICT IGNORE, name TEXT NOT NULL, type TEXT NOT NULL, price REAL NOT NULL, score REAL NOT NULL, stockLevel INTEGER NOT NULL)');


vinmonopolet.getFacets().then(facets => {
  const storeFacet = facets.find(facet => facet.name === 'Butikker')
  const storeFacetValue = storeFacet.values.find(val => val.name === 'Trondheim, Bankkvartalet')

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
      db.run('INSERT OR IGNORE INTO beers VALUES (?,?,?,?,?,?)', [code,name,type,price,69.0,stockLevel])
    }
  }
  console.log(response.products[0])
})
