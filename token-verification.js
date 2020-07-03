const jwt = require('jsonwebtoken');

async function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.'});

  jwt.verify(token, process.env.SECRET, (err, decoded) => {

    if (err) return res.status(401).json({ auth: false, message: 'Failed to authenticate token.'});

    //Se tudo estiver ok, salvar dados na request para uso posterior em outros serviços
    req.body.userId = decoded.id;
    req.body.userName = decoded.name;
    req.body.userEmail = decoded.email;
    req.body.hostDomain = decoded.hd;

    let domain = decoded.hd;
    console.log('======================================domain=============================', domain);

    //Se os últimos 6 caracteres não forem usp.br
    if (domain.substr(domain.length - 6) !== 'usp.br') res.redirect('/auth/failed');

    // console.log(decoded);
    next();
  });  
}

async function verifySuperUser(req, res, next) {
  const response = await axios({
    method: 'get',
    url: `http://servico_usuarios:8080/usuarios/aluno/${req.user.id}`,
    responseType: 'json'
  });

  let isSuperUser = response.data.nivelacesso; 

  if (isSuperUser) {
    next();
  } else {
    res.status(401).json({ auth: false, message: 'You are not a super user'});
  }
}

module.exports = {
  verifyJWT,
  verifySuperUser
}