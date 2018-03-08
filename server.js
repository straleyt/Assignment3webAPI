// singup POST
// singin POST
//get all GET
// save new POST
//get specific GET
//save exisiting PUT
//delete specific DELETE
//in class

//sin up, signing, posts, all errors messages

//but with movies! singup signin users
//then movies update, etc. 


//~~~~~~requires~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var dotenv = require('dotenv').config(); //Needed for process.env.UNIQUE_KEY
var port = 8082;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB , (err, database) => {
    if (err) throw err;
    console.log("Connected to the database.");
    db = database;
    console.log("Database connected on " + process.env.DB);
});


//~~~~~~USER schema~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var userSchema = new Schema({
    name: String,
    username: {type: String, required: true, index: { unique: true}}, 
    password: {type: String, required: true, select: false}
});
var User = mongoose.model("User", userSchema);

// hash the password before the user is saved
userSchema.pre('save', function(next) {
    var user = this;

    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    // generate the hash
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);

        // change the password to the hashed version
        user.password = hash;
        next();
    });
});


// userSchema.methods.comparePassword = function(password, callback) {
//     var user = this;

//     bcrypt.compare(password, user.password, function(err, isMatch) {
//        callback(isMatch) ;
//     });
// };


//~~~~~~ACTOR schema~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var actorSchema = new Schema({
    name:{type: String, required: true},
    characterName: {type: String, required: true}
});
var Actor = mongoose.model("Actor", actorSchema);

//~~~~~~MOVIE schema~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var movieSchema = new Schema({
    title:{type: String, required: true, unique: true},
    year: {type: Number, min:1600, max:9999}, 
    genre: ['Action','Adventure','Comedy','Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western'],
    actors: {type: actorSchema, min:3}
});



//~~~~~~set up server~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
var router = express.Router();

//~~~~~~signup and signin~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.name) {
        res.json({success: false, msg: 'Please pass username, name, and password.'});
    } else {
        var newUser = new User(req.body);
        
        // save the user
        newUser.save()
            .then(item => {
                res.json({success: true, msg: 'Successful created new user.'});
            })
            .catch(err => {
                res.status(422).send("Unable to save to database");
            });
    }
});


router.post('/signin', (req, res) => {
    var userNew = new User(req.body);

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        console.log("userNew pass : "+ userNew.password);
        console.log("user pass : "+ user.password);


        // generate the hash
        bcrypt.hash(userNew.password, null, null, function(err, hash) {
            if (err) return next(err);

             // change the password to the hashed version
            userNew.password = hash;
           
            console.log("AFTERuserNew pass : "+ userNew.password);
            console.log("AFTERuser pass : "+ user.password);
    
            //or do comparePassword thru user, however js is asynchronous so doesn't get back in time?
            bcrypt.compare(userNew.password, user.password, (err, isMatch) => {
                if (isMatch) {
                    var userToken = {id: user._id, username: user.username};
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
             });
        });
    });
});

//~~~~~~/movies routes~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
router.route('/movies')
    .post(authJwtController.isAuthenticated, (req, res) => {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
    });





//~~~~~~everything else~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// router.route('*', function(req, res, next) {
//     res.status(405).send({message:"Unsupported method or invalid path."});
//   });
  

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );



app.use('/', router);
app.listen(process.env.PORT || port);
console.log("Server listening on port " + port);