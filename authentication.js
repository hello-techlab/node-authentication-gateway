const express = require('express');
const url = require('url');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const authRouter = express.Router();
const axios = require('axios');

const tokenVerification = require('./token-verification');

authRouter.get('/failed', (req, res) => {
  res.sendStatus(401).json({message: 'You failed to authenticate. You do not have an USP email :('});
});

authRouter.get('/login',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/info', tokenVerification.verifyJWT, async (req, res, next) => {
  // const response = await axios({
  //   method: 'get',
  //   url: `http://servico_usuario:8080/usuarios/aluno/${req.body.userId}`,
  //   responseType: 'json'
  // });

  // console.log(response);

  res.status(200).json({
    id: req.body.userId,
    name: req.body.userName,
    email: req.body.userEmail,
  })
});

// authRouter.get('/signup', (req, res, next) => {
//   res.send('Aqui teremos a página de cadastro dos dados, perguntaremos o instituto e o número usp da pessoa. Essa página só aparecerá no primeiro login');
// });

// authRouter.post('/signup', async (req, res, next) => {
//   //Dados criados pelo usuário no cadastro
//   let nusp = req.body.nusp;
//   let instituto = req.body.instituto;

//   //Dados retornados pelo oAuth
//   let userId = req.userId; 
//   let userName = req.userName;
//   let userEmail = req.userEmail;

//   console.log('auth', userEmail, nusp);

//   try {
//     await axios.post('http://localhost:3000/usuarios/aluno', {
//       nusp: req.body.nusp,
//       instituto: req.body.instituto,
//       userId: req.userId,
//       userName: req.userName,
//       userEmail: req.userEmail,
//     });
//     res.status(200).json({message: 'User created'});
//   } catch(err) {
//     res.status(400).json({message: err});
//   }

// });

authRouter.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/failed' }),
  function(req, res) {
    
    //Se os últimos 6 caracteres não forem usp.br
    // let domain = req.user._json.hd;
    // console.log('======== Callback --> Domain: ', domain);
    // console.log('======== Last 6 characters: ', domain.substr(domain.length - 6));
    // if (domain == undefined || domain.substr(domain.length - 6) !== 'usp.br') res.redirect('/auth/failed');

    // Gerar um token para as futuras requisições
    // console.log('======================= req ========================', req, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
    // console.log('======================= req.user ========================', req.user);
    
    // console.log('\n\n\n=================================Dentro do callback indo pra /auth/generatejwt', req.user);
    
    res.redirect('/auth/generatejwt');
  }
);

authRouter.get('/generatejwt', (req, res, next) => {
  // console.log('\n\n\n=================================Dentro do generatejwt indo indo fazer o token', req.user);

  const token = jwt.sign({ 
    id: req.user._json.sub,
    name: req.user._json.name,
    email: req.user._json.email,
    hd: req.user._json.hd
   }, process.env.SECRET, {
    expiresIn: 60*60*24 // expires in 1 day
  });

  // try {
    // Verificar se o usuário já está no Banco de Dados com o nusp e Instituto
    // const response = await axios({
    //   method: 'get',
    //   url: `http://servico_usuarios:8080/usuarios/aluno/${req.user.id}`,
    //   responseType: 'json'
    // });


    // retorna um 404 - not found

    // if (response.data.error) {
    //   res.status(200).json({ auth: true, token: token, message: 'This user is not registered on our database. We need to ask him Nusp and Institute'});
    // } else {

      // console.log('\n\n\n=================================Token feito, indo redirecionar para /loginpage', req.user);

      //Retornaremos o jwt para o front, o front deverá armazenar isso e enviar nas próximas requisições
      res.redirect(url.format({
        pathname:"/loginpage",
        query: {
            "auth": true,
            "token": token,
            "message": 'Use this token on next requests to identify which user is requesting'
          }
      }));
  //   }
  // } catch(err) {
  //   console.error(err);
  //   res.redirect(401).json({error: err});
  // }
});

authRouter.get('/logout', (req, res) => {
  req.session = null; //Destroy the session
  req.logout();
  res.json({ auth: false, token: null });
});

module.exports = authRouter;