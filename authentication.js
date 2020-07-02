const express = require('express');
const authRouter = express.Router();

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

app.get('/auth/google',
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
  //console.log(`Welcome, Mr ${req.user.displayName} of email: ${req.user._json.email} of domain ${req.user._json.hd} and id:${req.user.id}. Your token is: ${token}`);
  res.status(200).json({auth: true, jwt: token, message: 'Use this token on next requests to identify which user is requesting'});
});

app.get('/auth/logout', (req, res) => {
  req.session = null; //Destroy the session
  req.logout();
  res.json({ auth: false, token: null });
});