const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: process.env.callbackURL
    // callbackURL: "http://localhost:8080/auth/google/callback" //For tests
  },
  function(acessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
