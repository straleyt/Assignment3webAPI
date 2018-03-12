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
