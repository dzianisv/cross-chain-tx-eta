class ApiPhaseNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'Phase not found';
        this.message = message || 'Settlement time not found';
    }
}

class InitiationTimeNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'InitiationTimeNotFound';
        this.message = message || 'Initiation time not found';
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

    for (const phase of transaction.phases || []) {
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
    throw new SettlementTimeNotFound();   
}

function getBridge(transaction) {
    const result = [];

    if (transaction && transaction.phases) {
        const initiationPhase = transaction.phases.find(phase => phase.name === 'Initiation');

        if (initiationPhase && initiationPhase.rows) {
            const bridge = initiationPhase.rows.find(row => row.label === 'Bridge');

            return bridge.name.toLowerCase();
        }
    }

    throw ApiPhaseNotFound("'Bridge' not found");
}

function getInitiationTimestamp(transaction) {
    for (const row of transaction.rows) {
        if (row.label == "Initiation Timestamp") {
            return parseInt(row.value);
        }
    }
    throw InitiationTimeNotFound();
}

function getUsedArbitraryMessagingBridges(transaction) {
    const result = [];

    if (transaction && transaction.phases) {
        const updatingPayloadPhase = transaction.phases.find(phase => phase.name === 'Updating Payload');

        if (updatingPayloadPhase && updatingPayloadPhase.rows) {
            const destinationMessageStatus = updatingPayloadPhase.rows.find(row => row.label === 'Destination Message Status');
            const destinationProof1Status = updatingPayloadPhase.rows.find(row => row.label === 'Destination Proof 1 Status');

            if (!destinationMessageStatus) {
                ApiPhaseNotFound("Destination Message Status is not found");
            }

            if (!destinationProof1Status) {
                ApiPhaseNotFound("Destination Proof Status is not found");
            }

            return [destinationMessageStatus.name.toLowerCase(), destinationProof1Status.name.toLowerCase()];
        }
    }

    return result;
}

class TxMetadata {
    constructor(tx1 /* returned by /transactions */, tx2 /* object returned by /tx/{hash} */) {
        this.srcChain = tx1.srcChain;
        this.dstChain = tx1.dstChain;
        this.protocol = tx1.protocol;
        this.initiationTimestamp = getInitiationTimestamp(tx2);
        this.settlementTimestamp = getSettlementTimestamp(tx2);
        this.hash = tx2.hash;
        this.type = tx2.type;
        this.bridge = getBridge(tx2);
        this.amb = getUsedArbitraryMessagingBridges(tx2);
    }

    /**
     * @returns true if transaction matches input parameters
     */
    matches(type, protocol, srcChain, dstChain, bridge, amb) {
        if (srcChain != this.srcChain) {
            return false;
        }

        if (dstChain != this.dstChain) {
            return false;
        }
        if (protocol != this.protocol) {
            return false;
        }
        if (type != this.type) {
            return false;
        }
        if (bridge != this.bridge) {
            return false;
        }

        for (const a of amb) {
            if (!this.amb.includes(a)) {
                return false;
            }
        }

        return true;
    }

    getTime() {
        return this.settlementTimestamp - this.initiationTimestamp;
    }
}

module.exports = {
    TxMetadata,
    SettlementTimeNotFound
};