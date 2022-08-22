import { CONFIG_TOKEN_ID } from "./constants.js";
import { CONFIG_SCRIPT_ADDRESS } from './script_constants.js';

import { boxByTokenId } from "./explorer.js";


export async function getCurrentConfigBox(mempoolBoxes) {
    if (mempoolBoxes[CONFIG_SCRIPT_ADDRESS].boxId) {
        return mempoolBoxes[CONFIG_SCRIPT_ADDRESS];
    }
    const allConfigBoxes = (await boxByTokenId(CONFIG_TOKEN_ID));
    if (allConfigBoxes.length === 0) {
        return undefined;
    }
    return allConfigBoxes[0];
}

