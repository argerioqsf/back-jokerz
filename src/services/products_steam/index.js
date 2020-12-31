var axios = require('axios');
const jwt = require('jsonwebtoken');
const id_owenr = '76561198044858151';
const name_owenr = 'teamjokerzdudis';
// 76561198044858151
// teamjokerzdudis

// 76561198399029270
// argerioaf
module.exports = {
    getItensCs: async ()=>{
        let url = `https://steamcommunity.com/id/${name_owenr}/inventory/json/730/2`;
    
            return axios.get(url);
    },
    organizarArrayItens: async (data)=>{
        let itens = [];
        let rgDescriptions = Object.values(data.rgDescriptions);
        let rgInventory = Object.values(data.rgInventory);
        for (let i = 0; i < rgDescriptions.length; i++) {
            rgDescriptions[i].id_owenr = '76561198044858151';
            for (let j = 0; j < rgInventory.length; j++) {
                if (rgInventory[j].classid == rgDescriptions[i].classid) {
                    rgDescriptions[i].id_item = rgInventory[j].id;
                    if (rgDescriptions[i].actions && rgDescriptions[i].actions[0] && rgDescriptions[i].actions[0].link) {
                        rgDescriptions[i].actions[0].link = rgDescriptions[i].actions[0].link.replace(/%owner_steamid%/g,id_owenr);
                        rgDescriptions[i].actions[0].link = rgDescriptions[i].actions[0].link.replace(/%assetid%/g,rgDescriptions[i].id_item);
                    }
                    itens = [
                        ...itens,
                        rgDescriptions[i]
                    ]
                }
            }
            if (i == rgDescriptions.length-1) {
                return itens;
            }
        }
    }
}