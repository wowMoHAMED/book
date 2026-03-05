require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const Auteur = require('./models/Auteur'); // corrige le chemin selon ton projet

const app = express();
app.use(express.static(path.join(__dirname, "public"))); 
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: false
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));

// Routes API
const apRoutes = require('./routes/book');
app.use('/book', apRoutes);

// Pages front
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

   

function isAuth(req, res, next) {
  if(req.session && req.session.userId){
    next(); // connecté → continue
  } else {
    res.redirect('/login'); // pas connecté → vers login
  }
}
//route login et loginfisrt

/* =============================
   LOGINFIRST (premier compte)
============================= */
app.get('/loginfirst', async (req, res) => {
  const count = await Auteur.countDocuments();
  if(count > 0){
    // si déjà un auteur → rediriger vers login
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'views', 'loginfirst.html'));
});

app.post('/loginfirst', async (req, res) => {
  const count = await Auteur.countDocuments();
  if(count > 0) return res.send('Un compte existe déjà !');

  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  await Auteur.create({ username, password: hash });
  res.redirect('/login.html');
});

/* =============================
   LOGIN
============================= */
app.get('/login', async (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const auteur = await Auteur.findOne({ username });
  if(!auteur) return res.send('Utilisateur non trouvé');
 
  const match = await bcrypt.compare(password, auteur.password);
  if(!match) return res.send('Mot de passe incorrect');

  req.session.auteurId = auteur._id;
  res.redirect('/auteur.html');
});

/* =============================
   PAGE AUTEUR
============================= */
app.get('/auteur', isAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auteur.html'));
});

/* =============================
   LOGOUT
============================= */
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Route API



module.exports = app; 