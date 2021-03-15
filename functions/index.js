const functions = require("firebase-functions");
const admin = require('firebase-admin')

admin.initializeApp()

const firebaseConfig = {
    apiKey: "AIzaSyBcAoGii-w3SlBBF7LvustJPyc5eNShTLw",
    authDomain: "shelf-webapp-de58d.firebaseapp.com",
    databaseURL: "https://shelf-webapp-de58d-default-rtdb.firebaseio.com",
    projectId: "shelf-webapp-de58d",
    storageBucket: "shelf-webapp-de58d.appspot.com",
    messagingSenderId: "71418690894",
    appId: "1:71418690894:web:bc6d733d35cb783b93321f"
};

const express = require('express')
const app = express()

const firebase = require('firebase');
const { user } = require("firebase-functions/lib/providers/auth");
firebase.initializeApp(firebaseConfig)

const db = admin.firestore()

// Get Items

app.get('/items', (req, res) => {
    db
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

// Post an Item

app.post('/item', (req, res) => {
    const newItem = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }
    db
    .collection('items')
    .add(newItem)
    .then(doc => {
        res.json({ message: `documenent ${doc.id} created successfully` })
    }).catch(err => {
        res.status(500).json({ error: 'something went wrong' })
        console.error(err)
    })
})

// Sign Up

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    let token, userId

    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({ handle: 'this handle is already taken' })
        } else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        userId = data.user.uid
        return data.user.getIdToken()
    })
    .then(idToken => {
        token = idToken
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId: userId
        }
        // return res.status(201).json({ token })
        return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => {
        return res.status(201).json({ token })
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({ email: 'Email is already in use' })
        } else {
            return res.status(500).json({ error: err.code })
        }
    })

})

exports.api = functions.region('asia-southeast2').https.onRequest(app)
