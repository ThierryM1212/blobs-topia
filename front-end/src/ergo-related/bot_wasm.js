import JSONBigInt from 'json-bigint';
import { BLOB_MINT_FEE, GAME_ADDRESS, GAME_TOKEN_ID, MIN_NANOERG_BOX_VALUE, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, OATMEAL_PRICE, OATMEAL_TOKEN_ID, TX_FEE } from '../utils/constants.js';
import { BLOB_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS, OATMEAL_RESERVE_SCRIPT_ADDRESS, OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS, RESERVE_SCRIPT_ADDRESS } from "../utils/script_constants";
import { currentHeight, sendTx } from './explorer.js';
import { encodeIntArray, encodeLong, ergoTreeToAddress } from './serializer.js';
import { createTransaction, signTransaction, signTransactionMultiContext } from './wasm.js';
let ergolib = import('ergo-lib-wasm-browser');



export async function processBlobRequest(blobRequestJSON, currentReserveBox, currentConfigBox) {
    try {
        const wallet = (await ergolib).Wallet.from_mnemonic("", "");
        const creationHeight = await currentHeight();
        const reserveIniWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(currentReserveBox));
        const reserveIniTokenAmount = reserveIniWASM.tokens().get(0).amount().as_i64().as_num();
        const newReserveTokenAmount = reserveIniTokenAmount - 2;
        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
        const inputs = [blobRequestJSON, currentReserveBox];
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const boxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blobRequestJSON));

        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        // MINT BLOB BOX
        const blobAmountNano = blobRequestJSON.value - BLOB_MINT_FEE - TX_FEE;
        const blobboxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobAmountNano.toString()));
        const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            blobboxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
            creationHeight);
        blobBoxBuilder.set_register_value(4, boxWASM.register_value(4))
        blobBoxBuilder.set_register_value(5, reserveIniWASM.register_value(5))
        blobBoxBuilder.set_register_value(6, boxWASM.register_value(5))
        blobBoxBuilder.set_register_value(7, (await encodeLong('0')))
        blobBoxBuilder.set_register_value(8, (await encodeLong('0')))
        blobBoxBuilder.set_register_value(9, reserveIniWASM.register_value(7))
        blobBoxBuilder.add_token(gameTokenId, blobTokenAmount);
        try {
            outputCandidates.add(blobBoxBuilder.build());
        } catch (e) {
            console.log(`processBlobRequests building error: ${e}`);
            throw e;
        }

        // NEW RESERVE BOX
        const newReserveTokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(newReserveTokenAmount.toString()));
        const reserveValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
        const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            reserveValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(RESERVE_SCRIPT_ADDRESS)),
            creationHeight);
        reserveBoxBuilder.set_register_value(4, reserveIniWASM.register_value(4));
        reserveBoxBuilder.set_register_value(5, reserveIniWASM.register_value(5));
        reserveBoxBuilder.set_register_value(6, reserveIniWASM.register_value(6));
        const nextIdentifier = parseInt(reserveIniWASM.register_value(7).to_i64().to_str()) + 1;
        reserveBoxBuilder.set_register_value(7, (await encodeLong(nextIdentifier.toString())));
        reserveBoxBuilder.add_token(gameTokenId, newReserveTokenAmountWASM);
        try {
            outputCandidates.add(reserveBoxBuilder.build());
        } catch (e) {
            console.log(`processBlobRequests building error: ${e}`);
            throw e;
        }

        // DAPP MINT FEE
        const mintFeeValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(BLOB_MINT_FEE.toString()));
        const mintFeeBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            mintFeeValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(GAME_ADDRESS)),
            creationHeight);
        try {
            outputCandidates.add(mintFeeBoxBuilder.build());
        } catch (e) {
            console.log(`processBlobRequests building error: ${e}`);
            throw e;
        }

        const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], GAME_ADDRESS, inputs);
        //console.log("processBlobRequests signedTx", JSONBigInt.stringify(tx));
        const signedTx = JSONBigInt.parse(await signTransaction(tx, inputs, [currentConfigBox], wallet));
        //console.log("processBlobRequests signedTx", signedTx);
        const txId = await sendTx(signedTx);
        console.log("processBlobRequests txId", txId);
        return txId;


    } catch (e) {
        console.log(e);
    }
}

