var axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    getTokenFromCode: async (code)=>{
        let url = `https://id.twitch.tv/oauth2/token?`;
        url += `client_id=${process.env.CLIENT_ID}`;
        url += `&client_secret=${process.env.CLIENT_SECRET}`;
        url += `&grant_type=authorization_code`;
        url += `&redirect_uri=${process.env.REDIRECT_URI}`;
        url += `&code=${code}`;
    
        try {
            const resp = await axios.post(url)
            return {
                status:true,
                resp:resp
            };
        } catch (error) {
            return {
                status:false,
                error:error
            };
        }
    },
    parseJWTToken: (token)=>{
        try {
            const decoded = jwt.decode(token);
            return {
                status:true,
                resp:decoded
            };
        } catch (error) {
            return {
                status:false,
                error:error
            };
        }
    }
}