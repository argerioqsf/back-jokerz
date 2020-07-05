
const passport       = require("passport");
const twitchStrategy = require("@d-fischer/passport-twitch").Strategy;
const Pessoa = require('../../schemas/pessoa');

module.exports = (app) =>{
    app.use(passport.initialize());
    passport.use(new twitchStrategy({
        clientID: 'cxzb1067dgz0mtca08o9s9k9ny9aqk',
        clientSecret: 'kf020qdbp1ilez5nkvgkfui2xog1qg',
        callbackURL: "http://localhost:3333/auth/twitch/callback",
        scope: ["user_read","channel_read"]
      },
      function(accessToken, refreshToken, profile, done) {
        //   return done(err, user);
        console.log('login twitch: ',profile.display_name);
            Pessoa.find({
                'idTwitch': profile.id 
            }, function(err, user) {
                if (err) {
                    console.log('erro ao logar: ',err);
                    return done(err);
                }
                //No user was found... so create a new user with values from Facebook (all the profile. stuff)
                if (!user || user.length == 0) {
                    console.log('usuario ainda n existe');
                    user = new Pessoa({
                        name: profile.login,
                        nickname: profile.display_name,
                        points: 0,
                        idTwitch:profile.id,
                        accessTokenTwitch:accessToken,
                        refreshTokenTwitch:refreshToken
                    });
                    user.save(function(err) {
                        if (err) console.log('erro autenticcao:',err);
                        return done(err, user);
                    });
                } else {
                    console.log('usuario ja exixte: ',user);
                    //found user. Return
                    return done(err, user);
                }
            });
      }
    ));
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    //http://localhost:3333/auth/twitch
    //http://localhost:3333/auth/twitch/callback
    app.get("/auth/twitch", passport.authenticate("twitch"));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", { successRedirect: '/home',failureRedirect: "/error" }));
}