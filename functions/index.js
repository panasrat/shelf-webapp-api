const functions = require('firebase-functions');
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

const FBAuth = (req, res, next) => {
    let idToken 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.error('No token found')
        return res.status(403).json({ error: 'Unauthorized' })
    }
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
        req.user = decodedToken
        console.log(decodedToken)
        return db.collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get()
    })
    .then(data => {
        req.user.handle = data.docs[0].data().handle
        return next()

    })
    .catch(err => {
        console.error('Error while verfying token', err)
        return res.status(403).json(err)
    })
}

// Post an Item

app.post('/item', FBAuth, (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Body must not be empty' })
    }

    const newItem = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    }
    db
    .collection('items')
    .add(newItem)
    .then(doc => {
        res.json({ message: `documenent ${doc.id} created successfully` })
    })
    .catch(err => {
        res.status(500).json({ error: 'something went wrong' })
        console.error(err)
    })
})

// Sign Up Help

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if(email.match(emailRegEx)) return true
    else return false
}

const isEmpty = (string) => {
    if(string.trim() === '') return true
    else return false
}

// Sign Up Route

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    let errors = {}

    if(isEmpty(newUser.email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match'
    if(isEmpty(newUser.handle)) errors.handle  = 'Must not be empty'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

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

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    }

    let errors = {}

    if(isEmpty(user.email)) errors.email = 'Must not be empty'
    if(isEmpty(user.password)) errors.password = 'Must not be empty'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
        return data.user.getIdToken();
    })
    .then(token => {
        return res.json({ token })
    })
    .catch(err => {
        console.error(err)
        if(err.code === 'auth/wrong-password'){
            return res.status(403).json({ general: 'Wrong credentials, please try again' })
        } else {
            return res.status(500).json({ error: err.code })
        }
    })
})
    
  

exports.api = functions.region('asia-southeast2').https.onRequest(app)
