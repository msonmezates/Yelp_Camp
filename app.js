const express      = require('express'),
      app          = express(),
      bodyParser   = require('body-parser'),
      mongoose     = require('mongoose'),
      TravelClub   = require('./models/travelclub'),
      seedDataBase = require('./seedDatabase');


seedDataBase(); // Always seed database before running the code
mongoose.connect('mongodb://localhost/travel_club');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res) => {
  res.render('landing');
});

// INDEX route - show all travel places
app.get('/travelplaces', (req,res) => {
  // get all travelplaces from db
  TravelClub.find({}, (err, travelplaces) => {
    if(err) console.log(err);
    else {
      res.render('travelPlaces/index', { travelplaces });
    }
  });
});

// CREATE route = add new places to DB
app.post('/travelplaces', (req,res) => {
  // get the data from form and add it into travelPlaces
  const { name } = req.body;
  const { image } = req.body;
  const { description } = req.body;
  const newTravelPlace = { name, image, description }; //add this object into travelplaces array
  // create a new place and save to DB
  TravelClub.create(newTravelPlace, (err, newPlace) => {
    if(err) console.log(err);
    else {
      // redirect back to travel places page
      res.redirect('/travelplaces');
    }
  });
});

// NEW route - show form to create new travel place
app.get('/travelplaces/new', (req,res) => {
  // find the place with provided id
  // render the template with that travel place
  res.render('travelPlaces/new'); //new.ejs is the form file
});

// SHOW route - shows more info about one travel place
app.get('/travelplaces/:id', (req,res) => {
  const { id } = req.params;
  TravelClub.findById(id).populate('comments').exec((err, foundTravelPlace) => {  // populate('comments').exec(function(){}) enables to show the
    if(err) console.log(err);                                                     // data based on id
    else {
      console.log(foundTravelPlace);
      res.render('travelPlaces/show', { travelPlace: foundTravelPlace });
    }
  });
});

// ===============================
// COMMENTS ROUTES
// ===============================

app.get('/travelplaces/:id/comments/new', (req, res) => {
  // find the travel place by id
  const {id } = req.params;
  TravelClub.findById(id, (err, travelPlace) => {
    if(err) console.log(err);
    else {
      res.render('comments/new', { travelPlace });
    }
  });
});

app.listen(process.env.PORT || 3000, () => console.log('Travel Club server has started...'));