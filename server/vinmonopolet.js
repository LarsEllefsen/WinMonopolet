const vinmonopolet = require('vinmonopolet')


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
})
