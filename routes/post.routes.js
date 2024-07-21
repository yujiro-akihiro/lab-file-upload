const router = require('express').Router();
const { isLoggedIn } = require('../middleware/route-guard');
const Post = require('../models/Post.model');
const fileUploader = require('../config/cloudinary.config');

// GET route ==> to display the post form
