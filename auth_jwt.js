// Load required packages
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var dotenv = require('dotenv').config(); //Needed for process.env.UNIQUE_KEY

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.SECRET_KEY;
db = process.env.DB;//Links to either our mongo or mlab db

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    //User.findById(jwt_payload) 
    var user = db.find(jwt_payload.id);

        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
}));

exports.isAuthenticated = passport.authenticate('jwt', { session : false });
exports.secret = opts.secretOrKey ;