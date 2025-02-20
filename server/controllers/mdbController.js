const User = require('../db.js');

const express = require('express');
const db = require('../db.js');
const mdbController = {
  delete: async (req, res, next) => {
    try {
      let email = req.body.email;
      let place_id = req.body.place_id;

      console.log('email : ' + email + ' place_id : ' + place_id);

      const result = await User.updateOne(
        { email: email },
        { $pull: { savedList: { place_id: place_id } } }
      );

      res.locals.savedList = result;
      //console.log(res.locals.user)
      //console.log(User.find({email: email}, {savedList: 1}))
      return next();
    } catch (err) {
      err = {
        log: 'There was an error in the mdbController.delete middleware' + err,
        status: 500,
        message: { err: 'There was an unknown server error' },
      };
      return next(err);
    }
  },

  //from search screen when user presses save
  saveTo: async (req, res, next) => {
    let e = req.body.email;
    let p = req.body.place_id;
    let n = req.body.name;
    let a = req.body.vicinity;
    let l = req.body.link;
    let w = req.body.website; // get the website from the request
    let t = req.body.tags || []; // get the tags from the request

    // console.log(
    //   'email : ' +
    //     e +
    //     ' place_id : ' +
    //     p +
    //     ' name : ' +
    //     n +
    //     ' vicinity : ' +
    //     a +
    //     ' link : ' +
    //     l
    // );

    try {
      // Check if the restaurant is already saved
      let user = await User.findOne({ email: e });

      // If user does not exist, create a new user
      if (!user) {
        console.log(`No user found with email: ${e}. Creating a new user.`);
        user = new User({
          email: e,
          savedList: [],
          // Add any other default fields as per your User schema
        });
        await user.save();
      }

      // Check if savedList exists and if the restaurant is already saved
      if (
        user.savedList &&
        user.savedList.some((restaurant) => restaurant.place_id === p)
      ) {
        console.log('Restaurant is already saved.');
        res.locals.user = user;
        return next();
      }

      // If not, save the new restaurant
      const place = {
        $push: {
          savedList: { place_id: p, name: n, vicinity: a, link: l, website: w,tags: t },// to include tags and website
        },
      };
      const option = { new: true, upsert: true };

      const result = await User.findOneAndUpdate({ email: e }, place, option);
      // console.log('result', result);
      res.locals.user = result;
      return next();
    } catch (err) {
      err = {
        log: 'There was an error in the mdbController.saveTo middleware ' + err,
        status: 500,
        message: { err: 'There was an unknown server error' },
      };
      return next(err);
    }
  },

  getRows: async (req, res, next) => {
    try {
      let { email } = req.body;
      console.log('in getRows email', email);
      const result = await User.findOne({ email: email }, { savedList: 1 });
      res.locals.savedList = result;
      //console.log(result);
      next();
    } catch (err) {
      err = {
        log: 'There was an error in the mdbController.getRows middleware' + err,
        status: 500,
        message: { err: 'There was an unknown server error' },
      };
      return next(err);
    }
  },

  getSavedRestaurants: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email }, { savedList: 1 });
      // console.log('Fetched saved restaurants:', user.savedList);
      res.locals.savedRestaurants = user.savedList;
      next();
    } catch (err) {
      err = {
        log: 'Error in mdbController.getSavedRestaurants: ' + err,
        status: 500,
        message: { err: 'An error occurred while fetching saved restaurants.' },
      };
      next(err);
    }
  },

  updateComment: async (req, res, next) => {
    const { email, place_id, comment } = req.body;

    try {
      const result = await User.updateOne(
        { email: email, 'savedList.place_id': place_id },
        { $set: { 'savedList.$.comment': comment } }
      );

      res.locals.savedList = result;
      return next();
    } catch (err) {
      err = {
        log:
          'There was an error in the mdbController.updateComment middleware' +
          err,
        status: 500,
        message: { err: 'There was an unknown server error' },
      };
      return next(err);
    }
  },

  updateTags: async (req, res, next) => {
    const { email, place_id, tags } = req.body;
    try {
      const result = await User.findOneAndUpdate(
        { email, 'savedList.place_id': place_id },
        { $set: { 'savedList.$.tags': tags } },
        { new: true }
      );
      res.locals.savedList = result.savedList;
      return next();
    } catch (err) {
      err = {
        log:
          'There was an error in the mdbController.updateTags middleware ' +
          err,
        status: 500,
        message: { err: 'There was an unknown server error' },
      };
      return next(err);
    }
  },
};

module.exports = mdbController;
