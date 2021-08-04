const router = require('express-promise-router')();
const pessoasController = require('../controllers/pessoas/pessoasController');
const canalController = require('../controllers/canal/canalController');
const productsController = require('../controllers/products/productsController');
const authController = require('../controllers/auth/authController');
const permissionControler = require('../controllers/permission/permissionControler');
const perguntaController = require('../controllers/pergunta/perguntaController');
const nivelController = require('../controllers/nivel/nivelController');
const premiacaoController = require('../controllers/premicao/premiacaoController');
const partidaController = require('../controllers/partida/partidaController');
const categoriasController = require('../controllers/categorias/categoriasController');
const pointsController = require('../controllers/points/pointsController');
const accountsLinkController = require('../controllers/accountsLink/accountsLinkController');
const redeeemPointsController = require('../controllers/redeeemPoints/redeeemPointsController');
const redeemProductsController = require('../controllers/redeemProducts/redeemProductsController');
const rewardsController = require('../controllers/rewards/rewardsController');
const authMiddleware = require('../middlewares/auth');

//multer
const multer = require('multer');
const fileFilter = function(req, file, cb){
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads/');
        
    },
    filename:function(req,file,cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits:{
        fileSize:1024 * 1024 * 5
    }
    // fileFilter: fileFilter
});

// const upload = multer({dest:'uploads/'});

//pessoas
router.get('/person', authMiddleware, pessoasController.listPessoas);
router.get('/person/type_accounts',pessoasController.listPersonForType);
router.get('/person/info', authMiddleware,pessoasController.findPerson);
router.post('/person/type', authMiddleware,pessoasController.setTypePerson);
router.post('/person/channels', pessoasController.addChannel);
router.get('/person/status', pessoasController.listPessoasOn);
router.put('/person/status', authMiddleware, pessoasController.setStatusPessoaCanal);
router.get('/person/points/zerar', pessoasController.zerarPontosPessoas);
router.put('/person/acconutLink',authMiddleware, pessoasController.setAccountLink);
router.put('/person/:id_user',authMiddleware, pessoasController.editPerson);

//canais
router.get('/channel', authMiddleware,canalController.listCanais);
router.get('/channel/parceiros', canalController.listCanaisParceiros);
router.post('/channel/status', authMiddleware,canalController.statusChannel);
// router.post('/channel', canalController.registerCanal);

//teste
router.get('/testeToken',authMiddleware,(req,res)=>{
    res.status(200).json({
        message:"usuario logado"
    });
});

//products
router.get('/products/reload_products_cs',authMiddleware,productsController.registerProductsCs);
router.post('/products',authMiddleware, upload.any(),productsController.registerProduct);
router.put('/products/:id',authMiddleware, upload.any(), productsController.editProduct);
router.put('/products/:id/status',authMiddleware, productsController.changeStatusProduct);
router.get('/products', productsController.listProducts);
router.get('/products/:id', productsController.findProductById);
router.post('/products/promo',authMiddleware,productsController.setPromo);
router.get('/products/promo',productsController.listProductsPromo);
router.delete('/products/sticker', authMiddleware, productsController.deleteStickerProduct);
router.delete('/products/:id', authMiddleware, productsController.deleteProduct);
router.post('/products/redeeem', authMiddleware, productsController.redeemProduct);

//auth
// router.get('/auth/login',passport.authenticate("twitch"));
router.get('/auth/url-twitch',authController.getUrlTwitch);
router.get('/auth/url-twitch-linkedAccount',authController.getUrlTwitchLinkedAccount);
router.get('/auth/twitch_person',authController.authFromCodePerson);
router.post('/auth/login_streamer',authController.loginStreamer);
router.post('/auth/cadastro_streamer', authMiddleware, authController.registerAuthStreamer);

//permissões
router.post('/adm/permissions',authMiddleware, permissionControler.registerPermission);
router.get('/adm/permissions',permissionControler.listarPermissions);

//Perguntas
router.post('/adm/perguntas',authMiddleware, perguntaController.registerPergunta);
router.get('/adm/perguntas',authMiddleware, perguntaController.listPerguntas);
router.get('/adm/perguntas/status',authMiddleware, perguntaController.statusPerguntas);
router.get('/adm/perguntas/:id',authMiddleware, perguntaController.findPergunta);
router.delete('/adm/perguntas/:id',authMiddleware, perguntaController.deletePergunta);
router.put('/adm/perguntas/:id',authMiddleware, perguntaController.atualizarPergunta);

//Niveis
router.post('/adm/niveis',authMiddleware, nivelController.registerNivel);
router.get('/adm/niveis',authMiddleware, nivelController.listNiveis);
router.get('/adm/niveis/:id',authMiddleware, nivelController.findNivel);
router.delete('/adm/niveis/:id',authMiddleware, nivelController.deleteNivel);

//Premiações
router.post('/adm/premiacoes', authMiddleware, upload.single('image_premio'),premiacaoController.registerPremiacao);
router.get('/adm/premiacoes',authMiddleware, premiacaoController.listPremiacoes);
router.get('/adm/premiacoes/:id',authMiddleware, premiacaoController.findPremiacao);
router.delete('/adm/premiacoes/:id',authMiddleware, premiacaoController.deletePremiacao);

//Partidas
router.post('/adm/partidas', authMiddleware, partidaController.registerPartida);
router.get('/adm/partidas',authMiddleware, partidaController.listPartidas);
router.get('/adm/partidas/atual',authMiddleware, partidaController.findPartidaAtual);
router.get('/adm/partidas/:id',authMiddleware, partidaController.findPartida);
router.delete('/adm/partidas/:id',authMiddleware, partidaController.deletePartida);
router.put('/adm/partidas/:id',authMiddleware, partidaController.atualizarPartida);

//Categorias
router.post('/adm/categorias', authMiddleware,categoriasController.registerCategoria);
router.get('/adm/categorias',authMiddleware, categoriasController.listCategorias);
router.get('/adm/categorias/:id',authMiddleware, categoriasController.findCategoria);
router.delete('/adm/categorias/:id',authMiddleware, categoriasController.deleteCategoria);

//PUB SUB Twitch
router.get('/twitch/SyncPoints',authMiddleware, pointsController.activeSyncPointsTwitch);
router.get('/twitch/SyncPubsub',authMiddleware, pointsController.changeSyncPubsub);

//AcconutsLink
router.post('/acconutLink',  accountsLinkController.registerAccountLink);
router.get('/acconutLink', accountsLinkController.listAccountsLink);
//Points
router.get('/restorePointsStreamElements', authMiddleware, pointsController.restorePointsStreamElements);
    //RedeemPoints
    router.get('/redeemPoints', authMiddleware, redeeemPointsController.listRedeemPoints);
    router.get('/redeemPoints/register/pendentes', authMiddleware, redeeemPointsController.registerRedeemPotionsPendentes);
router.put('/points/:id_channel/:points/roleta', authMiddleware, pointsController.roletaPoints);
router.put('/points/:nickname/:points/add', authMiddleware, pointsController.addpointsManual);


//RedeemProducts
router.get('/redeemProducts', authMiddleware, redeemProductsController.listRedeemProducts);
router.put('/redeemProducts', authMiddleware, redeemProductsController.changeStatusRedeemProducts);

//Rewards
router.get('/rewards', authMiddleware, rewardsController.listRewards);
router.post('/rewards', authMiddleware, rewardsController.createReward);
router.delete('/rewards/:id', authMiddleware, rewardsController.deleteReward);



router.post('/server/points/:hash', pointsController.addPointsBot);

router.get('/restore/:schema', pessoasController.restoreMongo);


module.exports = router;