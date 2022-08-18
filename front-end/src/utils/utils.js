import { MAX_POWER_DIFF, NANOERG_TO_ERG } from "./constants";
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

function getRandomInt(max) {
    return Math.floor(Math.random() * (max));
}

export function getBlobPowers(blobInfoStr) {
    const attPower = 6 * getBlobAttLevel(blobInfoStr) + 3 * getBlobDefLevel(blobInfoStr) + 2 * getBlobVictories(blobInfoStr) + 4 * getBlobGames(blobInfoStr);
    const defPower = 5 * getBlobDefLevel(blobInfoStr) + 5 * getBlobGames(blobInfoStr);
    return [attPower, defPower];
}
export function getBlobAttLevel(blobInfoStr) {
    const blobInfo = JSONBigInt.parse(blobInfoStr);
    return blobInfo[0];
}
export function getBlobDefLevel(blobInfoStr) {
    const blobInfo = JSONBigInt.parse(blobInfoStr);
    return blobInfo[1];
}
export function getBlobGames(blobInfoStr) {
    const blobInfo = JSONBigInt.parse(blobInfoStr);
    return blobInfo[2];
}
export function getBlobVictories(blobInfoStr) {
    const blobInfo = JSONBigInt.parse(blobInfoStr);
    return blobInfo[3];
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
