const path           = require('path');
const morgan         = require('morgan');
const express        = require('express');
const cors           = require('cors');
var cookieParser     = require("cookie-parser");
const passport       = require("passport");

module.exports = (app) =>{
    app.set('port',3333);
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.json({ type: 'application/vnd.api+json' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use('/uploads', express.static('uploads'));
    app.use(cors());
}