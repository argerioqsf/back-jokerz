const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo:27017/jokerz', {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true, useFindAndModify:false})
.then(result => {
  console.log('MongoDB Conectado');
})
.catch(error => {
  console.log('Erro de connexão com MongoDB:',error);
});;
mongoose.Promise = global.Promise;

module.exports = mongoose;