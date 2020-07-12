const router = require('express-promise-router')();
var passport = require('passport');

router.get('/login',passport.authenticate("twitch"));

router.get('/error',(req,res)=>{
    res.status(200).json({
        message:"erro ao logar, HOME",
        user:req.user
    });
});

router.get('/url-twitch',(req,res)=>{

  const url = 'https://id.twitch.tv/oauth2/authorize?client_id=cxzb1067dgz0mtca08o9s9k9ny9aqk&redirect_uri=http://localhost:3000/home&response_type=code&scope=user_read channel_read';

  res.status(200).json({
    message:'url de login gerada com sucesso',
    data:{url:url},
  });
});

router.get('from-code-twitch',(req,res)=>{
  res.status(200).json({
    message:'token retornado com sucesso',
    data:{url:url},
  });
});

router.get("/auth/twitch/callback", passport.authenticate("twitch"), function(req, res) {
  // Successful authentication, redirect home.
    res.redirect('/home');
});
module.exports = router;