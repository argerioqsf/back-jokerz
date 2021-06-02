
// const Canal = require("../../models/Canais");
const PubSubTwitch = require('../../services/pubsubTwitch');
// const botController = require('../../controllers/bot/botController');

const activeSyncPointsTwitch = async (req, res) => {
    try {
        let active = req.query.active;
        active = (active === 'true');
        console.log("active",active);
        if (active) {
            await PubSubTwitch.listen('channel-points-channel-v1.427822134');
        } else {
            await PubSubTwitch.unlisten('channel-points-channel-v1.427822134');
        }
        res.status(200).json({
          message: 'Pontos da twitch sincronizados'
        });
    } catch (error) {
        res.status(400).send({
            message:'Erro ao sincronizar pontos da twitch',
        });
    }
};

module.exports = {
    activeSyncPointsTwitch
}