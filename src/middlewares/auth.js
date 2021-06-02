const jwt = require('jsonwebtoken');
const authConfig = require('../configs/auth.json');

module.exports = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({
            message:'Falha na autenticação, não possui token',
            error:{}
        });
    }

    const parts = authHeader.split(' ');
    // console.log('parts: ',parts);

    if (!parts.length === 2) {
        return res.status(401).send({
            message:'Falha na autenticação, token inválido',
            error:{}
        });
    }

    const [ schema, token ]= parts;
    // console.log('schema: ',schema);
    if(!/^Bearer$/i.test(schema)){
        return res.status(401).send({
            message:'Falha na autenticação, token mau estruturado',
            error:{}
        });
    }

    jwt.verify(token,authConfig.secret,(err,decoded)=>{
        if(err) return res.status(401).send({
            message:'Falha na autenticação, token incorreto',
            error:{}
        });
        console.log("decoded: ",decoded);

        req.userId = decoded.id;
        return next();
    })
}