export async function engageFight(blob1, blob2, currentReserveBox, currentConfigBox) {
    console.log("engageFight ", blob1, blob2, currentReserveBox, currentConfigBox);
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    const reserveIniWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(currentReserveBox));
    const reserveIniTokenAmount = reserveIniWASM.tokens().get(0).amount().as_i64().as_num();
    const newReserveTokenAmount = reserveIniTokenAmount - NUM_OATMEAL_TOKEN_LOSER - NUM_OATMEAL_TOKEN_WINNER;

    const fightAmount = parseInt(blob1.additionalRegisters.R8.renderedValue)
    const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
    const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));

    const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
    // BLOB1 BOX
    const blob1BoxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blob1));

    const blob1AmountNano = blob1.value - fightAmount;
    const blob1boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blob1AmountNano.toString()));
    const blob1BoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        blob1boxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
        creationHeight);
    blob1BoxBuilder.set_register_value(4, blob1BoxWASM.register_value(4))
    blob1BoxBuilder.set_register_value(5, blob1BoxWASM.register_value(5))
    blob1BoxBuilder.set_register_value(6, blob1BoxWASM.register_value(6))
    blob1BoxBuilder.set_register_value(7, (await encodeLong('3')))
    blob1BoxBuilder.set_register_value(8, blob1BoxWASM.register_value(8))
    blob1BoxBuilder.set_register_value(9, blob1BoxWASM.register_value(9))
    blob1BoxBuilder.add_token(gameTokenId, blobTokenAmount);
    try {
        outputCandidates.add(blob1BoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    // BLOB2 BOX
    const blob2BoxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blob2));
    const blob2AmountNano = blob2.value - fightAmount;
    const blob2boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blob2AmountNano.toString()));
    const blob2BoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        blob2boxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
        creationHeight);
    blob2BoxBuilder.set_register_value(4, blob2BoxWASM.register_value(4))
    blob2BoxBuilder.set_register_value(5, blob2BoxWASM.register_value(5))
    blob2BoxBuilder.set_register_value(6, blob2BoxWASM.register_value(6))
    blob2BoxBuilder.set_register_value(7, (await encodeLong('3')))
    blob2BoxBuilder.set_register_value(8, blob2BoxWASM.register_value(8))
    blob2BoxBuilder.set_register_value(9, blob2BoxWASM.register_value(9))
    blob2BoxBuilder.add_token(gameTokenId, blobTokenAmount);
    try {
        outputCandidates.add(blob2BoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    // GAME BOX
    const gameAmountNano = 2 * fightAmount - TX_FEE;
    const gameBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(gameAmountNano.toString()));
    const gameTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
    const gameBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        gameBoxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(GAME_SCRIPT_ADDRESS)),
        creationHeight);
    gameBoxBuilder.set_register_value(4, blob1BoxWASM.register_value(6))
    gameBoxBuilder.set_register_value(5, blob1BoxWASM.register_value(9))
    gameBoxBuilder.set_register_value(6, blob1BoxWASM.register_value(5))
    gameBoxBuilder.set_register_value(7, blob2BoxWASM.register_value(6))
    gameBoxBuilder.set_register_value(8, blob2BoxWASM.register_value(9))
    gameBoxBuilder.set_register_value(9, blob2BoxWASM.register_value(5))
    gameBoxBuilder.add_token(gameTokenId, gameTokenAmount);
    const oatmealTokenId = (await ergolib).TokenId.from_str(OATMEAL_TOKEN_ID);
    const oatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((NUM_OATMEAL_TOKEN_LOSER + NUM_OATMEAL_TOKEN_WINNER).toString()));
    gameBoxBuilder.add_token(oatmealTokenId, oatmealTokenAmount);
    try {
        outputCandidates.add(gameBoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    // OATMEAL RESERVE BOX
    const newReserveTokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(newReserveTokenAmount.toString()));
    const reserveValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
    const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        reserveValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(OATMEAL_RESERVE_SCRIPT_ADDRESS)),
        creationHeight);
    reserveBoxBuilder.add_token(oatmealTokenId, newReserveTokenAmountWASM);
    try {
        outputCandidates.add(reserveBoxBuilder.build());
    } catch (e) {
        console.log(`processBlobRequests building error: ${e}`);
        throw e;
    }

    // prepate tx inputs
    var inputs = [blob1, blob2, currentReserveBox];
    const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
    const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

    const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], GAME_ADDRESS, inputs);
    //console.log("tx", JSONBigInt.stringify(tx) );
    const signedTx = JSONBigInt.parse(await signTransaction(tx, inputs, [currentConfigBox], wallet));
    //console.log("signedTx", signedTx);
    const txId = await sendTx(signedTx);
    console.log("txId", txId);
    return signedTx;
}

