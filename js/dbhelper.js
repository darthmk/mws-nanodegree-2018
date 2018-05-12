/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; //8887 // Change this to your server port
    //return `http://127.0.0.1:${port}/data/restaurants.json`;
    return `http://localhost:${port}/`;
  }

  static dbPromise() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('restaurants-db', 4, function (upgradeDb) {
      var storeRestaurants = upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });

      var storeReviews = upgradeDb.createObjectStore('reviews', {
        keyPath: 'id'
      });
      storeReviews.createIndex('by-restaurant', 'restaurant_id');
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    fetch(`${DBHelper.DATABASE_URL}restaurants/`).then((response) => {
      return response.json(); 
    }).then((data) => { 
      DBHelper.dbPromise().then((db) => {
        if (!db) return;

        let tx = db.transaction('restaurants', 'readwrite');
        let store = tx.objectStore('restaurants');
        data.forEach(function (data) {
          store.put(data);
        });

        // limit store to 20 items
        store.openCursor(null, "prev").then(function (cursor) {
          return cursor.advance(20);
        }).then(function deleteRest(cursor) {
          if (!cursor) return;
          cursor.delete();
          return cursor.continue().then(deleteRest);
        });
      });
      return console.log(data);
    }).catch((error) => {
      return console.log(`Request failed. Returned status of ${error.status}`);
    });
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews() {
    fetch(`${DBHelper.DATABASE_URL}reviews/`).then((response) => {
      return response.json();
    }).then((data) => {
      DBHelper.dbPromise().then((db) => {
        if (!db) return;

        let tx = db.transaction('reviews', 'readwrite');
        let store = tx.objectStore('reviews');
        data.forEach(function (data) {
          store.put(data);
        });

        // limit store to 20 items
        //store.openCursor(null, "prev").then(function (cursor) {
        //  return cursor.advance(20);
        //}).then(function deleteRest(cursor) {
        //  if (!cursor) return;
        //  cursor.delete();
        //  return cursor.continue().then(deleteRest);
        //});
      });
      return console.log(data);
    }).catch((error) => {
      return console.log(`Request failed. Returned status of ${error.status}`);
    });
  }


  /**
   * 
   * @description Get restaurants from db
   */
  static fetchRestaurantsFromDb(callback) {
    return DBHelper.dbPromise().then(function (db) {
      if (!db) return;

      var store = db.transaction('restaurants')
        .objectStore('restaurants');

      return store.getAll().then(function (restaurants) {
        callback(null, restaurants);
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurantsFromDb((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurantsFromDb((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurantsFromDb((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurantsFromDb((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurantsFromDb((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurantsFromDb((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}_30q_50pc.webp`);
  }

  static toggleFavoriteRestaurant() {
    alert('franco');
  }
}
