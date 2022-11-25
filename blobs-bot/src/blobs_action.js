import JSONBigInt from 'json-bigint';
import { BLOBINATOR_DEFI_TOK_NUM, BLOBINATOR_TOKEN_ID, BLOB_ERG_MIN_VALUE, CONFIG_TOKEN_ID, GAME_TOKEN_ID, MIN_NANOERG_BOX_VALUE, NANOERG_TO_ERG, SPICY_OATMEAL_TOKEN_ID, TX_FEE } from "./constants.js";
import { BLOB_SCRIPT_ADDRESS, CONFIG_SCRIPT_ADDRESS } from './script_constants.js';
import { boxByTokenId, currentHeight, getSpentAndUnspentBoxesFromMempool, getUnspentBoxesForAddressUpdated, sendTx } from "./explorer.js";
import { createTransaction, encodeLong, freeList, getTokenListFromUtxos, getUtxosListValue, getWalletForAddress, parseUtxo, signTransaction } from "./wasm.js";


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

export async function setBlobStatus(mode, blobBoxJSON, amountNano, mnemonic, address) {
    let ergolib = import('ergo-lib-wasm-nodejs');
    console.log("setBlobStatus mode", mode);
    const creationHeight = await currentHeight();

    const blobIniValueNano = blobBoxJSON.value;
    //console.log("blobIniValueNano",blobBoxJSON)
    var utxos = [];
    // MIN_NANOERG_BOX_VALUE + TX_FEE
    const availableBoxes = await getUnspentBoxesForAddressUpdated(address);
    if (getUtxosListValue(availableBoxes) < BigInt(MIN_NANOERG_BOX_VALUE + TX_FEE)) {
        console.error('Not enough coins')
        return;
    }
    if (mode === 'blobinator' && getTokenListFromUtxos(availableBoxes)[SPICY_OATMEAL_TOKEN_ID] < BigInt(2)) {
        console.error('Not enough spicy oatmeal')
        return;
    }
    //console.log("availableBoxes", availableBoxes)
    for (const box of availableBoxes) {
        if (mode === 'blobinator') {
            if ((getTokenListFromUtxos(utxos)[SPICY_OATMEAL_TOKEN_ID] ??  BigInt(0)) < BigInt(2) &&
                getTokenListFromUtxos([box])[SPICY_OATMEAL_TOKEN_ID ??  BigInt(0)] > BigInt(0)) {
                utxos.push(box);
                continue;
            }
        }
        if (getUtxosListValue(utxos) < BigInt(amountNano)) {
            utxos.push(box)
        }
    }


    utxos.unshift(blobBoxJSON);
    
    const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
    const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
    //console.log("utxos",utxos)
    const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
    const spicyOatmealTokenId = (await ergolib).TokenId.from_str(SPICY_OATMEAL_TOKEN_ID);
    const spicyOatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(BLOBINATOR_DEFI_TOK_NUM.toString()));

    // Blob Box
    var blobStatus = '0', blobStatusValue = '0';
    if (mode === 'fight') {
        blobStatus = '1';
        blobStatusValue = amountNano.toString();
        const maxFightValueNano = parseInt(blobIniValueNano) - BLOB_ERG_MIN_VALUE;
        //console.log("maxFightValueNano", maxFightValueNano, amountNano);
        if (amountNano > maxFightValueNano) {
            console.error("Not enough ERG in the blob to figth, maximum figth value: " + (maxFightValueNano / NANOERG_TO_ERG).toFixed(4) + " ERG");
            return;
        }
    } else if (mode === 'sell') {
        blobStatus = '2';
        blobStatusValue = amountNano.toString();
    } else if (mode === 'reset') {
        blobStatus = '0';
        blobStatusValue = '0';
    } else if (mode === 'blobinator') {
        blobStatus = '4';
        blobStatusValue = '0';
    }
    const blobBoxInWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blobBoxJSON));
    const blobboxOutValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobIniValueNano.toString()));
    const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        blobboxOutValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
        creationHeight);
    blobBoxBuilder.set_register_value(4, blobBoxInWASM.register_value(4));
    blobBoxBuilder.set_register_value(5, blobBoxInWASM.register_value(5));
    blobBoxBuilder.set_register_value(6, blobBoxInWASM.register_value(6));
    blobBoxBuilder.set_register_value(7, (await encodeLong(blobStatus)));
    blobBoxBuilder.set_register_value(8, (await encodeLong(blobStatusValue)));
    blobBoxBuilder.set_register_value(9, blobBoxInWASM.register_value(9));
    blobBoxBuilder.add_token(gameTokenId, blobTokenAmount);
    if (mode === 'blobinator') {
        blobBoxBuilder.add_token(spicyOatmealTokenId, spicyOatmealTokenAmount);
    }
    try {
        outputCandidates.add(blobBoxBuilder.build());
    } catch (e) {
        console.log(`building error: ${e}`);
        throw e;
    }

    const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
    const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
    const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
    const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
    try {
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, address, utxos);
    } catch (e) {
        console.error(e)
    }
    freeList([boxSelection, outputCandidates, blobBoxBuilder, spicyOatmealTokenId, spicyOatmealTokenAmount, blobTokenAmount,
        blobBoxInWASM, gameTokenId, blobboxOutValue, ]);
    
    //console.log("correctTx", correctTx)
    var txId = undefined;
    if (correctTx) {
        const wallet = await getWalletForAddress(mnemonic, address);
        const signedTx = JSONBigInt.parse(await signTransaction(correctTx, utxos, currentConfigBox, wallet));
        freeList([wallet]);
        //console.log("signedTx", JSONBigInt.stringify(signedTx));
        txId = await sendTx(signedTx);
    }

    return txId;
}