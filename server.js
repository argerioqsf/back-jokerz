const app = require('./src/app');
const botController = require('./src/controllers/botController');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Aplicação executando na porta ', port);
  botController.setPoints();
});