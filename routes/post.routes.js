const router = require('express').Router();
const { isLoggedIn } = require('../middleware/route-guard');
const Post = require('../models/Post.model');
const fileUploader = require('../config/cloudinary.config');

// GET route ==> to display the post form
router.get('/posts/new',isLoggedIn,(req,res) => {
    res.render('posts/new-post');
});

module.exports = router;
