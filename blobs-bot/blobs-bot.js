import { getCurrentConfigBox, getCurrentConfigBox2 } from './src/blobs_action.js';
import { BLOBINATOR_TOKEN_ID, GAME_TOKEN_ID, TX_FEE } from "./src/constants.js";
import {
    BLOB_REQUEST_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS, CONFIG_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS, OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS,
    OATMEAL_RESERVE_SCRIPT, OATMEAL_RESERVE_SCRIPT_ADDRESS, OATMEAL_SELL_RESERVE_SCRIPT, OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS, RESERVE_SCRIPT,
    RESERVE_SCRIPT_ADDRESS, BLOBINATOR_FEE_SCRIPT_ADDRESS, BLOBINATOR_RESERVE_SCRIPT_ADDRESS, BLOBINATOR_SCRIPT_ADDRESS
} from "./src/script_constants.js";
import { getMempoolUnspentBoxesByAddresses, getUnspentBoxesByAddress, searchUnspentBoxes, searchUnspentBoxesUpdated } from "./src/explorer.js";
import dayjs from 'dayjs';
import { blobinatorFightResults, engageBlobinatorFight, engageFight, processBlobinatorFee, processBlobRequest, processFightResult, processOatmealRequest } from './src/bot_wasm.js';
import { shuffleArray, sleep } from './src/utils.js';


var mempoolBoxes = {};
var currentConfigBox = await getCurrentConfigBox2();
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
                BLOBINATOR_RESERVE_SCRIPT_ADDRESS,
                BLOBINATOR_SCRIPT_ADDRESS,
                BLOBINATOR_FEE_SCRIPT_ADDRESS,
            ]);
        mempoolBoxes = {...newMempoolBoxes};
    } catch (e) {
        console.log("fetchMempoolUnspentBoxes error: " + e.toString())
    }
    currentConfigBox = await getCurrentConfigBox2();
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
        const gameBoxes = await getUnspentBoxesByAddress(GAME_SCRIPT_ADDRESS); // process only confirmed fights
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

async function processBlobinatorFees() {
    try {
        var currentReserveBox = {};
        const unspentBlobinatorFees = await getUnspentBoxesByAddress(BLOBINATOR_FEE_SCRIPT_ADDRESS);
        if (unspentBlobinatorFees.length === 0) {
            console.log("processBlobinatorFees: No Blobinator fee box found")
            return;
        }
        const currentConfigBox = await getCurrentConfigBox(mempoolBoxes);
        if (currentConfigBox && !currentConfigBox.boxId) {
            console.log("processBlobinatorFees: No config box found")
            return;
        }

        if (mempoolBoxes[BLOBINATOR_RESERVE_SCRIPT_ADDRESS] && mempoolBoxes[BLOBINATOR_RESERVE_SCRIPT_ADDRESS].length > 0) {
            currentReserveBox = mempoolBoxes[BLOBINATOR_RESERVE_SCRIPT_ADDRESS][0];
        } else {
            const allReserveBoxes = await getUnspentBoxesByAddress(BLOBINATOR_RESERVE_SCRIPT_ADDRESS);
            if (allReserveBoxes.length === 0) {
                console.log("processBlobinatorFees: No Reserve box found")
                return;
            }
            currentReserveBox = allReserveBoxes[0];
        }
        const txId = await processBlobinatorFee(unspentBlobinatorFees, currentReserveBox, currentConfigBox);
        if (txId) {
            console.log("processBlobinatorFees txId", txId);
        }
    } catch (e) {
        console.log("processBlobinatorFees global: " + e.toString())
    }
}

async function processEngageBlobinatorFigth() {
    try {
        const unspentBlobinators = (shuffleArray(await searchUnspentBoxesUpdated(BLOBINATOR_SCRIPT_ADDRESS, [], { "R9": '0' })))
            .filter(box => box.address === BLOBINATOR_SCRIPT_ADDRESS);
        //const unspentBlobinators = shuffleArray(await getUnspentBoxesByAddress(BLOBINATOR_SCRIPT_ADDRESS));
        if (unspentBlobinators.length === 0) {
            console.log("processEngageBlobinatorFigth: No Blobinator box found")
            return;
        }
        if (currentConfigBox && !currentConfigBox.boxId) {
            console.log("processEngageBlobinatorFigth: No config box found")
            return;
        }
        const blobsReadyToFight = shuffleArray(await searchUnspentBoxesUpdated(BLOB_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { "R7": "4" }));
        if (blobsReadyToFight.length == 0) {
            console.log("processEngageBlobinatorFigth: No blob waiting for Blobinator")
            return;
        }
        for (let i = 0; i < Math.min(unspentBlobinators.length, blobsReadyToFight.length); i++) {
            var txId = await engageBlobinatorFight(blobsReadyToFight[i], unspentBlobinators[i], currentConfigBox);
            console.log("processEngageBlobinatorFigth txId", txId);
        }
    } catch (e) {
        console.log("processEngageBlobinatorFigth global: " + e.toString())
    }
}

async function processBlobinatorFigthResults() {
    try {
        const blobsEngagedFight = shuffleArray(await searchUnspentBoxes(BLOB_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { "R7": "5" }));
        if (blobsEngagedFight.length == 0) {
            console.log("processBlobinatorFigthResults: No blob engaged fight with Blobinator")
            return;
        }

        const unspentBlobinators = (await searchUnspentBoxes(BLOBINATOR_SCRIPT_ADDRESS, [BLOBINATOR_TOKEN_ID], {}))
            .filter(box => box.address === BLOBINATOR_SCRIPT_ADDRESS)
            .filter(box => box.additionalRegisters.R9.renderedValue !== "0");

        //console.log("unspentBlobinators", JSON.stringify(unspentBlobinators));
        //return;
        if (unspentBlobinators.length === 0) {
            console.log("processBlobinatorFigthResults: No Blobinator box found")
            return;
        }
        if (currentConfigBox && !currentConfigBox.boxId) {
            console.log("processBlobinatorFigthResults: No config box found")
            return;
        }

        for (const blob of blobsEngagedFight) {
            const blobId = blob.additionalRegisters.R9.renderedValue;
            const blobBinator = unspentBlobinators.find(box => box.additionalRegisters.R9.renderedValue === blobId)
            if (blobBinator) {
                var txId = await blobinatorFightResults(blob, blobBinator, currentConfigBox);
                console.log("processBlobinatorFigthResults txId", txId);
            }
        }
    } catch (e) {
        console.log("processBlobinatorFigthResults global: " + e.toString())
    }
}


setInterval(processBlobRequests, 24000);
setInterval(processFigth, 30000);
setInterval(processFightsResult, 20000);
setInterval(processOatmealBuyRequests, 26000);
setInterval(processBlobinatorFees, 60000);
setInterval(processEngageBlobinatorFigth, 21000);
setInterval(processBlobinatorFigthResults, 22000);
