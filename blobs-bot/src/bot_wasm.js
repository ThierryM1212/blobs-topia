import JSONBigInt from 'json-bigint';
import { BLOBINATOR_DEFI_TOK_NUM, BLOBINATOR_FEE, BLOBINATOR_MIN_VALUE, BLOBINATOR_TOKEN_ID, BLOB_MINT_FEE, GAME_ADDRESS, GAME_TOKEN_ID, MIN_NANOERG_BOX_VALUE, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, OATMEAL_PRICE, OATMEAL_TOKEN_ID, SPICY_OATMEAL_TOKEN_ID, TX_FEE } from './constants.js';
import { currentHeight, sendTx } from './explorer.js';
import { BLOBINATOR_FEE_SCRIPT_ADDRESS, BLOBINATOR_RESERVE_SCRIPT_ADDRESS, BLOBINATOR_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS, BURN_ALL_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS, OATMEAL_RESERVE_SCRIPT_ADDRESS, OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS, RESERVE_SCRIPT_ADDRESS } from './script_constants.js';
import { createTransaction, encodeIntArray, encodeLong, ergoTreeToAddress, getUtxosListValue, setBoxRegisterByteArray, signTransaction, signTransactionMultiContext } from './wasm.js';
let ergolib = import('ergo-lib-wasm-nodejs');


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
        return [txId, signedTx];


    } catch (e) {
        console.log(e);
    }
}

export async function engageFight(blob1, blob2, currentReserveBox, currentConfigBox) {
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    const reserveIniWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(currentReserveBox));
    const reserveIniTokenAmount = reserveIniWASM.tokens().get(0).amount().as_i64().as_num();
    const newReserveOMTokenAmount = reserveIniTokenAmount - NUM_OATMEAL_TOKEN_LOSER - NUM_OATMEAL_TOKEN_WINNER;
    const reserveIniSpicyOMTokenAmount = reserveIniWASM.tokens().get(1).amount().as_i64().as_num();
    const newReserveSpicyOMAmount = reserveIniSpicyOMTokenAmount - 2;
    const newReserveSpicyOMTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(newReserveSpicyOMAmount.toString()));

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
    const spicyOatmealTokenId = (await ergolib).TokenId.from_str(SPICY_OATMEAL_TOKEN_ID);
    const spicyOatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
    gameBoxBuilder.add_token(spicyOatmealTokenId, spicyOatmealTokenAmount);
    try {
        outputCandidates.add(gameBoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    // OATMEAL RESERVE BOX
    const newReserveTokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(newReserveOMTokenAmount.toString()));
    const reserveValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
    const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        reserveValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(OATMEAL_RESERVE_SCRIPT_ADDRESS)),
        creationHeight);
    reserveBoxBuilder.add_token(oatmealTokenId, newReserveTokenAmountWASM);
    reserveBoxBuilder.add_token(spicyOatmealTokenId, newReserveSpicyOMTokenAmount);
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
    const blobinatorFee = Math.max(Math.round(2 * gameAmount * BLOBINATOR_FEE / 1000), MIN_NANOERG_BOX_VALUE);
    //console.log("gameAmount: ", gameBox, gameAmount);
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
    const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
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
                blob1AmountNano = blob1.value + 2 * gameAmount - 2 * TX_FEE - 2 * MIN_NANOERG_BOX_VALUE - blobinatorFee;
                p1InfoArray[3] = p1InfoArray[3] + 1;
                p1OatmealAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((NUM_OATMEAL_TOKEN_WINNER).toString()));
                p2OatmealAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((NUM_OATMEAL_TOKEN_LOSER).toString()));
            } else if (i === 1) {
                console.log("P2 win");
                blob2AmountNano = blob2.value + 2 * gameAmount - 2 * TX_FEE - 2 * MIN_NANOERG_BOX_VALUE - blobinatorFee;
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
            const spicyOatmealTokenId = (await ergolib).TokenId.from_str(SPICY_OATMEAL_TOKEN_ID);
            const spicyOatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));
            const oatmealBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
            // P1 oatmeal box
            const p1Script = blob1BoxWASM.register_value(6).encode_to_base16();
            const p1Address = (await ergolib).Address.recreate_from_ergo_tree((await ergolib).ErgoTree.from_base16_bytes("00" + p1Script));
            const oatmeal1BoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                oatmealBoxValue,
                (await ergolib).Contract.pay_to_address(p1Address),
                creationHeight);
            oatmeal1BoxBuilder.add_token(oatmealTokenId, p1OatmealAmount);
            oatmeal1BoxBuilder.add_token(spicyOatmealTokenId, spicyOatmealTokenAmount);
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
            oatmeal2BoxBuilder.add_token(spicyOatmealTokenId, spicyOatmealTokenAmount);
            try {
                outputCandidates.add(oatmeal2BoxBuilder.build());
            } catch (e) {
                console.log(`building error: ${e}`);
                throw e;
            }

            // Blobinator Fee
            const blobinatorFeeBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobinatorFee.toString()));
            const blobinatorFeeBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                blobinatorFeeBoxValue,
                (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_FEE_SCRIPT_ADDRESS)),
                creationHeight);
            try {
                outputCandidates.add(blobinatorFeeBoxBuilder.build());
            } catch (e) {
                console.log(`building error: ${e}`);
                throw e;
            }

            // prepate tx inputs
            var inputs = [blob1, blob2, gameBox];
            const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
            const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
            const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

            const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], GAME_ADDRESS, inputs);
            //console.log("tx", JSONBigInt.stringify(tx));
            const signedTx = JSONBigInt.parse(await signTransactionMultiContext(tx, inputs, [currentConfigBox], wallet));
            //console.log("signedTx", signedTx);
            const txId = await sendTx(signedTx);
            console.log("### txId ###", txId);
            //return txId;
        } catch (e) {
            console.log(e)
        }
    }
}

