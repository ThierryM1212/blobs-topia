import { MAX_POWER_DIFF, NANOERG_TO_ERG } from "./constants";
import { BLOB_ARMORS, BLOB_WEAPONS } from '../utils/items_constants';
import JSONBigInt from 'json-bigint';

export function formatLongString(str, num) {
    if (typeof str !== 'string') return str;
    if (str.length > 2 * num) {
        return str.substring(0, num) + "..." + str.substring(str.length - num, str.length);
    } else {
        return str;
    }
}

export function formatERGAmount(amountStr) {
    return parseFloat(parseInt(amountStr) / NANOERG_TO_ERG).toFixed(4);
}

export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * (max));
}

export function getBlobPowers(blobInfoStr) {
    const blobInfo = JSONBigInt.parse(blobInfoStr);
    const attPower = 6 * getBlobAttLevel(blobInfo)
        + 2 * getBlobGames(blobInfo)
        + 4 * getBlobVictories(blobInfo)
        + getBlobArmorAttPower(blobInfo)
        + getBlobWeaponAttPower(blobInfo);
    const defPower = 5 * getBlobDefLevel(blobInfo)
        + 5 * getBlobGames(blobInfo)
        + getBlobArmorDefPower(blobInfo)
        + getBlobWeaponDefPower(blobInfo);
    return [attPower, defPower];
}
export function getBlobAttLevel(blobInfo) {
    return blobInfo[0];
}
export function getBlobDefLevel(blobInfo) {
    return blobInfo[1];
}
export function getBlobGames(blobInfo) {
    return blobInfo[2];
}
export function getBlobVictories(blobInfo) {
    //console.log("getBlobVictories",blobInfo[3]);
    return blobInfo[3];
}
export function getBlobArmorDefPower(blobInfo) {
    return BLOB_ARMORS[blobInfo[4]].defense_power;
}
export function getBlobArmorAttPower(blobInfo) {
    return BLOB_ARMORS[blobInfo[4]].attack_power;
}
export function getBlobWeaponDefPower(blobInfo) {
    return BLOB_WEAPONS.find(weapon => weapon.lvl === blobInfo[6] && weapon.type === blobInfo[5]).defense_power
}
export function getBlobWeaponAttPower(blobInfo) {
    return BLOB_WEAPONS.find(weapon => weapon.lvl === blobInfo[6] && weapon.type === blobInfo[5]).attack_power
}

export function chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        const myChunk = myArray.slice(index, index + chunk_size);
        tempArray.push(myChunk);
    }

    return tempArray;
}

export function computeP1WinningChance(blob1, blob2) {
    const maxPowerDiff = MAX_POWER_DIFF;
    const numberOfRound = 1000000;

    const [p1Power, p1Def] = getBlobPowers(blob1.additionalRegisters.R5.renderedValue);
    const [p2Power, p2Def] = getBlobPowers(blob2.additionalRegisters.R5.renderedValue);

    const p1PowerAdj = Math.min(p2Power + maxPowerDiff, p1Power);
    const p2PowerAdj = Math.min(p1Power + maxPowerDiff, p2Power);
    const p1DefAdj = Math.min(p2Def + maxPowerDiff, p1Def);
    const p2DefAdj = Math.min(p1Def + maxPowerDiff, p2Def);
    var p1Win = 0;

    for (let i = 0; i < numberOfRound; i++) {
        const p1Rand = getRandomInt(32767);
        const p1Score = Math.max(p1Rand, p1DefAdj) + p1PowerAdj;
        const p2Rand = getRandomInt(32767);
        const p2Score = Math.max(p2Rand, p2DefAdj) + p2PowerAdj;
        if (p1Score > p2Score) {
            p1Win = p1Win + 1;
        }
    }
    return p1Win / numberOfRound;
}

export function filterBlobList(blobList) {
    var blobsById = {};
    for (const blob of blobList) {
        const blobId = blob.additionalRegisters.R9.renderedValue;
        if (!blobsById[blobId]) {
            blobsById[blobId] = blob;
        } else {
            if (blob.globalIndex > blobsById[blobId].globalIndex) {
                blobsById[blobId] = blob;
            }
        }
    }
    return Object.values(blobsById);
}


//export function isP1Win(blob1,blob2,blockId) {
//    const maxPowerDiff = 6000;
//    const p1Info = JSONBigInt.parse(blob1.additionalRegisters.R5.renderedValue);
//    const p2Info = JSONBigInt.parse(blob2.additionalRegisters.R5.renderedValue);
//    const p1Power = 10*p1Info[0]+5*p1Info[1]+4*p1Info[2]+8*p1Info[3];
//    const p2Power = 10*p2Info[0]+5*p2Info[1]+4*p2Info[2]+8*p2Info[3];
//    const p1Def = 10*p1Info[0] + 10*p1Info[2];
//    const p2Def = 10*p2Info[0] + 10*p2Info[2];
//    const p1PowerAdj = Math.min(p2Power + maxPowerDiff, p1Power);
//    const p2PowerAdj = Math.min(p1Power + maxPowerDiff, p2Power);
//    const p1DefAdj = Math.min(p2Def + maxPowerDiff, p1Def);
//    const p2DefAdj = Math.min(p1Def + maxPowerDiff, p2Def);
//    console.log("blockId", blockId, blockId.slice(1,3), parseInt(blockId.slice(1,3), 16), blockId.slice(3,5), parseInt(blockId.slice(3,5), 16));
//    console.log("blockId2", blockId, blockId.slice(1,5), parseInt(blockId.slice(1,5), 16), blockId.slice(5,9), parseInt(blockId.slice(5,9), 16));
//
//    const p1Rand = parseInt(blockId.slice(1,5), 16);
//    const p1Score = Math.max(p1Rand, p1DefAdj) + p1PowerAdj;
//    const p2Rand = parseInt(blockId.slice(5,9), 16);
//    const p2Score = Math.max(p2Rand, p2DefAdj) + p2PowerAdj;
//    if (p1Score > p2Score) {
//        console.log("P1 WIN !!");
//    } else {
//        console.log("P2 WIN !!");
//    }
//    return (p1Score > p2Score);
//}


export function promiseTimeout(ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Timed out in ' + ms + 'ms.')
        }, ms)
    })
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ])
}
