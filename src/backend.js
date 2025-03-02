const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const { mongoose, Schema }= require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/3100A5');

/* Data Schemas and Models */
const UserSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    isAdmin: { type: Boolean, required: true, },
});
const User = mongoose.model("User", UserSchema);

/* Connect to Database */
const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon successful connection
db.once('open', async function () {
    console.log("Connection is open...");
    
    // Testing: Create a user 
    const name = "abc";
    const password = "123";
    const isAdmin = true;
    await new User({ name, password, isAdmin }).save();

    // Uncomment to delete all documents in database
    // await db.collection('users').deleteMany({});

    // Print all users
    User.find({})
    .then((data) => { console.log(data); })
    .catch((err) => { console.log("Failed to read users"); }); 
})

/* Paths */
app.all('/*', (req, res) => {
    res.send('Hello World!');
});

const server = app.listen(8080);