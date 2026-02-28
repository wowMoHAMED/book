const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title_ar: String,
  text_ar: String,
  title_en: String,
  text_en: String,
  title_fr: String,
  text_fr: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);