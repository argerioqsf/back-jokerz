const routes = require('./routes/main');
const routers = require('./routes/main');
module.exports = (app) =>{
    app.use('/',routers)
}