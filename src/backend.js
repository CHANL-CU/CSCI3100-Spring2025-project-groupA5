const express = require('express');
const app = express();

const session = require('express-session');
const MongoStore = require('connect-mongo');
const store = MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/3100A5' });

const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 256 });
key.generateKeyPair();
privateKeyPem = key.exportKey('private')

app.use(session({
  secret: 'csci3100',
  store: store,
  cookie: {
    maxAge: 3600000 // in ms, 3600000 = 1 hour
  },
  resave: false,
  saveUninitialized: false
}));

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/3100A5');

// const convert = require('xml-js'); // xml-js Library - convert XML to JSON

const { LOGIN_OK, LOGIN_NOUSER, LOGIN_WRONGPW, LOGIN_ERR, LOGIN_NOADMIN } = require('./constants.js');

/* --------------- Data Schemas and Models --------------- */
const UserSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    isAdmin: { type: Boolean, required: true, },
});
const User = mongoose.model("User", UserSchema);

/* --------------- Connect to Database --------------- */
const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon successful connection
db.once('open', async function () {
    console.log("Connection is open...");
    
    // Testing: Create a user 
    // const name = "abc";
    // const password = "123";
    // const isAdmin = true;
    // await new User({ name, password, isAdmin }).save();

    // Uncomment to delete all documents in database
    // await db.collection('users').deleteMany({});

    // Print all users
    User.find({})
    .then((data) => { console.log(data); })
    .catch((err) => { console.log("Failed to read users"); }); 
})


/* --------------- Paths --------------- */
// Encrypt message
app.post('/encrypt', async (req, res) => {
    e = { en: key.exportKey('public') }
    res.status(400).send(e);
});

// Get current user's admin status
app.post('/auth', async (req, res) => {
    if (req.session.user) {
        const user = await User.findOne({ _id: req.session.user._id });
        res.send({ isAdmin: user.isAdmin });
    } else {
        res.status(401).json(null); // No session found
    }
});

// Check for session
app.post('/session', (req, res) => {
    if (req.session.user) {
        res.send({ asAdmin: req.session.asAdmin, name: req.session.user.name, darkMode: req.session.darkMode }); // Send back asAdmin if session exists
    } else {
        res.status(401).json(null); // No session found
    }
});

// Regenerate session
app.post('/session-regen', async (req, res) => {
    if (req.session.user) {
        const user = await User.findOne({ _id: req.session.user._id });
        const asAdmin = req.body.asAdmin;
        const darkMode = req.body.darkMode;
        req.session.regenerate(async function (err) {
        if (err) next(err)

        req.session.user = user;
        req.session.asAdmin = asAdmin;
        req.session.darkMode = darkMode;
        res.send({ asAdmin: req.session.asAdmin }); // Send back asAdmin if ok
        })
    } else {
        res.status(401).json(null); // No session found
    }
});

// Service login attempts from ./comp/Login.js
app.post('/login', async (req, res) => {
    try {
        res.set('Content-Type', 'text/plain');
        let pw = Buffer.from(Object.values(req.body.password))
        pw = key.decrypt(pw)
        pw = pw.toString()

        const user = await User.findOne({ name: { $eq: req.body.name } });
        if (!user) {
        return res.status(400).send(LOGIN_NOUSER);
        }
        if (req.body.asAdmin && !user.isAdmin) {
        return res.status(401).send(LOGIN_NOADMIN);
        }
        if (!(pw == user.password)) {
        return res.status(401).send(LOGIN_WRONGPW);
        }

        req.session.regenerate(function (err) {
        if (err) next(err)

        // store user information in session
        req.session.user = user
        req.session.asAdmin = req.body.asAdmin;
        req.session.darkMode = false; // default upon login
        return res.send(LOGIN_OK);
        })
    } catch (err) {
        console.log(err);
        res.status(404).send(LOGIN_ERR);
    }
});

app.post('/logout', function (req, res, next) {
    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.user = null;
    req.session.save(function (err) {
        if (err) next(err);

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate(function (err) {
        if (err) next(err);
        res.redirect('/');
        })
    })
});

// Service register attempts from ./comp/Login.js
app.post('/register', async (req, res) => {
    try {
        res.set('Content-Type', 'text/plain');

        const input = req.body; // name, password
        const user = await User.findOne({ name: input.name });
        if (user) {
            return res.status(406).send(`User already exists.`);
        }
        new User({ name: input.name, password: input.password, isAdmin: input.isAdmin }).save()
        .then((user) => {
            return res.status(201).send(`${user}`);
        });
    } catch (err) {
        res.status(406).send(`Failed to create user.`);
    }
});

app.all('/*', (req, res) => {
    res.send('Hello World!');
});

const server = app.listen(8080);