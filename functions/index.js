const functions = require("firebase-functions");
const admin = require('firebase-admin')

admin.initializeApp()

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.getItems = functions.https.onRequest((req, res) => {
    admin.firestore().collection('items').get().then(data => {
        let items = [];
        data.forEach(doc => {
            items.push(doc.data())
        })
        return res.json(items)
    })
    .catch(err => {
        console.error(err)
    })
})

exports.createItem = functions.https.onRequest((req, res) => {
    const newItem = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    }
    admin.firestore().collection('items').add(newItem).then(doc => {
        res.json({ message: `documenent ${doc.id} created successfully` })
    }).catch(err => {
        res.status(500).json({ error: 'something went wrong' })
        console.error(err)
    })
})
