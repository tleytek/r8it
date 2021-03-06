const mongoose = require("mongoose");
const moment = require("moment");
const Post = mongoose.model("posts");
const cloudinary = require("cloudinary");
const datauri = require("datauri");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

exports.fetchPosts = async (req, res) => {
  let query = {};

  query.dateCreated = {
    $gte: moment()
      .subtract(1, "years")
      .toISOString()
  };

  const posts = await Post.find();
  posts.sort((a, b) => {
    return b.skill[0] - a.skill[0];
  });
  res.json(posts);
};

exports.fetchPost = async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findById(postId);
  post.image = await getCloudinaryImage(post.cloudinaryRef);
  res.json(post);
};

exports.submitPost = async (req, res) => {
  req.body.userId = req.user._id; // assign user id from session

  const dUri = new datauri();

  const image = dUri.format(
    path.extname(req.file.originalname).toString(),
    req.file.buffer
  );

  const { title, description, challengeId } = req.body;

  cloudinaryRef = await cloudinary.uploader.upload(image.content);

  const post = await new Post({
    title,
    description,
    cloudinaryRef: cloudinaryRef.public_id,
    challengeId,
    userId: req.user._id
  }).save();
  res.json(post);
};
