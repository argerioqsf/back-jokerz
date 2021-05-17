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
            if (rgDescriptions[i].classid == '4416290084') {
                for (let j = 0; j < rgInventory.length; j++) {
                    if (rgInventory[j].classid == rgDescriptions[i].classid && rgInventory[j].instanceid == rgDescriptions[i].instanceid) {
                        console.log('rgDescriptions[i].instanceid: ',rgDescriptions[i].instanceid);
                        let item = rgDescriptions[i];
                        item.id_item = rgInventory[j].id;
                        if (item.actions && item.actions[0] && item.actions[0].link) {
                            item.actions[0].link = item.actions[0].link.replace(/%owner_steamid%/g,id_owenr);
                            item.actions[0].link = item.actions[0].link.replace(/%assetid%/g,rgDescriptions[i].id_item);
                        }
                        console.log('item.id_item: ',item.id_item);
                        console.log('item.actions[0].link: ',item.actions[0].link);
                        itens = [
                            ...itens,
                            item
                        ]
                    }
                }
            }
            if (i == rgDescriptions.length-1) {
                // console.log('i == rgDescriptions.length-1: ',i,' - ', rgDescriptions.length-1);
                return itens;
            }
        }

        
        // for (let j = 0; j < rgInventory.length; j++) {
        //     rgInventory[j].id_owenr = '76561198044858151';
        //     // if (rgInventory[j].classid == '4416290084') {
        //         // console.log('rgInventory['+j+'].id: ',rgInventory[j].id);
        //         for (let i = 0; i < rgDescriptions.length; i++) {
        //             if (rgInventory[j].classid == rgDescriptions[i].classid && rgInventory[j].instanceid == rgDescriptions[i].instanceid) {
        //                 console.log('rgDescriptions[i].instanceid: ',rgDescriptions[i].instanceid);
        //             }
        //             if (i == rgDescriptions.length-1) {
        //                 // console.log('i == rgDescriptions.length-1: ',i,' - ', rgDescriptions.length-1);
        //                 console.log('/////////////////////TERMINOU rgDescriptions/////////////////////');
        //             }
        //         }
        //     // }
        //     if (j == rgInventory.length-1) {
        //         // console.log('i == rgDescriptions.length-1: ',i,' - ', rgDescriptions.length-1);
        //         console.log('/////////////////////TERMINOU rgInventory/////////////////////');
        //         return itens;
        //     }
        // }
    }
}