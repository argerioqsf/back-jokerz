const router = require('express-promise-router')();
const pessoasController = require('../controllers/pessoas/pessoasController');
const canalController = require('../controllers/canal/canalController');
const productsController = require('../controllers/products/productsController');
const authController = require('../controllers/auth/authController');
const permissionControler = require('../controllers/permission/permissionControler');
const authMiddleware = require('../middlewares/auth');

//pessoas
router.get('/person',pessoasController.listPessoas);
router.get('/person/type_accounts',pessoasController.listPersonForType);
router.get('/person/info', authMiddleware,pessoasController.findPerson);
router.post('/person/type', authMiddleware,pessoasController.setTypePerson);
router.post('/person/channels', pessoasController.addChannel);
router.get('/person/status', pessoasController.listPessoasOn);
router.put('/person/status', authMiddleware, pessoasController.setStatusPessoaCanal);
router.get('/person/points/zerar', pessoasController.zerarPontosPessoas);

//canais
router.get('/channel', authMiddleware,canalController.listCanais);
router.post('/channel/status', authMiddleware,canalController.statusChannel);
// router.post('/channel', canalController.registerCanal);

//teste
router.get('/home',authMiddleware,(req,res)=>{
    res.status(200).json({
        message:"usuario logado, HOME 2"
    });
});

//products
router.get('/products/reload_products_cs',productsController.registerProductsCs);
router.get('/products',productsController.listProducts);
router.post('/products/promo',authMiddleware,productsController.setPromo);
router.get('/products/promo',productsController.listProductsPromo);

//auth
// router.get('/auth/login',passport.authenticate("twitch"));
router.get('/auth/url-twitch',authController.getUrlTwitch);
router.get('/auth/twitch_person',authController.authFromCodePerson);

router.post('/auth/login_streamer',authController.loginStreamer);
router.post('/auth/cadastro_streamer',authController.registerAuthStreamer);

//permissões
router.post('/adm/permissions',permissionControler.registerPermission);
router.get('/adm/permissions',permissionControler.listarPermissions);

module.exports = router;