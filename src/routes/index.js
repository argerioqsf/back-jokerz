const router = require('express-promise-router')();
const botController = require('../controllers/botController');
const pessoasController = require('../controllers/pessoasController');
const canalController = require('../controllers/canalController');
const pessoaCanalController = require('../controllers/pessoaCanalController');
// botController.setPoints();
// ==> Definindo as rotas do CRUD - 'Product':

// ==> Rota responsável por criar um novo 'Product': (POST): localhost:3000/api/products
// router.post('/products', botController.createProduct);
router.post('/addChannel', botController.addChannel);
router.post('/rmChannel', botController.rmChannel);


router.get('/canal/:id', canalController.findCanaisById);
router.get('/listPessoas', pessoasController.listPessoas);
router.get('/listPessoasOn', pessoasController.listPessoasOn);
router.get('/canal', canalController.listCanais);


router.post('/canal', canalController.registerCanal);
router.post('/cadastrarPessoas', pessoasController.registerPessoa);

router.post('/pessoa_canal', pessoaCanalController.registerPessoaCanal);
router.get('/pessoa_canal', pessoaCanalController.listPessoaCanal);
router.post('/pessoa_canal/status', pessoaCanalController.setStatusPessoaCanal);

router.get('/zerar_pontos', pessoasController.zerarPontosPessoas);

module.exports = router;