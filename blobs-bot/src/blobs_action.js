import { CONFIG_TOKEN_ID } from "./constants.js";
import { CONFIG_SCRIPT_ADDRESS } from './script_constants.js';

import { boxByTokenId, getSpentAndUnspentBoxesFromMempool } from "./explorer.js";


export async function getCurrentConfigBox(mempoolBoxes) {
    if (mempoolBoxes[CONFIG_SCRIPT_ADDRESS] && mempoolBoxes[CONFIG_SCRIPT_ADDRESS].length > 0) {
        return mempoolBoxes[CONFIG_SCRIPT_ADDRESS][0];
    }
    const allConfigBoxes = (await boxByTokenId(CONFIG_TOKEN_ID));
    if (allConfigBoxes.length === 0) {
        return undefined;
    }
    return allConfigBoxes[0];
}

export async function getCurrentConfigBox2() {
    const allConfigBoxes = (await boxByTokenId(CONFIG_TOKEN_ID));
    const [spentConfig, newConfig] = await getSpentAndUnspentBoxesFromMempool(CONFIG_SCRIPT_ADDRESS);
    const spentConfigBoxIds = spentConfig.map(box => box.boxId);
    const updatedConfigBoxes = newConfig.concat(allConfigBoxes).filter(box => !spentConfigBoxIds.includes(box.boxId));
    if (updatedConfigBoxes.length === 0) {
        return undefined;
    }
    return updatedConfigBoxes[0];
}