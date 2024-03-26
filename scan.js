const { cachingWrapper } = require('./cache');
const { chainsManager } = require('./chains');
const { protocolsManager } = require('./protocols');

/**
 * 
 * @returns [{
 *   "transaction_hash": "0x5cc887031e42689023da5d3891ac23bc7c60cb6c0dd93714da5865501b92c40d",
 *   "tx_type": 1,
 *   "sender": "0x983e82aa3e9ebdcf8cd3900469ee6a78d72afcf8",
 *   "from_chain": 137,
 *   "to_chain": 42161,
 *   "creation_timestamp": 1711326509000,
 *   "superform_id": "264648886265639357848084725277081235224971075091275440690879058",
 *   "vault": "WETH+",
 *   "protocol": "ZyaqoUMH7bXN9GE63sg8V",
 *   "status": 0
 * }]
 */


async function getTransactionsApi() {
    const response = await fetch("https://api.superform.xyz/explorer/transactions?offset=0&limit=100", {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
        },
        "method": "GET",
        "mode": "cors"
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function getTransactions() {
    const txs = await getTransactionsApi();

    return txs.map(e => ({
        transaction_hash: e.transaction_hash,
        from_chain: chainsManager.getChainNameById(e.from_chain),
        to_chain: chainsManager.getChainNameById(e.to_chain),
        protocol: protocolsManager.getProtocolNameById(e.protocol)
    }));
}

const getTransactionsCached = cachingWrapper(getTransactions);

/**
 * 
 * @param {string} txId 
 * @returns {Promise<object>}
 */
async function getTransactionApi(txId) {
    const url = `https://api.superform.xyz/explorer/transaction/${txId}`;
    const response = await fetch(url, {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5"
        },
        "referrer": "https://scan.superform.xyz/",
        "method": "GET",
        "mode": "cors"
    });

    if (!response.ok) {
        throw new Error(`GET ${url} status: ${response.status}`);
    }

    return (await response.json())[0];
}

const getTransactionCached = cachingWrapper(getTransactionApi);

module.exports = {
    getTransactions,
    getTransactionsCached,
    getTransactionCached
};