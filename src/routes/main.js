const router = require('express-promise-router')();
// const botController = require('../controllers/bot/botController');
const pessoasController = require('../controllers/pessoas/pessoasController');
const canalController = require('../controllers/canal/canalController');
const productsController = require('../controllers/products/productsController');
const authController = require('../controllers/auth/authController');
var passport = require('passport');
const oauth = require('../services/oauthtwitch');
const uuid = require("uuid").v4;

const verifyAuth = (req, res, next)=>{
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  console.log('req.cookies[session]: ',req.cookies['session']);
  if (req.cookies['session']) {
      next();
  } else {
    res.status(403).json({
        message:"Não possui credenciais"
    });
  }
}

//pessoas
router.get('/pessoas', verifyAuth,pessoasController.listPessoas);
router.post('/pessoas', pessoasController.registerPessoa);
router.put('/pessoas/channels', pessoasController.addChannel);
router.get('/pessoas/status', pessoasController.listPessoasOn);
router.put('/pessoas/status', pessoasController.setStatusPessoaCanal);
router.get('/pessoas/points/zerar', pessoasController.zerarPontosPessoas);

//canais
router.get('/channel', canalController.listCanais);
router.post('/channel', canalController.registerCanal);

//teste
router.get('/home',verifyAuth,(req,res)=>{
    res.status(200).json({
        message:"usuario logado, HOME 2"
    });
});

//products
router.get('/products/reload_products_cs',productsController.registerProductsCs);
router.get('/products'
,verifyAuth
,productsController.listProducts);
router.post('/products/promo'
// ,verifyAuth
,productsController.setPromo);
router.get('/products/promo'
,verifyAuth
,productsController.listProductsPromo);

//auth
router.get('/auth/login',passport.authenticate("twitch"));
router.get('/auth-url-twitch',authController.getUrlTwitch);
router.get('/auth-from-code-twitch',authController.authFromCode);

module.exports = router;