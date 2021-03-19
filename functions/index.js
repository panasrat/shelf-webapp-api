const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');

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
  getUserDetails,
  markNotificationsRead,
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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.region('asia-southeast2').https.onRequest(app);

exports.createNotificationOnLike = functions
  .region('asia-southeast2')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/items/${snapshot.data().itemId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            itemId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.deleteNotificationOnUnlike = functions
  .region('asia-southeast2')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region('asia-southeast2')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/items/${snapshot.data().itemId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            itemId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
