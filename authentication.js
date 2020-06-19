const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const authRouter = express.Router();

authRouter.get('/failed', (req, res) => {
  res.send('You failed to authenticate');
});

authRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    //Somente retornaremos o jwt para o front, o front deverá armazenar isso e enviar nas próximas requisições
    res.redirect('/auth/generatejwt');
  }
);

authRouter.get('/generatejwt', (req, res, next) => {
  const token = jwt.sign({ id: req.user.id }, process.env.SECRET, {
    expiresIn: 60*5 // expires in 5min
  });
  //console.log(`Welcome, Mr ${req.user.displayName} of email: ${req.user._json.email} of domain ${req.user._json.hd} and id:${req.user.id}. Your token is: ${token}`);
  res.status(200).json({auth: true, jwt: token, message: 'Use this token on next requests to identify which user is requesting'});
});

authRouter.get('/logout', (req, res) => {
  req.session = null; //Destroy the session
  req.logout();
  res.json({ auth: false, token: null });
});

module.exports = authRouter;