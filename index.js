#!/usr/bin/env node

const { getTransactionsCached, getTransactionCached } = require('./scan');

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

class SettlementPhaseNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'SettlementTimeNotFound';
        this.message = message || 'Settlement time not found';
    }
}

class SettlementTimeNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'SettlementTimeNotFound';
        this.message = message || 'Settlement time not found';
    }
}

function getSettlementTimestamp(transaction) {
    const phaseFound = true;

    for (const phase of transaction.phases) {
        if (phase.name != 'Settlement') {
            continue;
        }

        for (const row of phase.rows) {
            if (row.label != "Settlement Time") {
                continue;
            }

            return parseInt(row.value);
        }
    }
    if (phaseFound) {
        throw SettlementPhaseNotFound();
    } else {
        throw SettlementTimeNotFound();
    }
}

class InitiationTimeNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'InitiationTimeNotFound';
        this.message = message || 'Initiation time not found';
    }
}

function getInitiationTimestamp(transaction) {
    console.log(JSON.stringify(transaction, null, 2));

    for (const row of transaction.rows) {
        if (row.label == "Initiation Timestamp") {
            return parseInt(row.value);
        }
    }
    throw InitiationTimeNotFound();
}

async function main() {
    const txType = "deposit";
    const srcChainId = 0;
    const destChainId = 1;
    const protocol = '8CaGt3W1lYnEPLDU-8uG-'; //Exactly protocol
    const liquidityBridge = 'Accross'; // Across
    const amb = ['LayerZero', 'Hyperlane'];

    const transactions = await getTransactionsCached();

    for (let txMetadata of transactions) {
        try {
            const transaction = await getTransactionCached(txMetadata.transaction_hash);
            const initiationTimestamp = getInitiationTimestamp(transaction);
            const settlementTimestamp = getSettlementTimestamp(transaction);
        
            const delay = settlementTimestamp - initiationTimestamp;

            console.log(`${txMetadata.protocol} @ ${txMetadata.from_chain} -> ${txMetadata.to_chain} delay ${delay}s`, initiationTimestamp, settlementTimestamp);
            break;
        } catch  (err) {
            if (err instanceof SettlementTimeNotFound || err instanceof SettlementPhaseNotFound) {
                continue;
            } 
        }
    }
}

main().catch(console.error);