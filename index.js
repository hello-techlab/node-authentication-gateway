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

const tokenVerification = require('./token-verification');

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

app.post('/test', tokenVerification.verifyJWT, (req, res, next) => {
  console.log('aqui foi')
  apiQqrProxy(req, res, next);
});

app.get('/clientes', tokenVerification.verifyJWT, tokenVerification.verifySuperUser, (req, res, next) => { 
  res.json([{id:req.userId, nome:req.userName}]);
}); 

// ===== Serviço questionários =====
const svcQuestionariosProxy = httpProxy('http://servico_questionarios:8080');
app.get('/questionarios', tokenVerification.verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});
app.get('/questionarios/lista', tokenVerification.verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});
app.post('/questionarios', tokenVerification.verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});

app.put('/questoes', tokenVerification.verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});
app.post('/questoes', tokenVerification.verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});

app.post('/questionarios/:name/begin', tokenVerification.verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});
app.put('/questionarios/:name/:session_id/proxima', tokenVerification.verifyJWT, (req, res, next) => {
  svcQuestionariosProxy(req, res, next);
});

// ===== Serviço email =====
const svcEmailProxy = httpProxy('http://servico_email:8080');
app.post('/email/relatorio/enviar', tokenVerification.verifyJWT, (req, res, next) => {
  svcEmailProxy(req, res, next);
});

// ===== Serviço usuários =====
// /usuarios
const svcUsuariosProxy = httpProxy('http://servico_usuario:8080');
app.get('/usuarios/gapsi', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.post('/usuarios/gapsi', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.put('/usuarios/gapsi/:emailatendente', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.delete('/usuarios/gapsi/:emailatendente', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.get('/usuarios/aluno', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.post('/usuarios/aluno', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.put('/usuarios/gapsi/:nuspusuario', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});

app.delete('/usuarios/gapsi/:nuspusuario', tokenVerification.verifyJWT, (req, res, next) => {
  svcUsuariosProxy(req, res, next);
});


// ============================= Server ============================= 
const PORT = process.env.port | 8080;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));