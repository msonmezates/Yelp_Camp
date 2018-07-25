const express = require('express');
const router = express.Router();
const TravelClub = require('../models/travelclub');

// Create middleware to handle unathorized access
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) return next(); // if authorized, move to next step
  res.redirect('/login'); // if not authorized, redirect to login
}

// INDEX route - show all travel places
router.get('/', (req,res) => {
  // get all travelplaces from db
  TravelClub.find({}, (err, travelplaces) => {
    if(err) console.log(err);
    else {
      res.render('travelPlaces/index', { travelplaces });
    }
  });
});

// CREATE route - add new places to DB
router.post('/', isLoggedIn, (req,res) => {
  // get the data from form and add it into travelPlaces
  const { name, image, description } = req.body;
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  const newTravelPlace = { name, image, description, author }; //add this object into travelplaces array
  // create a new place and save to DB
  TravelClub.create(newTravelPlace, (err, newPlace) => {
    if(err) console.log(err);
    else {
      // redirect back to travel places page
      console.log(newPlace)
      res.redirect('/travelplaces');
    }
  });
});

// NEW route - show form to create new travel places
router.get('/new', isLoggedIn, (req,res) => {
  // find the place with provided id
  // render the template with that travel place
  res.render('travelPlaces/new'); //new.ejs is the form file
});

// SHOW route - shows more info about particular travel place
router.get('/:id', (req,res) => {
  const { id } = req.params;
  TravelClub.findById(id).populate('comments').exec((err, foundTravelPlace) => {  // populate('comments').exec(function(){}) enables us to show 
    if(err) console.log(err);                                                     // the data based on id
    else {
      console.log(foundTravelPlace);
      res.render('travelPlaces/show', { travelPlace: foundTravelPlace });
    }
  });
});

// EDIT route - enables user to edit the travel place
router.get('/:id/edit', (req,res) => {
  const { id } = req.params;
  TravelClub.findById(id, (err, foundTravelPlace) => {
    if(err) {
      res.redirect('/travelplaces');
      console.log(err);
    } else {
      res.render('travelPlaces/edit', { travelPlace: foundTravelPlace });
    }
  });
});
// UPDATE route - updates the form after editing a particular travel place
router.put('/:id', (req, res) => {
  const { id } = req.params; // data comes from url
  const { travelPlace } = req.body; // data comes from form which is an object
  TravelClub.findByIdAndUpdate(id, travelPlace, (err, updatedTravelPlace) => {
    if(err) {
      res.redirect('/travelplaces');
      console.log(err);
    } else {
      res.redirect(`/travelplaces/${id}`); // redirect to the same travel place page
    }
  });
});
// DESTROY route - deletes one travel place
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  TravelClub.findByIdAndRemove(id, (err) => {
    if(err) {
      res.redirect('/travelplaces');
      console.log(err);
    } else {
      res.redirect('/travelplaces');
    }
  });
});

module.exports = router;