export async function processFightResult(blob1, blob2, gameBox, currentConfigBox) {
    console.log("FIGHT RESULT : " + blob1.boxId + " vs " + blob2.boxId)
    const gameAmount = parseInt(blob1.additionalRegisters.R8.renderedValue);
    console.log("gameAmount: ", gameBox, gameAmount);
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
    const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
    var winningTx = [];
    for (let i = 0; i < 2; i++) {
        try {
            var blob1AmountNano = blob1.value;
            var blob2AmountNano = blob2.value;
            var p1InfoArray = JSON.parse(gameBox.additionalRegisters.R6.renderedValue)
            var p2InfoArray = JSON.parse(gameBox.additionalRegisters.R9.renderedValue)
            var p1OatmealAmount = undefined;
            var p2OatmealAmount = undefined;

            // increase victory
            if (i === 0) {
                console.log("P1 win");
                blob1AmountNano = blob1.value + 2 * gameAmount - 2 * TX_FEE - 2 * MIN_NANOERG_BOX_VALUE;
                p1InfoArray[3] = p1InfoArray[3] + 1;
                p1OatmealAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((NUM_OATMEAL_TOKEN_WINNER).toString()));
                p2OatmealAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((NUM_OATMEAL_TOKEN_LOSER).toString()));
            } else if (i === 1) {
                console.log("P2 win");
                blob2AmountNano = blob2.value + 2 * gameAmount - 2 * TX_FEE - 2 * MIN_NANOERG_BOX_VALUE;
                p2InfoArray[3] = p2InfoArray[3] + 1;
                p1OatmealAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((NUM_OATMEAL_TOKEN_LOSER).toString()));
                p2OatmealAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((NUM_OATMEAL_TOKEN_WINNER).toString()));
            }
            p1InfoArray[2] = p1InfoArray[2] + 1;
            p2InfoArray[2] = p2InfoArray[2] + 1;

            const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
            // BLOB1 BOX
            const blob1BoxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blob1));

            //const 
            const blob1boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blob1AmountNano.toString()));
            const blob1BoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                blob1boxValue,
                (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
                creationHeight);
            blob1BoxBuilder.set_register_value(4, blob1BoxWASM.register_value(4))
            blob1BoxBuilder.set_register_value(5, await encodeIntArray(p1InfoArray))
            blob1BoxBuilder.set_register_value(6, blob1BoxWASM.register_value(6))
            blob1BoxBuilder.set_register_value(7, (await encodeLong('0')))
            blob1BoxBuilder.set_register_value(8, (await encodeLong('0')))
            blob1BoxBuilder.set_register_value(9, blob1BoxWASM.register_value(9))
            blob1BoxBuilder.add_token(gameTokenId, blobTokenAmount);
            try {
                outputCandidates.add(blob1BoxBuilder.build());
            } catch (e) {
                console.log(`building error: ${e}`);
                throw e;
            }

            // BLOB2 BOX
            const blob2BoxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blob2));
            const blob2boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blob2AmountNano.toString()));
            const blob2BoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                blob2boxValue,
                (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
                creationHeight);
            blob2BoxBuilder.set_register_value(4, blob2BoxWASM.register_value(4))
            blob2BoxBuilder.set_register_value(5, await encodeIntArray(p2InfoArray))
            blob2BoxBuilder.set_register_value(6, blob2BoxWASM.register_value(6))
            blob2BoxBuilder.set_register_value(7, (await encodeLong('0')))
            blob2BoxBuilder.set_register_value(8, (await encodeLong('0')))
            blob2BoxBuilder.set_register_value(9, blob2BoxWASM.register_value(9))
            blob2BoxBuilder.add_token(gameTokenId, blobTokenAmount);
            try {
                outputCandidates.add(blob2BoxBuilder.build());
            } catch (e) {
                console.log(`building error: ${e}`);
                throw e;
            }

            const oatmealTokenId = (await ergolib).TokenId.from_str(OATMEAL_TOKEN_ID);
            const oatmealBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
            // P1 oatmeal box
            const p1Script = blob1BoxWASM.register_value(6).encode_to_base16();
            const p1Address = (await ergolib).Address.recreate_from_ergo_tree((await ergolib).ErgoTree.from_base16_bytes("00" + p1Script));
            const oatmeal1BoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                oatmealBoxValue,
                (await ergolib).Contract.pay_to_address(p1Address),
                creationHeight);
            oatmeal1BoxBuilder.add_token(oatmealTokenId, p1OatmealAmount);
            try {
                outputCandidates.add(oatmeal1BoxBuilder.build());
            } catch (e) {
                console.log(`building error: ${e}`);
                throw e;
            }

            // P2 oatmeal box
            const p2Script = blob2BoxWASM.register_value(6).encode_to_base16();
            const p2Address = (await ergolib).Address.recreate_from_ergo_tree((await ergolib).ErgoTree.from_base16_bytes("00" + p2Script));
            const oatmeal2BoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                oatmealBoxValue,
                (await ergolib).Contract.pay_to_address(p2Address),
                creationHeight);
            oatmeal2BoxBuilder.add_token(oatmealTokenId, p2OatmealAmount);
            try {
                outputCandidates.add(oatmeal2BoxBuilder.build());
            } catch (e) {
                console.log(`building error: ${e}`);
                throw e;
            }

            // prepate tx inputs
            var inputs = [blob1, blob2, gameBox];
            const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
            const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
            const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
            console.log("processFightResult",)
            const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], GAME_ADDRESS, inputs);
            //console.log("tx", JSONBigInt.stringify(tx));
            const [signedTx, index] = await signTransactionMultiContext(tx, inputs, [currentConfigBox], wallet);
            console.log("signedTx", signedTx);
            const txId = await sendTx(JSONBigInt.parse(signedTx));
            if (txId) {
                winningTx.push([txId, index])
            }
            //if (signedTx.id) {
            //    winningTx.push(signedTx.id)
            //}


            console.log("### txId ###", txId);

        } catch (e) {
            console.log(e)
        }
    }
    console.log("winningTx", winningTx)
    if (winningTx.length === 2) {
        return winningTx;
    } else {
        return [['', -1], ['', -1]];
    }

}

