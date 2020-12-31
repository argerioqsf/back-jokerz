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

//Perguntas
router.post('/adm/perguntas',authMiddleware, perguntaController.registerPergunta);
router.get('/adm/perguntas',authMiddleware, perguntaController.listPerguntas);
router.get('/adm/perguntas/:id',authMiddleware, perguntaController.findPergunta);
router.delete('/adm/perguntas/:id',authMiddleware, perguntaController.deletePergunta);

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

module.exports = router;