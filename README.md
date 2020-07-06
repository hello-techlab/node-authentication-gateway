# Serviço de autenticação/gateway
O seguinte serviço desenvolvido em NodeJS funciona como um gateway e é responsável pela autenticação de toda a aplicação. É usado o protocolo de autenticação oAuth do Google, assim, basta fazer o login com uma conta Google para receber o acesso. 

### 1 - Instalação das dependências Node

Para instalar as dependências:
```
npm install
```
ou
```
yarn
```

### 2 - Autenticação
Por utilizar o protocolo oAuth, é recomendado o entendimento de seu funcionamento, para isso acesse a [documentação oficial do Google](https://www.google.com).

Todas as funções de autenticação estão em rotas iniciadas com **/auth** e são direcionadas para o arquivo **authentication.js**.
Ao acessar a **/auth/login** , o usuário será redirecionado à tela de login do Google. Após inserir os dados, será redirecionado para a rota **/auth/google/callback**. 
Nessa rota, o serviço de autenticação é feito com a biblioteca *passport*, caso o usuário seja corretamente identificado, ele é redirecionado para a rota **/auth/generatejwt**.
Nela, é gerado um JSON Web Token com os dados obtidos da autenticaçao oAuth. Esse token é enviado à aplicação de front-end **techlab-app**, que armazena o token para as futuras requisições. A aplicação de front-end, então, envia as próximas requisições com o token adquirido na autenticaçao no header [x-access-token]. 

Esse token é verificado com as funções do arquivo **token-verification.js**, que atuam como middleware em todas as requisições.
### 3 - Gateway
Como supracitado, o serviço atua como um gateway, pois direciona todas as requisições para os corretos serviços. Isso é executado no arquivo **index.js** com a biblioteca *express-http-proxy*. 
Exemplo: caso o serviço de front-end envie uma requisição GET para **/questionarios/lista**, ela será redirecionada para o outro serviço de outro container que lida com os questionários. Utilizando o DNS do Docker Bridge, o ip do serviço se torna o nome do próprio container, nesse caso *http://servico_questionario*.  Assim, a requisição é repassada para esse serviço, que a processa e retorna com uma resposta.

### 4- Arquivos .env
As bibliotecas *passport* e o protocolo oAuth possuem dados sensíveis utilizados para a autenticação. Portanto, eles são armazenados nos arquivos **.env** e **env.example** e não são enviados ao repositório git.

**Obs.:** Para que o serviço funcione é necessário que esses dois arquivos estejam na pasta do serviço com os nomes exatos **.env** e **env.example** com o seguinte formato:
```
#passport
SECRET=segredoDoPassport

#oAuth
clientID="idClienteGoogleoAuth"
clientSecret="segredoClienteGoogleOauth"
callbackURL="http://suaURLseCallback"
```

A URL de callback pode ser configurada [aqui](https://console.developers.google.com/apis/credentials?pli=1&project=seraphic-scarab-279918&folder=&organizationId=).
É necessário utilizar um domínio, não é possível adicionar apenas o IP de uma máquina.