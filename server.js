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

//authJWTController. isAuthenticated


//DB = mongod://localhost/webapi2
//#DB = mongodb://node:mlab@me@passworsword.mlab.com:892898/webapi

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //global hack
var jwt = require('jsonwebtoken');
var dotenv = require('dotenv').config(); //Needed for process.env.UNIQUE_KEY
var port = 8080;
var mongoose = require('mongoose');
mongoose.connect(process.env.DB);
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    username: {type: String, required: true, index: { unique: true}}, 
    password: {type: String, required: true, select: false}
});


var movieSchema = new Schema({
    title:{type: String, required: true, unique: true},
    year: {type: Number, min:1600, max:9999}, 
    genre: ['Action','Adventure','Comedy','Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western'],
    
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/post')
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


router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'TODO DONT SAVE LOCALLY Successful created new user.'});
      //res.json({success: true, msg: 'TODO no where to keep new user.'});
    }
});

router.post('/signin', function(req, res) {

        var user = db.findOne(req.body.username);

        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
        }
        else {
            // check if password matches
            if (req.body.password == user.password)  {
                var userToken = { id : user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        };
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
console.log("Server listening on port 8080");