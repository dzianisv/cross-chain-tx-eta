
class ChainsManager {
    constructor() {
      this.chainsMap = this.buildChainsMetadata();
    }
  
    buildChainsMetadata() {
      /**
       * [{
       *   "chainId": 1,
       *   "name": "Ethereum",
       *   "isL1": true,
       *   "sendingEnabled": true,
       *   "icon": "https://media.socket.tech/networks/ethereum.svg",
       *   "receivingEnabled": true,
       *   "refuel": {
       *     "sendingEnabled": true,
       *     "receivingEnabled": false
       *   },
       *   "currency": {
       *     "icon": "https://maticnetwork.github.io/polygon-token-assets/assets/eth.svg",
       *     "name": "Ether",
       *     "symbol": "ETH",
       *     "decimals": 18,
       *     "minNativeCurrencyForGas": "15000000000000000"
       *   },
       *   "rpcs": [
       *     "https://rpc.ankr.com/eth"
       *   ],
       *   "explorers": [
       *     "https://etherscan.io"
       *   ]
       * }]
       */
      const chainsMap = {};
      const chainsMetadata = require("./samples/chains.json");
      for (const item of chainsMetadata) {
        chainsMap[item.chainId] = item;
      }
  
      return chainsMap;
    }
  
    getChainNameById(chainId) {
      const chain = this.chainsMap[chainId];
      return chain ? chain.name.toLowerCase(): null;
    }
  }

const chainsManager = new ChainsManager();

module.exports = {
    ChainsManager,
    chainsManager
};