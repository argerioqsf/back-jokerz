var axios = require('axios');
const jwt = require('jsonwebtoken');
module.exports = {
    getTokenFromCode: async (code)=>{
        let url = `https://id.twitch.tv/oauth2/token?`;
        url += `client_id=cxzb1067dgz0mtca08o9s9k9ny9aqk`;
        url += `&client_secret=pmdnqe6i2hbbaiooltx2cgt0v2qsyd`;
        url += `&grant_type=authorization_code`;
        url += `&redirect_uri=http://localhost:3000/callback_oauth`;
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