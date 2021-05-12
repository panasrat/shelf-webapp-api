const { db } = require('../util/admin');

exports.getAllItems = (req, res) => {
  db.collection('items')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let items = [];
      data.forEach((doc) => {
        items.push({
          itemId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
      });
      return res.json(items);
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.postOneItem = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }

  const newItem = {
    body: req.body.body,
    shelfId: req.body.shelfId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };
  db.collection('items')
    .add(newItem)
    .then((doc) => {
      const resItem = newItem;
      resItem.itemId = doc.id;
      res.json(resItem);
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
};

exports.createOneShelf = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }

  const newShelf = {
    shelfName: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
  };
  db.collection('shelves')
    .add(newShelf)
    .then((doc) => {
      const resShelf = newShelf;
      resShelf.shlefId = doc.id;
      res.json(resShelf);
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
};

exports.getItem = (req, res) => {
  let itemData = {};
  db.doc(`/items/${req.params.itemId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Item not found' });
      }
      itemData = doc.data();
      itemData.itemId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('itemId', '==', req.params.itemId)
        .get();
    })
    .then((data) => {
      itemData.comments = [];
      data.forEach((doc) => {
        itemData.comments.push(doc.data());
      });
      return res.json(itemData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.commentOnItem = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    itemId: req.params.itemId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };

  let commentCount = {};
  let likeCount = {};

  const itemDocument = db.doc(`/items/${req.params.itemId}`);

  itemDocument
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Item not found' });
      }
      commentCount = doc.data().commentCount + 1;
      likeCount = doc.data().likeCount;
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json({
        ...newComment,
        commentCount,
        likeCount,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};

exports.likeItem = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('itemId', '==', req.params.itemId)
    .limit(1);

  const itemDocument = db.doc(`/items/${req.params.itemId}`);

  let itemData;

  itemDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        itemData = doc.data();
        itemData.itemId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Item not found' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection('likes')
          .add({
            itemId: req.params.itemId,
            userHandle: req.user.handle,
          })
          .then(() => {
            itemData.likeCount++;
            return itemDocument.update({ likeCount: itemData.likeCount });
          })
          .then(() => {
            return res.json(itemData);
          });
      } else {
        return res.status(400).json({ error: 'Item already liked' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeItem = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('itemId', '==', req.params.itemId)
    .limit(1);

  const itemDocument = db.doc(`/items/${req.params.itemId}`);

  let itemData;

  itemDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        itemData = doc.data();
        itemData.itemId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Item not found ' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: 'Item not liked' });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            itemData.likeCount--;
            return itemDocument.update({ likeCount: itemData.likeCount });
          })
          .then(() => {
            res.json(itemData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.deleteItem = (req, res) => {
  const document = db.doc(`/items/${req.params.itemId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Item deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
