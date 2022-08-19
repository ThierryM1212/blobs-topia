import { getCurrentConfigBox } from './src/blobs_action.js';
import { BLOB_REQUEST_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS, CONFIG_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS, OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS, OATMEAL_RESERVE_SCRIPT, OATMEAL_RESERVE_SCRIPT_ADDRESS, OATMEAL_SELL_RESERVE_SCRIPT, OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS, RESERVE_SCRIPT, RESERVE_SCRIPT_ADDRESS, TX_FEE } from "./src/constants.js";
import { getMempoolUnspentBoxesByAddresses, getUnspentBoxesByAddress } from "./src/explorer.js";
import dayjs from 'dayjs';
import { engageFight, processBlobRequest, processFightResult, processOatmealRequest } from './src/bot_wasm.js';


var mempoolBoxes = {};
async function fetchMempoolUnspentBoxes() {
    let today = dayjs();
    console.log(today.format());
    try {
        const newMempoolBoxes = await getMempoolUnspentBoxesByAddresses(
            [
                BLOB_REQUEST_SCRIPT_ADDRESS,
                RESERVE_SCRIPT_ADDRESS,
                BLOB_SCRIPT_ADDRESS,
                CONFIG_SCRIPT_ADDRESS,
                OATMEAL_RESERVE_SCRIPT_ADDRESS,
                GAME_SCRIPT_ADDRESS,
                OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS,
            ]);
        mempoolBoxes = newMempoolBoxes;
    } catch (e) {
        console.log("fetchMempoolUnspentBoxes error: " + e.toString())
    }

}
setInterval(fetchMempoolUnspentBoxes, 15000);


