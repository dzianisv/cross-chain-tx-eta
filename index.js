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
    const srcChain = 'optimism';
    const dstChain = 'arbitrum';
    const protocol = 'exactly protocol';
    const bridge = 'stargate';
    const amb = ['layerzero', 'hyperlane'];


    const transactions = await getTransactionsCached();
    const matchedTx = [];
    for (let tx of transactions) {
        if (tx.srcChain != srcChain || tx.dstChain != dstChain || tx.protocol != protocol, tx.type != type) {
            console.log("Skipping ", tx.type, tx.protocol, tx.srcChain, tx.dstChain, tx.hash);
            continue;
        }

        try {
            const txDetails = await getTransactionCached(tx.hash);
            const txMetadata = new TxMetadata(tx, txDetails);

            if (txMetadata.matches(type, protocol, srcChain, dstChain, bridge, amb)) {
                console.log('Matched transaction', txMetadata, `time ${txMetadata.getTime()}ms`);
                matchedTx.push(txMetadata);
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

    const sum = matchedTx.reduce((acc, tx) => acc + tx.getTime(), 0);
    const average = sum / matchedTx.length;
    console.log(`average confirmation time for ${type} ${protocol} @ ${srcChain}->${dstChain} over ${bridge}, ${amb} is ${average}ms`);
}

main().catch(console.error);