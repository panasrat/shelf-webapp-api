const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/fbAuth');

const { getAllItems, postOneItem } = require('./handlers/items');
const { signup, login } = require('./handlers/users');

// Items Routes
app.get('/items', getAllItems);
app.post('/item', FBAuth, postOneItem);

// Users Routes
app.post('/signup', signup);
app.post('/login', login);

// Sign Up Help

exports.api = functions.region('asia-southeast2').https.onRequest(app);
