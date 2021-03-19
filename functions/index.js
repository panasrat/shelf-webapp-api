const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/fbAuth');

const {
  getAllItems,
  postOneItem,
  getItem,
  commentOnItem,
  likeItem,
  unlikeItem,
  deleteItem,
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
app.delete('/item/:itemId', FBAuth, deleteItem);
app.get('/item/:itemId/like', FBAuth, likeItem);
app.get('/item/:itemId/unlike', FBAuth, unlikeItem);
app.post('/item/:itemId/comment', FBAuth, commentOnItem);

// Users Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.region('asia-southeast2').https.onRequest(app);