export async function processOatmealRequest(oatmealRequestJSON, currentReserveBox, currentConfigBox) {
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    const reserveIniWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(currentReserveBox));
    const availableAmountNano = oatmealRequestJSON.value - TX_FEE - MIN_NANOERG_BOX_VALUE;
    const tokenAmount = Math.floor(availableAmountNano / OATMEAL_PRICE);
    const change = oatmealRequestJSON.value - TX_FEE - tokenAmount * OATMEAL_PRICE;
    //console.log("change", tokenAmount, availableAmountNano, oatmealRequestJSON.value ,change)

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
    //console.log("ownerAddress", ownerAddress);
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
    return [txId, signedTx];

}

export async function processBlobinatorFee(blobinatorFeeJSONArray, currentBlobinatorReserve, currentConfigBox) {
    //console.log("processBlobinatorFee 0");
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    //console.log("processBlobinatorFee blobinatorFeeJSONArray ", blobinatorFeeJSONArray);
    const totalInputValue = parseInt(getUtxosListValue(blobinatorFeeJSONArray));
    var utxos = [];
    var invokeBlobinator = false;
    
    if (totalInputValue - TX_FEE > BLOBINATOR_MIN_VALUE) {
        // Invoke blobinator
        console.log("processBlobinatorFee Invoke blobinator for ", totalInputValue);
        invokeBlobinator = true;
        utxos = blobinatorFeeJSONArray.concat(currentBlobinatorReserve);
    } else {
        if (totalInputValue > BLOBINATOR_MIN_VALUE / 10 && blobinatorFeeJSONArray.length >= 20) {
            // Consolidate fee
            console.log("processBlobinatorFee Consolidate fee for ", totalInputValue);
            utxos = blobinatorFeeJSONArray;
        } else {
            console.log("processBlobinatorFee nothing to do: amount", totalInputValue, "number of fee box", blobinatorFeeJSONArray.length);
            return;
        }
    }

    const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
    const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
    const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

    const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
    if (invokeBlobinator) {
        // blobinator box
        const blobinatorTokenId = (await ergolib).TokenId.from_str(BLOBINATOR_TOKEN_ID);
        const blobinatorTokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));
        const blobinatorBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((totalInputValue - TX_FEE).toString()));
        const blobinatorBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            blobinatorBoxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_SCRIPT_ADDRESS)),
            creationHeight);
        blobinatorBoxBuilder.add_token(blobinatorTokenId, blobinatorTokenAmountWASM);
        await setBoxRegisterByteArray(blobinatorBoxBuilder, 4, await encodeLong("0"));
        blobinatorBoxBuilder.set_register_value(5, await encodeIntArray([0]));
        const dummySigmaProp = (await ergolib).Constant.from_ecpoint_bytes(
            (await ergolib).Address.from_base58(GAME_ADDRESS).to_bytes(0x00).subarray(1, 34)
        );
        blobinatorBoxBuilder.set_register_value(6, dummySigmaProp);
        blobinatorBoxBuilder.set_register_value(7, (await encodeLong("0")));
        blobinatorBoxBuilder.set_register_value(8, (await encodeLong("0")));
        blobinatorBoxBuilder.set_register_value(9, (await encodeLong("0")));
        try {
            outputCandidates.add(blobinatorBoxBuilder.build());
        } catch (e) {
            console.log(`processBlobinatorFee building error: ${e}`);
            throw e;
        }

        // NEW RESERVE BOX
        const reserveIniWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(currentBlobinatorReserve));
        const reserveIniTokenAmount = reserveIniWASM.tokens().get(0).amount().as_i64().as_num();
        const newReserveTokenAmount = reserveIniTokenAmount - 1;
        const newReserveTokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(newReserveTokenAmount.toString()));
        const reserveValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
        const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            reserveValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_RESERVE_SCRIPT_ADDRESS)),
            creationHeight);
        reserveBoxBuilder.add_token(blobinatorTokenId, newReserveTokenAmountWASM);
        try {
            outputCandidates.add(reserveBoxBuilder.build());
        } catch (e) {
            console.log(`processBlobinatorFee building error: ${e}`);
            throw e;
        }
    } else {
        // Consolidated fee box
        const blobinatorFeeBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((totalInputValue - TX_FEE).toString()));
        const blobinatorFeeBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            blobinatorFeeBoxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_FEE_SCRIPT_ADDRESS)),
            creationHeight);
        try {
            outputCandidates.add(blobinatorFeeBoxBuilder.build());
        } catch (e) {
            console.log(`processBlobinatorFee building error: ${e}`);
            throw e;
        }
    }

    const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], GAME_ADDRESS, utxos);
    console.log("processBlobinatorFee tx", JSONBigInt.stringify(tx));
    const signedTx = JSONBigInt.parse(await signTransaction(tx, utxos, [currentConfigBox], wallet));
    //console.log("processBlobinatorFee signedTx", JSONBigInt.stringify(signedTx));
    const txId = await sendTx(signedTx);
    return txId;
}


