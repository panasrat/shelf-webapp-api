const { db } = require("../util/admin");

exports.getAllItems = (req, res) => {
  db.collection("items")
    .orderBy("createdAt", "desc")
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
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }

  const newItem = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
  };
  db.collection("items")
    .add(newItem)
    .then((doc) => {
      res.json({ message: `documenent ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};
