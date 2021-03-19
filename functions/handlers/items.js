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
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
  };
  db.collection('items')
    .add(newItem)
    .then((doc) => {
      res.json({ message: `documenent ${doc.id} created successfully` });
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
    return res.status(400).json({ error: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    itemId: req.params.itemId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };

  db.doc(`/items/${req.params.itemId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Item not found' });
      }
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};
