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
var port = 8080;
var mongoose = require('mongoose');
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

//~~~~~~MOVIE schema~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var movieSchema = new Schema({
    title:{type: String, required: true, unique: true},
    year: {type: Number, min:1600, max:9999}, 
    genre: ['Action','Adventure','Comedy','Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western'] //,
    //actors:
});
//~~~~~~set up server~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

//~~~~~~signup and signin~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password || !req.body.name) {
        res.json({success: false, msg: 'Please pass username, name, and password.'});
    } else {
        var newUser = new User();
        newUser.username = req.body.username;
        newUser.password = req.body.password;
        newUser.name = req.body.name;
        
        // save the user
        newUser.save()
            .then(item => {
                res.json({success: true, msg: 'Successful created new user.'});
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });

    }
});


router.post('/signin', function(req, res) {

    var userSignin = new User();
    userSignin.username = req.body.username;
    userSignin.password = req.body.password;
    userSignin.name = req.body.name;

    User.findOne({ username: userSignin.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userSignin.password, function(isMatch){
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

//~~~~~~/movies routes~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
    });





//~~~~~~everything else~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// app.use('*', function(req, res, next) {
//     res.status(405).send({message:"Unsupported method or invalid path."});
//   });
  

app.use('/', router);
app.listen(process.env.PORT || 8080);
console.log("Server listening on port 8080");