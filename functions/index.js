const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/fbAuth');

const {
  getAllItems,
  postOneItem,
  getItem,
  commentOnItem,
} = require('./handlers/items');
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require('./handlers/users');

// Items Routes
app.get('/items', getAllItems);
app.post('/item', FBAuth, postOneItem);
app.get('/item/:itemId', getItem);

// TODO: delete an item
// TODO: like an item
// TODO: unlike an item

app.post('/item/:itemId/comment', FBAuth, commentOnItem);

// Users Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.region('asia-southeast2').https.onRequest(app);
