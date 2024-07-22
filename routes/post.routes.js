const router = require('express').Router();
const { isLoggedIn } = require('../middleware/route-guard');
const Post = require('../models/Post.model');
const fileUploader = require('../config/cloudinary.config');

// GET route ==> to display the post form
router.get('/posts/new', isLoggedIn, (req, res) => {
    res.render('posts/new-post');
});


// POST route ==> to create a new post
router.post('/posts', isLoggedIn,
    fileUploader.single('postPic'), (req, res, next) => {
        const { content } = req.body;
        const creatorId = req.session.currentUser._id;
        const picPath = req.file ? req.file.path : undefined;
        const picName = req.file ? req.file.originalname : undefined;

        Post.create({ content, creatorId, picPath, picName })
            .then(() => res.redirect('/posts'))
            .catch(err => next(err));
    });

module.exports = router;
