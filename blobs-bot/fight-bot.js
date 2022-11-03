import * as dotenv from 'dotenv';
import { setBlobStatus } from './src/blobs_action.js';
import { searchUnspentBoxesUpdated } from './src/explorer.js';
import { BLOBINATOR_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS } from './src/script_constants.js';
import { sleep } from './src/utils.js';
import dayjs from 'dayjs';
dotenv.config()

//console.log(process.env.MNEMONIC); 
const USER_MNEMONIC = process.env.MNEMONIC;
const USER_ADDRESS = process.env.ADDRESS;
const USER_BLOB_ID = JSON.parse(process.env.BLOB_LIST);
const USER_FIGHT_AMOUNT_FLOAT = parseFloat(process.env.FIGHT_AMOUNT)
console.log(USER_ADDRESS, USER_BLOB_ID);

async function engageBlobFights() {
    try {
        for (const blobId of USER_BLOB_ID) {
            const blob = await searchUnspentBoxesUpdated(BLOB_SCRIPT_ADDRESS, [], 'R9', blobId.toString());
            if (blob.length > 0) {
                if (blob[0].additionalRegisters.R7.renderedValue === "0") {
                    console.log("engageBlobFights blobId", blobId);
                    const txId = await setBlobStatus('fight', blob[0], USER_FIGHT_AMOUNT_FLOAT, USER_MNEMONIC, USER_ADDRESS);
                    console.log("engageBlobFights txId", txId)
                    await sleep(10000)
                }
            } else {
                console.log("engageBlobFights BlobId ", blobId, " not found ready")
            }
        }
        let today = dayjs();
        console.log("engageBlobFights Done ", today.format())
    } catch (e) {
        console.log(e);
    }

}

setInterval(engageBlobFights, 30000);
