const path           = require('path');
const morgan         = require('morgan');
const express        = require('express');
const cors           = require('cors');
// const expressEjsLayouts = require('express-ejs-layouts')
// const passport = require('passport');
// const Pessoa = require('../../schemas/pessoa')
// const LocalStrategy = require('passport-local').Strategy;

module.exports = (app) =>{
    app.set('port',3333);
    // app.set('views',path.join(__dirname,'./../../views'));
    // app.set('view engine', 'ejs');
    // app.use('layout extractScripts',true);
    // app.use('layout extracticStyles',true);

    // app.use(expressEjsLayouts);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use(express.json({ type: 'application/vnd.api+json' }));
    app.use(cors());


    
    
    

    // passport.use(new LocalStrategy(Pessoa.authenticate())); 
    // passport.serializeUser(Pessoa.serializeUser());
    // passport.deserializeUser(Pessoa.deserializeUser());
}