export async function engageBlobinatorFight(blob, blobinator, currentConfigBox) {
    //console.log("engageBlobinatorFight",  blob, blobinator);
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();
    const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
    // BLOB1 BOX
    const blobBoxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blob));
    const tokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));
    const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
    const blob1AmountNano = blob.value - TX_FEE - MIN_NANOERG_BOX_VALUE;
    const blob1boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blob1AmountNano.toString()));
    const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        blob1boxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
        creationHeight);
    blobBoxBuilder.set_register_value(4, blobBoxWASM.register_value(4))
    blobBoxBuilder.set_register_value(5, blobBoxWASM.register_value(5))
    blobBoxBuilder.set_register_value(6, blobBoxWASM.register_value(6))
    blobBoxBuilder.set_register_value(7, (await encodeLong('5')))
    blobBoxBuilder.set_register_value(8, blobBoxWASM.register_value(8))
    blobBoxBuilder.set_register_value(9, blobBoxWASM.register_value(9))
    blobBoxBuilder.add_token(gameTokenId, tokenAmount);
    try {
        outputCandidates.add(blobBoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    // BLOBINATOR BOX
    const blobinatorTokenId = (await ergolib).TokenId.from_str(BLOBINATOR_TOKEN_ID);
    const blobinatorBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobinator.value.toString()));
    const gameBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        blobinatorBoxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_SCRIPT_ADDRESS)),
        creationHeight);
    await setBoxRegisterByteArray(gameBoxBuilder, 4, "");
    gameBoxBuilder.set_register_value(5, await encodeIntArray([0]));
    const dummySigmaProp = (await ergolib).Constant.from_ecpoint_bytes(
        (await ergolib).Address.from_base58(GAME_ADDRESS).to_bytes(0x00).subarray(1, 34)
    );
    gameBoxBuilder.set_register_value(6, dummySigmaProp);
    gameBoxBuilder.set_register_value(7, (await encodeLong("0")));
    gameBoxBuilder.set_register_value(8, (await encodeLong("0")));
    gameBoxBuilder.set_register_value(9, blobBoxWASM.register_value(9))
    gameBoxBuilder.add_token(blobinatorTokenId, tokenAmount);
    gameBoxBuilder.add_token(gameTokenId, tokenAmount);
    try {
        outputCandidates.add(gameBoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    // BURN SPICY OATMEAL
    const spicyOatmealTokenId = (await ergolib).TokenId.from_str(SPICY_OATMEAL_TOKEN_ID);
    const spicyOatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(BLOBINATOR_DEFI_TOK_NUM.toString()));
    const oatMealReturnBox = new (await ergolib).ErgoBoxCandidateBuilder(
        (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((MIN_NANOERG_BOX_VALUE).toString())),
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BURN_ALL_SCRIPT_ADDRESS)),
        creationHeight);
    oatMealReturnBox.add_token(spicyOatmealTokenId, spicyOatmealTokenAmount);
    try {
        outputCandidates.add(oatMealReturnBox.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    // prepate tx inputs
    var inputs = [blob, blobinator];
    const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
    const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

    const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], GAME_ADDRESS, inputs);
    //console.log("tx", JSONBigInt.stringify(tx));
    const signedTx = JSONBigInt.parse(await signTransaction(tx, inputs, [currentConfigBox], wallet));
    //console.log("signedTx", signedTx);
    const txId = await sendTx(signedTx);
    return txId;
}

