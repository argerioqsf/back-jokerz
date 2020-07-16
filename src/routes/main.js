const router = require('express-promise-router')();
// const botController = require('../controllers/bot/botController');
const pessoasController = require('../controllers/pessoas/pessoasController');
const canalController = require('../controllers/canal/canalController');
const productsController = require('../controllers/products/productsController');
const authController = require('../controllers/auth/authController');
var passport = require('passport');
const oauth = require('../services/oauthtwitch');
const uuid = require("uuid").v4;
const Pessoa = require('../schemas/pessoa');

const verifyAuth = async (req, res, next)=>{
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  console.log('req.cookies[session]: ',req.cookies['session']);
  if (req.cookies['session']) {
      let session = req.cookies['session'];
      let pessoa = await Pessoa.find({session:session}).populate('channels.info_channel');
      if (pessoa[0]) {
        pessoa[0]._id = pessoa[0];
        req.user = pessoa[0];
        next();
      } else {
        res.status(403).json({
            message:"Cookie inválido"
        });
      }
  } else {
    res.status(403).json({
        message:"Não possui credenciais"
    });
  }
}

//pessoas
router.get('/person',pessoasController.listPessoas);
router.get('/person/session', verifyAuth,pessoasController.findPessoaBySession);
router.put('/person/channels', pessoasController.addChannel);
router.get('/person/status', pessoasController.listPessoasOn);
router.put('/person/status', pessoasController.setStatusPessoaCanal);
router.get('/person/points/zerar', pessoasController.zerarPontosPessoas);

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
router.get('/products',productsController.listProducts);
router.post('/products/promo',verifyAuth,productsController.setPromo);
router.get('/products/promo',productsController.listProductsPromo);

//auth
// router.get('/auth/login',passport.authenticate("twitch"));
router.get('/auth/url-twitch',authController.getUrlTwitch);
router.get('/auth/from-code-twitch',authController.authFromCode);

module.exports = router;