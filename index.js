// VOCÊ FARÁ ASSIM: NGINX --> API-GATEWAY(NODE) --> SERVIÇO DESEJADO
// Pegue desse tutorial como fazer o gateway em nodejs: https://www.luiztools.com.br/post/api-gateway-em-arquitetura-de-microservices-com-node-js/
// A api gateway que fará a autenticação e autorização (verificação da identidade do request), então será nesse serviço MediaStreamAudioSourceNode, usando o google strategy
require('dotenv-safe').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const helmet = require('helmet');
var httpProxy = require('express-http-proxy');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
require('./passport-setup');
const url = require('url');

app.use(helmet()); //Camada de proteção para requisições maliciosas
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cookieSession({
  name: 'techlab-session',
  keys: ['key1', 'key2']
}));

app.use(passport.initialize());
app.use(passport.session());

// ===========================================
const apiQqrProxy = httpProxy('http://localhost:8080');
app.get('/test/clientes', (req, res, next) => {
  apiQqrProxy(req, res, next);
});

app.post('/test', verifyJWT, (req, res, next) => {
  apiQqrProxy(req, res, next);
});

app.get('/clientes', verifyJWT, (req, res, next) => { 
  //Aqui mandarei a requisição para o serviço que for necessário com o id do cliente que obtenho de req.UserId


  console.log("Retornou todos clientes!");
  res.json([{id:req.userId, nome:'Nicolau'}]);
}); 

// ===========================================
// Essa glr de baixo vai para outro arquivo

app.post('/login', (req, res, next) => {
  //esse teste abaixo deve ser feito no seu banco de dados
  console.log('ok');
  if(req.body.user === 'nic' && req.body.pwd === '123'){
    //auth ok
    const id = 1; //esse id viria do banco de dados
    const token = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 60*60 // expires in 1h
    })
    return res.json({ auth: true, token }); //Você retorna para usar manualmente, mas não salva em cookie
  }
  
  res.status(500).json({message: 'Login inválido!'});
});

function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.'});

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.'});

    //Se tudo estiver ok, salvar na request para uso posterior
    req.userId = decoded.id;
    next();
  })  
}
// ===========================================

app.get('/auth/failed', (req, res) => {
  res.send('You failed to authenticate');
});

app.get('/auth/info',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    //Somente retornaremos o jwt para o front, o front deverá armazenar isso e enviar nas próximas requisições
    res.redirect('/auth/generatejwt');
  }
);

app.get('/auth/generatejwt', (req, res, next) => {
  const token = jwt.sign({ id: req.user.id }, process.env.SECRET, {
    expiresIn: 60*5 // expires in 5min
  });
  console.log(`Welcome, Mr ${req.user.displayName} of email: ${req.user._json.email} of domain ${req.user._json.hd} and id:${req.user.id}. Your token is: ${token}`);
  res.redirect(url.format({
    pathname:"http://localhost:8000/loginpage",
    query: {
        "auth": true,
        "token": token,
        "message": 'Use this token on next requests to identify which user is requesting'
      }
  }));
});

app.get('/auth/logout', (req, res) => {
  req.session = null; //Destroy the session
  req.logout();
  res.json({ auth: false, token: null });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0')
console.log(`Listening on http://localhost:${PORT}`)