export async function blobinatorFightResults(blob, blobinator, currentConfigBox) {
    //console.log("engageBlobinatorFight",  blob, blobinator);
    const wallet = (await ergolib).Wallet.from_mnemonic("", "");
    const creationHeight = await currentHeight();

    const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
    const blobinatorTokenId = (await ergolib).TokenId.from_str(BLOBINATOR_TOKEN_ID);
    const tokenAmount1 = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));
    const tokenAmount2 = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));

    // prepate tx inputs
    var inputs = [blob, blobinator];
    const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
    const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

    for (let i = 0; i < 2; i++) {
        try {
            const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
            // BLOB1 BOX
            const blobBoxWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blob));
            var blob1AmountNano = 0, blobinatorAmountNano = 0;
            if (i === 0) {
                blob1AmountNano = parseInt(blob.value) - TX_FEE;
                blobinatorAmountNano = parseInt(blobinator.value);
            } else {
                blob1AmountNano = parseInt(blob.value) - TX_FEE + parseInt(blobinator.value) - MIN_NANOERG_BOX_VALUE;
                blobinatorAmountNano = MIN_NANOERG_BOX_VALUE;
            }
            const blob1boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blob1AmountNano.toString()));
            const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                blob1boxValue,
                (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
                creationHeight);
            blobBoxBuilder.set_register_value(4, blobBoxWASM.register_value(4))
            blobBoxBuilder.set_register_value(5, blobBoxWASM.register_value(5))
            blobBoxBuilder.set_register_value(6, blobBoxWASM.register_value(6))
            blobBoxBuilder.set_register_value(7, (await encodeLong('0')))
            blobBoxBuilder.set_register_value(8, blobBoxWASM.register_value(8))
            blobBoxBuilder.set_register_value(9, blobBoxWASM.register_value(9))
            blobBoxBuilder.add_token(gameTokenId, tokenAmount2);
            try {
                outputCandidates.add(blobBoxBuilder.build());
            } catch (e) {
                console.log(`building error: ${e}`);
                throw e;
            }

            if (i === 0) {
                // BLOBINATOR BOX
                const blobinatorBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobinatorAmountNano.toString()));
                const gameBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
                    blobinatorBoxValue,
                    (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_SCRIPT_ADDRESS)),
                    creationHeight);
                await setBoxRegisterByteArray(gameBoxBuilder, 4, "");
                gameBoxBuilder.set_register_value(5, await encodeIntArray([0]));
                const dummySigmaProp = (await ergolib).Constant.from_ecpoint_bytes(
                    (await ergolib).Address.from_base58(GAME_ADDRESS).to_bytes(0x00).subarray(1, 34)
                );
                gameBoxBuilder.set_register_value(6, dummySigmaProp);
                gameBoxBuilder.set_register_value(7, (await encodeLong("0")));
                gameBoxBuilder.set_register_value(8, (await encodeLong("0")));
                gameBoxBuilder.set_register_value(9, (await encodeLong("0")))
                gameBoxBuilder.add_token(blobinatorTokenId, tokenAmount1);
                try {
                    outputCandidates.add(gameBoxBuilder.build());
                } catch (e) {
                    console.log(`building error: ${e}`);
                    throw e;
                }
            } else if (i === 1) {
                // BURN BLOBINATOR TOKEN
                const blobinatorBurnBox = new (await ergolib).ErgoBoxCandidateBuilder(
                    (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((blobinatorAmountNano).toString())),
                    (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BURN_ALL_SCRIPT_ADDRESS)),
                    creationHeight);
                blobinatorBurnBox.set_register_value(4, blobBoxWASM.register_value(9))
                await setBoxRegisterByteArray(blobinatorBurnBox, 4, "");
                blobinatorBurnBox.set_register_value(5, await encodeIntArray([0]));
                const dummySigmaProp = (await ergolib).Constant.from_ecpoint_bytes(
                    (await ergolib).Address.from_base58(GAME_ADDRESS).to_bytes(0x00).subarray(1, 34)
                );
                blobinatorBurnBox.set_register_value(6, dummySigmaProp);
                blobinatorBurnBox.set_register_value(7, (await encodeLong("0")));
                blobinatorBurnBox.set_register_value(8, (await encodeLong("0")));
                blobinatorBurnBox.set_register_value(9, (await encodeLong("0")))
                blobinatorBurnBox.add_token(blobinatorTokenId, tokenAmount1);
                try {
                    outputCandidates.add(blobinatorBurnBox.build());
                } catch (e) {
                    console.log(`building error: ${e}`);
                    throw e;
                }
            }

            const tx = await createTransaction(boxSelection, outputCandidates, [currentConfigBox], GAME_ADDRESS, inputs);
            //console.log("tx", JSONBigInt.stringify(tx));
            const signedTx = JSONBigInt.parse(await signTransaction(tx, inputs, [currentConfigBox], wallet));
            //console.log("signedTx", JSONBigInt.stringify(signedTx));
            
            const txId = await sendTx(signedTx);
            if (i == 0) {
                console.log("blobinatorFightResults Blobinator win txId: ", txId);
            } else {
                console.log("blobinatorFightResults Blob win txId: ", txId);
            }
            return txId;

        } catch (e) {
            //console.log(e)
        }

    }
}