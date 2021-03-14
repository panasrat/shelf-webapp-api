const functions = require("firebase-functions");
const admin = require('firebase-admin')

admin.initializeApp()

const express = require('express')
const app = express()

app.get('/items', (req, res) => {
    admin
    .firestore()
    .collection('items')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let items = [];
        data.forEach(doc => {
            items.push({
                itemId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt,
            })
        })
        return res.json(items)
    })
    .catch(err => {
        console.error(err)
    })
})

app.post('/item', (req, res) => {
    const newItem = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }
    admin
    .firestore()
    .collection('items')
    .add(newItem)
    .then(doc => {
        res.json({ message: `documenent ${doc.id} created successfully` })
    }).catch(err => {
        res.status(500).json({ error: 'something went wrong' })
        console.error(err)
    })
})

exports.api = functions.region('asia-southeast2').https.onRequest(app)
