// server/routes/apiRouter.ts

const express = require('express');
const restaurantController = require('../controllers/restaurantController.js');
const mdbController = require('../controllers/mdbController.js');
const axios = require('axios'); // ensure axios is imported - very important for the geocode below to work

const apiRouter = express.Router();

apiRouter.post('/saveLoc', mdbController.saveTo, (req, res) => {
  res
    .status(200)
    .json({ message: 'Document created', savedList: res.locals.user });
});
apiRouter.post('/getSaved', mdbController.getRows, (req, res) => {
  res.status(200).json({
    message: 'Rows acquired',
    savedList: res.locals.savedList['savedList'],
  });
});
apiRouter.post('/delLoc', mdbController.delete, (req, res) => {
  res.status(200).json({
    message: 'Rows acquired',
    savedList: res.locals.savedList['savedList'],
  });
});
apiRouter.get(
  '/restaurants',
  restaurantController.fetchRestaurants,
  (req, res) => {
    res.status(200).json(res.locals.restaurants);
  }
);

// new API endpoint to fetch saved restaurants for a user
apiRouter.post(
  '/getSavedRestaurants',
  mdbController.getSavedRestaurants,
  (req, res) => {
    res.status(200).json({
      message: 'Saved restaurants fetched',
      savedRestaurants: res.locals.savedRestaurants,
    });
  }
);

// new route to handle comment updates
apiRouter.post('/updateComment', mdbController.updateComment, (req, res) => {
  res.status(200).json({
    message: 'Comment updated successfully',
    savedList: res.locals.savedList,
  });
});

// new route to handle tag updates
apiRouter.post('/updateTags', mdbController.updateTags, (req, res) => {
  res.status(200).json({
    message: 'Tags updated successfully',
    savedList: res.locals.savedList,
  });
});

// new route to fetch google login api from the backend for safefy reason
apiRouter.get('/fetchGoolgeLoginAPI', (req, res) => {
  res.json({ clientId: process.env.GOOGLELOGINAPI });
});

// new route to convert searched location into geocode
apiRouter.get('/geocode', async (req, res) => {
  try {
    const { location } = req.query;
    console.log('Geocode request location:', location); // log the requested location
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: location,
          key: process.env.GOOGLEAPI,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching geocode data:', error.message);
    if (error.response) {
      // log the detailed error response from the API
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch geocode data' });
  }
});

// new route to fetch current country and city
apiRouter.get('/locationDetails', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: process.env.GOOGLEAPI,
        },
      }
    );
    const results = response.data.results;
    const addressComponents = results[0].address_components;
    let city = '';
    let state = '';
    let country = '';
    let sublocality = '';
    let neighborhood = '';

    addressComponents.forEach((component) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
      if (component.types.includes('sublocality')) {
        sublocality = component.long_name;
      }
      if (component.types.includes('neighborhood')) {
        neighborhood = component.long_name;
      }
    });

    // Fallback if city is still empty
    if (!city && sublocality) {
      city = sublocality;
    }

    // Fallback if neighoborhood is still empty
    if (!neighborhood && sublocality) {
      neighborhood = sublocality;
    }

    res.status(200).json({ city, state, country, sublocality, neighborhood });
  } catch (error) {
    console.error('Error fetching location details:', error);
    res.status(500).json({ error: 'Failed to fetch location details' });
  }
});

// new route to autocomplete location search
// new route to handle autocomplete suggestions
apiRouter.get('/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input,
          key: process.env.GOOGLEAPI,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching autocomplete data:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch autocomplete data' });
  }
});

module.exports = apiRouter;
