const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams enables us to use req.params 
const TravelClub = require('../models/travelclub');
const Comment = require('../models/comment');

// Create a middleware to handle unathorized access
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) return next(); // if authorized, move to next step
  res.redirect('/login'); // if not authorized, redirect to login
}

// middleware to check authorization
const checkCommentOwnership = (req, res, next) => {
  const { comment_id } = req.params;
  // if user is logged in
  if (req.isAuthenticated()) {
    Comment.findById(comment_id, (err, foundComment) => {
      if(err) {
        res.redirect('back');  // using back takes user back to the original page
        console.log(err);
      } else {
        // does user own the travel place?
        if (foundComment.author.id.equals(req.user._id)) {  // we need to use mongoose' equals method bc author.id is an object
          next();                                           // and req.user._id is a string even though they look identical
        } else { // otherwise redirect
          res.redirect('back');
        }
      }
    });
  } else { // user is not logged in so redirect back
    res.redirect('back'); 
  }
}

// New Comments
router.get('/new', isLoggedIn, (req, res) => { //isLogged middleware enables/disables access to create a comment
  // find the travel place by id
  const {id } = req.params;
  TravelClub.findById(id, (err, travelPlace) => {
    if(err) console.log(err);
    else {
      res.render('comments/new', { travelPlace });
    }
  });
});

// Create Comments
router.post('/', isLoggedIn, (req, res) => {
  const { id } = req.params; //get the id from url
  TravelClub.findById(id, (err, travelPlace) => {
    if(err) console.log(err);
    else {
      Comment.create(req.body.comment, (err, comment) => {
        if(err) console.log(err);
        else {
          // add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save comment
          comment.save();

          travelPlace.comments.push(comment);
          travelPlace.save();
          console.log(comment)
          res.redirect(`/travelplaces/${travelPlace._id}`);
        }
      });
    }
  });
});

// Edit Comments
router.get('/:comment_id/edit', checkCommentOwnership, (req, res) => {
  const { id, comment_id } = req.params;
  Comment.findById(comment_id, (err, foundComment) => {
    if(err) {
      res.redirect('back');
      console.log(err);
    } else {
      res.render('comments/edit', { travelPlace_id: id, comment: foundComment });
    }
  });
});

// Update Comments
router.put('/:comment_id', checkCommentOwnership, (req, res) => {
  const { id, comment_id } = req.params;
  const { comment } = req.body;
  Comment.findByIdAndUpdate(comment_id, comment, (err, updatedComment) => {
    if(err) {
      res.redirect('back');
      console.log(err);
    } else {
      res.redirect(`/travelplaces/${id}`);
    }
  });
});

// Destroy Route - Delete Comments
router.delete('/:comment_id', checkCommentOwnership, (req, res) => {
  const { id, comment_id } = req.params;
  Comment.findByIdAndRemove(comment_id, (err) => {
    if(err) {
      res.redirect('back');
      console.log(err);
    } else {
      res.redirect(`/travelplaces/${id}`);
    }
  });
});

module.exports = router;