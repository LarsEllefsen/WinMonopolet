const vinmonopolet = require('vinmonopolet')

vinmonopolet.getFacets().then(facets => {
  const storeFacet = facets.find(facet => facet.name === 'Butikker')
  const storeFacetValue = storeFacet.values.find(val => val.name === 'Trondheim, Bankkvartalet')

  return vinmonopolet.getProducts({limit: 3, facet: storeFacetValue})
}).then(response => {
  console.log(response.products) // 3 products from Norway
})
