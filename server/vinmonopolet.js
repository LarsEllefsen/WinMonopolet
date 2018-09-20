const vinmonopolet = require('vinmonopolet')
const sqlite3 = require('sqlite3')

<<<<<<< HEAD
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
      db.run('INSERT INTO beers VALUES (?,?,?,?,?,?)', [code,name,type,price,69.0,stockLevel])
    }
  }
  console.log(response.products[0])
  // console.log(response.products) // 3 products from Norway
=======

//vinmonopolet.getFacets().then(facets => {
  //const storeFacet = facets.find(facet => facet.name === 'Butikker')
  //const storeFacetValue = storeFacet.values.find(val => val.name === 'Trondheim, Bankkvartalet')

  //const productFacet = facets.find(facet => facet.name === 'productCategory')
  //const beer = vinmonopolet.Facet.Category.BEER

  //return vinmonopolet.getProducts({facet: [storeFacetValue, beer]})
//}).then(response => {
  //console.log(response.products) // 3 products from Norway
//})


async function getAllBeers() {

  const facets = await vinmonopolet.getFacets();
  const AllStores = facets.find(facet => facet.title == 'stores');
  const store = AllStores.values.find(store => store.name == 'Trondheim, Bankkvartalet');

  let {pagination, products} = await vinmonopolet.getProducts({facet: [store, vinmonopolet.Facet.Category.BEER]})

  while (pagination.hasNext) {
    const response = await pagination.next()
    products = products.concat(response.products)
    pagination = response.pagination
  }

  return products
}

getAllBeers().then(allProducts => {
  console.log(allProducts)
>>>>>>> dca85c94a6d976c03662d7dac772ff6686339eda
})

//====================
// async function getAllCiders() {
//
//   let {pagination, products} = await vinmonopolet.getProducts({facet: [storeFacetValue, vinmonopolet.Facet.Category.BEER]})
//
//   while (pagination.hasNext) {
//     const response = await pagination.next()
//     products = products.concat(response.products)
//     pagination = response.pagination
//   }
//
//   return products
// }
//
// getAllCiders().then(allProducts => {
//   console.log(allProducts)
// })
