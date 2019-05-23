function distance(store, user){
  var unit = "K"
  var radlat1 = Math.PI * store.lat/180
  var radlat2 = Math.PI * user.lat/180
  var radlon1 = Math.PI * store.lon/180
  var radlon2 = Math.PI * user.lon/180
  var theta = store.lon-user.lon
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist

}

export function sortByDistance(stores, user_loc){
  // console.log(user_loc)
  var closest=stores[0];
  var closest_distance=distance(closest,user_loc);
  for(var i=1;i<stores.length;i++){
    if(distance({lat: stores[i].lat, lon: stores[i].lon},user_loc)<closest_distance){
         closest_distance=distance({lat: stores[i].lat, lon: stores[i].lon},user_loc);
         closest=stores[i];
    }
  }

  return closest;
}

export function sortWithFilters(beer_array, filters){
    return new Promise((resolve, reject ) => {
      if(filters.price != null){
        beer_array = beer_array.filter(object => object.price >= filters.price[0] && object.price <= filters.price[1])
      }

      if(filters.styles.includes("Gluten-Free")){
        beer_array = beer_array.filter(object => object.data.includes('Gluten-Free'))
      }

      var style_array = []
      for (var i = 0; i < filters.styles.length; i++) {
        if(filters.styles[i] !== 'Gluten-Free'){
          style_array.push(filters.styles[i])
        }
      }

      if(style_array.length && style_array != null){
        beer_array = beer_array.filter(object => style_array.includes(object.type))
      }

      if(filters.abv != null){
        beer_array = beer_array.filter(object => object.abv >= filters.abv[0] && object.abv <= filters.abv[1])
      }

      if(filters.news){
        beer_array = beer_array.filter(object => object.new == 1)
      }

      resolve(beer_array);
  });
}

export var geo_options = {
  enableHighAccuracy: false,
  maximumAge        : 30000,
  timeout           : 27000
};

/**
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
export function levenshteinDistance(a, b) {
  // Create empty edit distance matrix for all possible modifications of
  // substrings of a to substrings of b.
  const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  // Fill the first row of the matrix.
  // If this is first row then we're transforming empty string to a.
  // In this case the number of transformations equals to size of a substring.
  for (let i = 0; i <= a.length; i += 1) {
    distanceMatrix[0][i] = i;
  }

  // Fill the first column of the matrix.
  // If this is first column then we're transforming empty string to b.
  // In this case the number of transformations equals to size of b substring.
  for (let j = 0; j <= b.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, // deletion
        distanceMatrix[j - 1][i] + 1, // insertion
        distanceMatrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return distanceMatrix[b.length][a.length];
}
