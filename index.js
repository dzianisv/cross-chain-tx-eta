#!/usr/bin/env node

const { getTransactionsCached, getTransactionCached } = require('./scan');
const { SettlementTimeNotFound, TxMetadata } = require('./transaction');

/* reate a script using data from all cross-chain transactions obtained in the Superscan API that takes in 
 - a source chain id, 
 - destination chain id,
 - liquidity bridge (i.e. Across, Celer, etc.), 
 - combination of 2 AMB’s (LayerZero, Hyperlane, and Wormhole) and 
 
 @returns an estimate of the time until the transaction can be processed. 
*/


// example = https://scan.superform.xyz/tx/0xd2124914a25eb78ae5a89dd087dc765298e07e9df5a533023468f6d04ea5f4c2/?superformId=62771017355677689998155016160060914598077108308374651991157
// Optimism
// Arbitrum
// Bridge


async function main() {
    const type = "deposit";
    const srcChain = 'Arbitrum';
    const dstChain = 'Optimism';
    const protocol = 'exactly protocol';
    const bridge = 'Accross'; // Across
    const amb = ['LayerZero', 'Hyperlane'];


    const transactions = await getTransactionsCached();

    for (let tx of transactions) {
        if (tx.from_chain != srcChain || tx.to_chain != dstChain || tx.protocol != protocol) {
            console.log("Skipping ", tx.transaction_hash, tx.from_chain, tx.to_chain, tx.protocol);
            continue;
        }

        try {
            const txDetails = await getTransactionCached(tx.transaction_hash);
            const txMetadata = new TxMetadata(tx, txDetails);
            if (txMetadata.matches(type, protocol, srcChain, dstChain, bridge, amb)) {
                console.log(txMetadata);
                break;
            }

        } catch (err) {
            if (err instanceof SettlementTimeNotFound) {
                continue;
            } else {
                console.error(err);
                break;
            }
        }
    }
}

main().catch(console.error);