async function processBlobRequests() {
    try {
        var currentReserveBox = {};
        var processedBlobRequest = [];
        const unspentBlobRequest = await getUnspentBoxesByAddress(BLOB_REQUEST_SCRIPT_ADDRESS);
        const mempoolBlobRequest = mempoolBoxes[BLOB_REQUEST_SCRIPT_ADDRESS];
        const allBlobRequest = unspentBlobRequest.concat(mempoolBlobRequest);
        if (allBlobRequest.length === 0) {
            console.log("processBlobRequests: No BLob request found")
            return;
        }

        const currentConfigBox = await getCurrentConfigBox(mempoolBoxes);
        if (!currentConfigBox.boxId) {
            console.log("processBlobRequests: No config box found")
            return;
        }
        //console.log("processBlobRequests: mempoolBoxes[RESERVE_SCRIPT_ADDRESS]", mempoolBoxes[RESERVE_SCRIPT_ADDRESS])
        if (mempoolBoxes[RESERVE_SCRIPT_ADDRESS] && mempoolBoxes[RESERVE_SCRIPT_ADDRESS].boxId) {
            currentReserveBox = mempoolBoxes[RESERVE_SCRIPT_ADDRESS];
        } else {
            const allReserveBoxes = await getUnspentBoxesByAddress(RESERVE_SCRIPT_ADDRESS);
            if (allReserveBoxes.length === 0) {
                console.log("processBlobRequests: No Reserve box found")
                return;
            }
            currentReserveBox = allReserveBoxes[0];
        }

        for (const box of allBlobRequest) {
            if (!processedBlobRequest.includes(box.boxId)) {
                const [txId, signedTx] = await processBlobRequest(box, currentReserveBox, currentConfigBox);
                if (txId) {
                    processedBlobRequest.push(box.boxId);
                    currentReserveBox = signedTx.outputs.find(box => box.ergoTree === RESERVE_SCRIPT);

                    var txFoundMempool = false, i = 0;
                    while (!txFoundMempool && i < 30) {
                        sleep(2000);
                        try {
                            i++;
                            const newUnspentBoxes = await getMempoolUnspentBoxesByAddresses([RESERVE_SCRIPT_ADDRESS]);
                            //console.log("processBlobRequests newUnspentBoxes", newUnspentBoxes)
                            const newUnspentReserves = newUnspentBoxes[RESERVE_SCRIPT_ADDRESS].find(box => box.boxId === currentReserveBox.boxId);
                            if (newUnspentReserves && newUnspentReserves.length > 0) {
                                txFoundMempool = true;
                                currentReserveBox = newUnspentReserves[0];
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    console.log("processBlobRequests New reserve box: " + currentReserveBox.boxId);
                }
            } else {
                console.log("Blob request " + box.boxId + " already processed")
            }
        }
    } catch (e) {
        console.log("processBlobRequests global: " + e.toString())
    }
}

async function processFigth() {
    try {
        var currentReserveBox = {};
        const unspentBlob = await getUnspentBoxesByAddress(BLOB_SCRIPT_ADDRESS);
        //console.log("unspentBlobRequest", unspentBlobRequest);
        const mempoolBlob = mempoolBoxes[BLOB_SCRIPT_ADDRESS];
        //console.log("mempoolBlobRequest", mempoolBlobRequest);
        const allBlobs = unspentBlob.concat(mempoolBlob);
        if (allBlobs.length === 0) {
            console.log("No BLob in ready to fight found")
            return;
        }

        const currentConfigBox = await getCurrentConfigBox(mempoolBoxes);
        if (!currentConfigBox.boxId) {
            console.log("processBlobRequests: No config box found")
            return;
        }

        var reserveOatmealBoxes = await getUnspentBoxesByAddress(OATMEAL_RESERVE_SCRIPT_ADDRESS);
        if (reserveOatmealBoxes.length === 0) {
            console.log("processFigth: No Reserve box found")
            return;
        }
        currentReserveBox = reserveOatmealBoxes[0];

        var blobsReadyToFight = [];
        for (const blob of allBlobs) {
            if (blob.additionalRegisters.R7.renderedValue === "1") {
                blobsReadyToFight.push(blob);
            }
        }
        console.log("processFigth blobsReadyToFight", blobsReadyToFight.map(box => box.boxId))

        var blobsInFight = [];

        for (const blob1 of blobsReadyToFight) {
            if (!blobsInFight.includes(blob1.boxId)) {
                for (const blob2 of blobsReadyToFight) {
                    if (blob1.boxId !== blob2.boxId && !blobsInFight.includes(blob2.boxId)) {
                        if (blob1.additionalRegisters.R8.renderedValue === blob2.additionalRegisters.R8.renderedValue) {
                            console.log("ENGAGE FIGHT : " + blob1.boxId + " vs " + blob2.boxId)
                            blobsInFight.push(blob1.boxId);
                            blobsInFight.push(blob2.boxId);
                            const signedTx = await engageFight(blob1, blob2, currentReserveBox, currentConfigBox);
                            if (signedTx.outputs) {
                                currentReserveBox = signedTx.outputs.find(box => box.ergoTree === OATMEAL_RESERVE_SCRIPT);

                                var txFoundMempool = false, i = 0;
                                while (!txFoundMempool && i < 30) {
                                    sleep(2000);
                                    try {
                                        i++;
                                        const newUnspentBoxes = await getMempoolUnspentBoxesByAddresses([OATMEAL_RESERVE_SCRIPT_ADDRESS]);
                                        //console.log("newUnspentBoxes", newUnspentBoxes)
                                        const newUnspentReserves = newUnspentBoxes[OATMEAL_RESERVE_SCRIPT_ADDRESS].find(box => box.boxId === currentReserveBox.boxId);
                                        if (newUnspentReserves && newUnspentReserves.length > 0) {
                                            txFoundMempool = true;
                                            currentReserveBox = newUnspentReserves[0];
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                }
                                console.log("New reserve box: " + currentReserveBox.boxId);
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function processFightsResult() {
    try {
        const gameBoxes = await getUnspentBoxesByAddress(GAME_SCRIPT_ADDRESS);
        if (gameBoxes.length === 0) {
            console.log("No Game found")
            return;
        }

        const unspentBlob = await getUnspentBoxesByAddress(BLOB_SCRIPT_ADDRESS);
        //console.log("unspentBlobRequest", unspentBlobRequest);
        const mempoolBlobs = mempoolBoxes[BLOB_SCRIPT_ADDRESS];
        //console.log("mempoolBlobRequest", mempoolBlobRequest);
        const allBlobs = unspentBlob.concat(mempoolBlobs);
        var blobsFighting = [];
        for (const blob of allBlobs) {
            if (blob.additionalRegisters.R7.renderedValue === "3") {
                blobsFighting.push(blob);
            }
        }
        if (blobsFighting.length === 0) {
            console.log("No BLob fighting found")
            return;
        }

        const currentConfigBox = await getCurrentConfigBox(mempoolBoxes);
        if (!currentConfigBox.boxId) {
            console.log("processBlobRequests: No config box found")
            return;
        }

        for (const gameBox of gameBoxes) {
            //console.log("gameBox", gameBox)
            const gameAmount = (parseInt(gameBox.value) + TX_FEE) / 2;
            var blob1 = undefined, blob2 = undefined;
            for (const blob of blobsFighting) {
                if (blob.additionalRegisters.R6.serializedValue === gameBox.additionalRegisters.R4.serializedValue &&
                    blob.additionalRegisters.R9.serializedValue === gameBox.additionalRegisters.R5.serializedValue &&
                    blob.additionalRegisters.R5.serializedValue === gameBox.additionalRegisters.R6.serializedValue &&
                    blob.additionalRegisters.R8.renderedValue === gameAmount.toString()
                ) {
                    blob1 = blob;
                }
                if (blob.additionalRegisters.R6.serializedValue === gameBox.additionalRegisters.R7.serializedValue &&
                    blob.additionalRegisters.R9.serializedValue === gameBox.additionalRegisters.R8.serializedValue &&
                    blob.additionalRegisters.R5.serializedValue === gameBox.additionalRegisters.R9.serializedValue &&
                    blob.additionalRegisters.R8.renderedValue === gameAmount.toString()
                ) {
                    blob2 = blob;
                }
            }
            await processFightResult(blob1, blob2, gameBox, currentConfigBox);
        }
    } catch (e) {
        console.log(e.toString())
    }
}

async function processOatmealBuyRequests() {
    try {
        var currentReserveBox = {};
        var processedOatmealBuyRequest = [];
        const unspentOatmealBuyRequest = await getUnspentBoxesByAddress(OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS);
        const mempoolOatmealBuyRequest = mempoolBoxes[OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS];
        const allOatmealBuyRequest = unspentOatmealBuyRequest.concat(mempoolOatmealBuyRequest);
        if (allOatmealBuyRequest.length === 0) {
            console.log("processOatmealBuyRequests: No Oatmeal buy request found")
            return;
        }

        const currentConfigBox = await getCurrentConfigBox(mempoolBoxes);
        if (!currentConfigBox.boxId) {
            console.log("processOatmealBuyRequests: No config box found")
            return;
        }

        if (mempoolBoxes[OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS] && mempoolBoxes[OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS].boxId) {
            currentReserveBox = mempoolBoxes[OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS];
        } else {
            const allReserveBoxes = await getUnspentBoxesByAddress(OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS);
            if (allReserveBoxes.length === 0) {
                console.log("processOatmealBuyRequests: No Reserve box found")
                return;
            }
            currentReserveBox = allReserveBoxes[0];
        }

        for (const box of allOatmealBuyRequest) {
            if (!processedOatmealBuyRequest.includes(box.boxId)) {
                const [txId, signedTx] = await processOatmealRequest(box, currentReserveBox, currentConfigBox);
                if (txId) {
                    processedOatmealBuyRequest.push(box.boxId);
                    currentReserveBox = signedTx.outputs.find(box => box.ergoTree === OATMEAL_SELL_RESERVE_SCRIPT);

                    var txFoundMempool = false, i = 0;
                    while (!txFoundMempool && i < 30) {
                        sleep(2000);
                        try {
                            i++;
                            const newUnspentBoxes = await getMempoolUnspentBoxesByAddresses([OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS]);
                            //console.log("processBlobRequests newUnspentBoxes", newUnspentBoxes)
                            const newUnspentReserves = newUnspentBoxes[OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS].find(box => box.boxId === currentReserveBox.boxId);
                            if (newUnspentReserves && newUnspentReserves.length > 0) {
                                txFoundMempool = true;
                                currentReserveBox = newUnspentReserves[0];
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    console.log("processOatmealBuyRequests New reserve box: " + currentReserveBox.boxId);
                }
            } else {
                console.log("Oatmeal request " + box.boxId + " already processed")
            }
        }
    } catch (e) {
        console.log("processOatmealBuyRequests global: " + e.toString())
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


setInterval(processBlobRequests, 24000);
setInterval(processFigth, 30000);
setInterval(processFightsResult, 20000);
setInterval(processOatmealBuyRequests, 26000);
