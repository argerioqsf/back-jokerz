var axios = require('axios');
const jwt = require('jsonwebtoken');
module.exports = {
    getItensCs: async ()=>{
        let url = `https://steamcommunity.com/id/teamjokerzdudis/inventory/json/730/2`;
    
            return axios.get(url);
    }
}