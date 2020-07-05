const router = require('express-promise-router')();
// const botController = require('../controllers/bot/botController');
const pessoasController = require('../controllers/pessoas/pessoasController');
const canalController = require('../controllers/canal/canalController');
var passport = require('passport');
// const pessoaCanalController = require('../controllers/pessoaCanal/pessoaCanalController');

// // botController.setPoints();
// // ==> Definindo as rotas do CRUD - 'Product':

// // ==> Rota responsável por criar um novo 'Product': (POST): localhost:3000/api/products
// // router.post('/products', botController.createProduct);
// router.post('/addChannel', botController.addChannel);
// router.post('/rmChannel', botController.rmChannel);

function authenticationMiddleware () {  
    return function (req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      }
      res.redirect('/error')
    }
  }
// router.get('/canal/:id', canalController.findCanaisById);

router.get('/pessoas',authenticationMiddleware(), pessoasController.listPessoas);
router.post('/pessoas', pessoasController.registerPessoa);
router.put('/pessoas/channels', pessoasController.addChannel);
router.get('/pessoas/status', pessoasController.listPessoasOn);
router.put('/pessoas/status', pessoasController.setStatusPessoaCanal);
router.get('/pessoas/points/zerar', pessoasController.zerarPontosPessoas);

router.get('/channel', canalController.listCanais);
router.post('/channel', canalController.registerCanal);


// router.post('/pessoa_canal', pessoaCanalController.registerPessoaCanal);
// router.get('/pessoa_canal', pessoaCanalController.listPessoaCanal);
// router.post('/pessoa_canal/status', pessoaCanalController.setStatusPessoaCanal);


router.get('/home',(req,res)=>{
    res.status(200).json({
        message:"usuario logado, HOME"
    });
});

router.get('/error',(req,res)=>{
    res.status(200).json({
        message:"erro ao logar, HOME",
        user:req.user
    });
});

router.get("/auth/twitch/callback", passport.authenticate("twitch", { successRedirect: '/home',failureRedirect: "/error" }));

module.exports = router;