export async function processOatmealRequest(oatmealRequestJSON, currentReserveBox, currentConfigBox) {
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    const reserveIniWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(currentReserveBox));
    const availableAmountNano = oatmealRequestJSON.value - TX_FEE -  MIN_NANOERG_BOX_VALUE;
    const tokenAmount = Math.floor(availableAmountNano / OATMEAL_PRICE);
    const change = oatmealRequestJSON.value - TX_FEE - tokenAmount * OATMEAL_PRICE;
console.log("change", tokenAmount, availableAmountNano, oatmealRequestJSON.value ,change)

    const reserveIniTokenAmount = reserveIniWASM.tokens().get(0).amount().as_i64().as_num();
    const newReserveTokenAmount = reserveIniTokenAmount - tokenAmount;
    const oatmealTokenId = (await ergolib).TokenId.from_str(OATMEAL_TOKEN_ID);
    const inputs = [oatmealRequestJSON, currentReserveBox];
    const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
    const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
    const boxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(oatmealRequestJSON));

    const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
    // NEW RESERVE BOX
    const newReserveTokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(newReserveTokenAmount.toString()));
    const reserveValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
    const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        reserveValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS)),
        creationHeight);
    reserveBoxBuilder.add_token(oatmealTokenId, newReserveTokenAmountWASM);
    try {
        outputCandidates.add(reserveBoxBuilder.build());
    } catch (e) {
        console.log(`processOatmealRequest building error: ${e}`);
        throw e;
    }

    // Pay box
    const payBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((tokenAmount * OATMEAL_PRICE).toString()));
    const payBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        payBoxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(GAME_ADDRESS)),
        creationHeight);
    try {
        outputCandidates.add(payBoxBuilder.build());
    } catch (e) {
        console.log(`processOatmealRequest building error: ${e}`);
        throw e;
    }

    // Delivery box
    const deliveryBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(change.toString()));
    const oatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(tokenAmount.toString()));
    const ownerAddress = await ergoTreeToAddress("00" + oatmealRequestJSON.additionalRegisters.R4.serializedValue);
    console.log("ownerAddress", ownerAddress);
    const deliveryBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        deliveryBoxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(ownerAddress)),
        creationHeight);
    deliveryBoxBuilder.add_token(oatmealTokenId, oatmealTokenAmount);
    try {
        outputCandidates.add(deliveryBoxBuilder.build());
    } catch (e) {
        console.log(`processOatmealRequest building error: ${e}`);
        throw e;
    }
    
    const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], ownerAddress, inputs);
    const signedTx = JSONBigInt.parse(await signTransaction(tx, inputs, [currentConfigBox], wallet));
    const txId = await sendTx(signedTx);
    console.log("processOatmealRequest txId", txId);
    return txId;

}