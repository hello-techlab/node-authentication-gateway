const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
  console.log('serialize');
  //Use just the id to make the cookie small
  //I think this is to save the user/user.id on request object
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
    clientID: "569849373373-vmjrnck0dthp5k61de2gkhtkjmp1v74t.apps.googleusercontent.com",
    clientSecret: "z-TYTbiDTFgx5t2p9WnILT2J",
    callbackURL: `http://localhost:49163/auth/google/callback`
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