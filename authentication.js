const express = require('express');
const url = require('url');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const authRouter = express.Router();

authRouter.get('/failed', (req, res) => {
  res.send('You failed to authenticate. You do not have an USP email :(');
});

authRouter.get('/login',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/signup', (req, res, next) => {
  res.send('Aqui teremos a página de cadastro dos dados, perguntaremos o instituto e o número usp da pessoa. Essa página só aparecerá no primeiro login');
});

authRouter.post('/signup', (req, res, next) => {
  
  //Dados criados pelo usuário no cadastro
  let nusp = req.body.nusp;
  let instituto = req.body.instituto;

  //Dados retornados pelo oAuth
  let userId = req.userId; 
  let userName = req.userName;
  let userEmail = req.userEmail;

  //Aqui chamaremos a função para criar o usuário no BD com as informações que conseguimos acima
});

authRouter.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    
    //Se o domínio não for USP, rejeitaremos a requisição de login
    if (req.user._json.hd !== 'usp.br') res.redirect('/auth/failed');

    // ======== AQUI VERIFICAREMOS SE O USUÁRIO JÁ EXISTE NO BD, se existir o mandaremos para '/auth/generatejwt'
    // se não existir o mandaremos para '/auth/signup' com um GET

    //Retornaremos o jwt para o front, o front deverá armazenar isso e enviar nas próximas requisições
    res.redirect('/auth/generatejwt');
  }
);

authRouter.get('/generatejwt', (req, res, next) => {
  const token = jwt.sign({ 
    id: req.user.id,
    name: req.user.displayName,
    email: req.user._json.email,
    hd: req.user._json.hd
   }, process.env.SECRET, {
    expiresIn: 60*60*24 // expires in 1 day
  });

  // res.status(200).json({auth: true, jwt: token, message: 'Use this token on next requests to identify which user is requesting'});
  res.redirect(url.format({
    pathname:"/",
    query: {
       "auth": true,
       "token": token,
       "message": 'Use this token on next requests to identify which user is requesting'
     }
  }));
});

authRouter.get('/logout', (req, res) => {
  req.session = null; //Destroy the session
  req.logout();
  res.json({ auth: false, token: null });
});

module.exports = authRouter;