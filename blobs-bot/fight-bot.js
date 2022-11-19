import * as dotenv from 'dotenv';
import { setBlobStatus } from './src/blobs_action.js';
import { getBalance, getUnspentBoxesForAddressUpdated, searchUnspentBoxesUpdated } from './src/explorer.js';
import { BLOBINATOR_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS } from './src/script_constants.js';
import { sleep } from './src/utils.js';
import dayjs from 'dayjs';
import { BLOBINATOR_DEFI_TOK_NUM, NANOERG_TO_ERG, SPICY_OATMEAL_TOKEN_ID } from './src/constants.js';
dotenv.config()

//console.log(process.env.MNEMONIC); 
const USER_MNEMONIC = process.env.MNEMONIC;
const USER_ADDRESS = process.env.ADDRESS;
const USER_BLOB_ID = JSON.parse(process.env.BLOB_LIST);
const USER_FIGHT_MIN_AMOUNT = Math.round(parseFloat(process.env.MIN_FIGHT_AMOUNT) * NANOERG_TO_ERG)
const USER_FIGHT_MAX_AMOUNT = Math.round(parseFloat(process.env.MAX_FIGHT_AMOUNT) * NANOERG_TO_ERG)
const ENGAGE_BLOBINATOR = (process.env.ENGAGE_BLOBINATOR.toUpperCase() === "TRUE")
console.log("Address:", USER_ADDRESS);
console.log("Blob IDs:", USER_BLOB_ID);

async function engageBlobFights() {
    try {
        var action = 'fight';
        if (ENGAGE_BLOBINATOR) {
            // Search if we have Spicy Oatmeal for the Blobinator fight
            const spicyOatmealBalance = await getBalance(USER_ADDRESS, SPICY_OATMEAL_TOKEN_ID);
            console.log("Spicy Oatmeal Balance: ", spicyOatmealBalance);
            if (spicyOatmealBalance && spicyOatmealBalance >= BLOBINATOR_DEFI_TOK_NUM) {
                // Search if Blobinators are available
                const bloninators = await getUnspentBoxesForAddressUpdated(BLOBINATOR_SCRIPT_ADDRESS);
                if (bloninators && bloninators.length > 0) {
                    console.log(bloninators.length + " Blobinators available")
                    action = 'blobinator';
                }
            }
        }

        for (const blobId of USER_BLOB_ID) {
            const blob = await searchUnspentBoxesUpdated(BLOB_SCRIPT_ADDRESS, [], { "R9": blobId.toString() });
            if (blob.length > 0) {
                if (blob[0].additionalRegisters.R7.renderedValue === "0") {
                    var fightAmount = USER_FIGHT_MIN_AMOUNT;
                    if (action === "fight") {
                        const blobsReadyToFight = (await searchUnspentBoxesUpdated(BLOB_SCRIPT_ADDRESS, [], { "R7": "1" }))
                            .filter(box => !USER_BLOB_ID.includes(box.additionalRegisters.R9.renderedValue));
                        if (blobsReadyToFight && blobsReadyToFight.length > 0) {
                            for (const box of blobsReadyToFight) {
                                const blobFigthAmount = parseInt(box.additionalRegisters.R8.renderedValue);
                                if (blobFigthAmount >= USER_FIGHT_MIN_AMOUNT && blobFigthAmount <= USER_FIGHT_MAX_AMOUNT) {
                                    fightAmount = blobFigthAmount;
                                    break;
                                }
                            }
                        }
                    }
                    console.log("engageBlob blobId", action, blobId);
                    const txId = await setBlobStatus(action, blob[0], fightAmount, USER_MNEMONIC, USER_ADDRESS);
                    console.log("engageBlobFights txId", action, txId)
                    await sleep(10000)
                }
            } else {
                console.log("engageBlobFights BlobId ", blobId, " not found ready")
            }
        }
        let today = dayjs();
        console.log("engageBlobFights Done ", today.format())
    } catch (e) {
        console.log("engageBlobFights global", e.toString());
    }

}

setInterval(engageBlobFights, 30000);
