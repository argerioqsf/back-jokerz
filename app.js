const express = require('express');
const path = require('path');
const botController = require('./src/controllers/bot/botController');

const app = express();
const env = process.env.NODE_ENV || 'development';
const envDir = path.join(__dirname,`./src/configs/env/${env}`)

require(envDir)(app);
// require('./src/configs/passport')(app);
require('./src/index')(app);


app.listen(app.get('port'), () => {
  console.log('Aplicação executando na porta ', app.get('port'));
  botController.setPoints();
  botController.addChannelsInitial();
});

// ==> Rotas da API:
// const productRoute = require('./routes/product.routes');

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.json({ type: 'application/vnd.api+json' }));
// app.use(cors());

// app.use('/api/', productRoute);