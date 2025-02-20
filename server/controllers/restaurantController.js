const axios = require('axios');
const express = require('express');
require('dotenv').config();

const restaurantController = {
  fetchRestaurants: async (req, res, next) => {
    // console.log('hitting restaurantController');
    try {
      const { latitude, longitude, radius } = req.query;
      // default keyword to restaurant
      const keyword = req.query.keyword || 'restaurant';
      console.log(
        `Latitude: ${latitude}, Longitude: ${longitude}, Radius: ${radius}, Keyword: ${keyword}`
      );
      console.log('process.env.GOOGLEAPI :');
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius: radius || 400, // Default to 400 meters if no radius is provided
            // remove search type but using only keyword as the restrictions to only one type for the old google nearby search api
            // type: 'restaurant' || 'bakery' || 'cafe' || 'coffee_shop',
            keyword,
            // rankby: 'distance',
            // opennow: true,
            key: process.env.GOOGLEAPI,
          },
        }
      );
      const restaurants = response.data.results;

      // Fetch additional details for each restaurant
      const restaurantDetailsPromises = restaurants.map(async (restaurant) => {
        if (restaurant.photos && restaurant.photos[0]) {
          restaurant.photo_url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=${process.env.GOOGLEAPI}`;
        }

        // Fetch Place Details for website
        const detailsResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/place/details/json',
          {
            params: {
              place_id: restaurant.place_id,
              fields: 'website',
              key: process.env.GOOGLEAPI,
            },
          }
        );
        const details = detailsResponse.data.result;
        restaurant.website = details.website || null;
        return restaurant;
      });

      const detailedRestaurants = await Promise.all(restaurantDetailsPromises);

      // Shuffle and get up to 30 random restaurants
      const shuffledRestaurants = detailedRestaurants
        .sort(() => 0.5 - Math.random())
        .slice(0, 30);
      // console.log('detailedRestaurants :>> ', detailedRestaurants);
      res.locals.restaurants = detailedRestaurants;
      return next();
    } catch (error) {
      return next({
        log: 'Error in fetchRestaurants middleware',
        status: 500,
        message: { err: error.message },
      });
    }
  },
};

module.exports = restaurantController;
