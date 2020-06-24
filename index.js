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

//Routes
const authRoutes = require('./authentication');

//Auth routes
app.use('/auth', authRoutes);

// ============================= Gateway ============================= 

// ===== Tests =====
const apiQqrProxy = httpProxy('http://localhost:8080');
app.get('/test/clientes', (req, res, next) => {
  apiQqrProxy(req, res, next);
});

app.post('/test', verifyJWT, (req, res, next) => {
  console.log('aqui foi')
  apiQqrProxy(req, res, next);
});

app.get('/clientes', verifyJWT, (req, res, next) => { 
  res.json([{id:req.userId, nome:'Nicolau'}]);
}); 

// ===== Serviço questionários =====
const svcQuestionariosProxy = httpProxy('http://servico_questionarios:8080');
app.get('/questionarios/lista', verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});
app.post('/questionarios', verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});

app.put('/questoes', verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});
app.post('/questoes', verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});

app.post('/questionarios/:name/begin', verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});
app.put('/questionarios/:name/:session_id/proxima', verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});

// ===== Serviço email =====
const svcEmailProxy = httpProxy('http://servico_email:8080');
app.post('/email/relatorio/enviar', verifyJWT, (req, res, next) => {
  svcEmailProxy(req, res, next);
});

// ===== Serviço usuários =====
// /usuarios
const svcUsuariosProxy = httpProxy('http://servico_usuario:8080');
app.get('/usuarios/gapsi', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.post('/usuarios/gapsi', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.put('/usuarios/gapsi/:emailatendente', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.delete('/usuarios/gapsi/:emailatendente', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.get('/usuarios/aluno', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.post('/usuarios/aluno', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.put('/usuarios/gapsi/:nuspusuario', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.delete('/usuarios/gapsi/:nuspusuario', verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});


// ============================= Server ============================= 
const PORT = process.env.port | 8080;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));

async function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token'];

  // if (!token) return res.status(401).json({ auth: false, message: 'No token provided.'});
  if (!token) res.redirect('/auth/login');

  jwt.verify(token, process.env.SECRET, (err, decoded) => {

    // if (err) return res.status(401).json({ auth: false, message: 'Failed to authenticate token.'});
    if (err) res.redirect('/auth/login');

    //Se tudo estiver ok, salvar dados na request para uso posterior em outros serviços
    req.userId = decoded.id;
    req.userName = decoded.name;
    req.userEmail = decoded.email;
    req.hostDomain = decoded.hd;

    //Se não for um email usp rejeitaremos
    if (req.hostDomain !== 'usp.br') res.redirect('/auth/failed');

    console.log(decoded);
    next();
  });  
}