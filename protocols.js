
class ProtocolsManager {
    constructor() {
        this.protocolsMap = this.buildProtocolsMetadata();
    }

    buildProtocolsMetadata() {
        /**
         *  [{
            "id": "ZyaqoUMH7bXN9GE63sg8V",
            "name": "Aloe",
            "description": "Aloe puts liquidity to work by connecting lenders and market-makers. Fully open-source, governance-minimized, and powered by Uniswap.",
            "type": "lending",
            "tagline": "Permissionless lending built on Uniswap",
            "is_hidden": false,
            "is_authenticated": true,
            "defillama_id": "",
            "vanity_url": "aloe",
            "primary_color": "#33c6ab",
            "status": "",
            "status_message": "nominal",
            "deploy_date": "2023-12-14T00:00:00Z"
         }]
         */
        const protocolsMap = {};
        const protocolsMetadata = require("./samples/protocols.json");
        for (const item of protocolsMetadata) {
            protocolsMap[item.id] = item;
        }

        return protocolsMap;
    }

    getProtocolNameById(protocolId) {
        const protocol = this.protocolsMap[protocolId];
        return protocol ? protocol.name : null;
    }
}

const protocolsManager = new ProtocolsManager();

module.exports = {
    protocolsManager,
    ProtocolsManager
};