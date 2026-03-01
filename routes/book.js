const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt');
const Auteur = require('../models/Auteur');
const streamifier = require('streamifier');

// ✅ Multer en mémoire (pas de temp/ local)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ===============================
   AJOUTER POST
=================================*/
router.post('/post/add', upload.single('image'), async (req, res) => {
  try {
    const { title_ar, text_ar, title_en, text_en, title_fr, text_fr } = req.body;

    // Upload vers Cloudinary depuis buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'posts' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const post = await Post.create({
      title_ar,
      text_ar,
      title_en,
      text_en,
      title_fr,
      text_fr,
      image: result.secure_url
    });

    res.json({ success: true, post });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===============================
   GET POSTS
=================================*/
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ===============================
   MODIFIER POST
=================================*/
router.put('/post/:id', upload.single('image'), async (req, res) => {
  try {
    const { title_ar, text_ar, title_en, text_en, title_fr, text_fr } = req.body;

    let updateData = {
      title_ar,
      text_ar,
      title_en,
      text_en,
      title_fr,
      text_fr
    };

    // Si nouvelle image choisie
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'posts' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      updateData.image = result.secure_url;
    }

    await Post.findByIdAndUpdate(req.params.id, updateData);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===============================
   SUPPRIMER POST
=================================*/
router.delete('/post/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===============================
   REGISTER & LOGIN
=================================*/
router.post('/register', async (req, res) => {
  try {
    const existing = await Auteur.findOne();
    if (existing) return res.json({ success: false, message: "Auteur déjà créé" });

    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    await Auteur.create({ username, password: hashed });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const auteur = await Auteur.findOne({ username });
  if (!auteur) return res.json({ success: false });

  const match = await bcrypt.compare(password, auteur.password);
  if (!match) return res.json({ success: false });

  req.session.auteur = true;
  res.json({ success: true });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;