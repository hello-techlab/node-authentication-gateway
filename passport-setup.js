const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
  console.log('serialize');
  //I think this is to save the user/user.id on request object
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log('deserialize');
  //Here the DB function to find the user
  // User.findById(id, function(err, user) {
    done(null, user);
  // });
});

passport.use(new GoogleStrategy({
    clientID: "1059970612750-69c6kp70e9drthvvtd0r94od8ghphr1o.apps.googleusercontent.com",
    clientSecret: "cr1CMX3wSk6n5aduExkc1j6u",
    callbackURL: `http://techlab-oauth.mooo.com/auth/google/callback`
    // callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(acessToken, refreshToken, profile, done) {
    console.log('passport use');
    //Usar o BD para achar ou criar um user
    // profile.findOrCreate({ googleId: profile.id, }), function(err, profile) {
      //Use the profile info to check if this user is regitered in my db. You can use the id
      return done(null, profile);
      // return done(null, profile);
    // }
  }
));