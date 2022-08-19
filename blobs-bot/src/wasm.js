let ergolib = import('ergo-lib-wasm-nodejs');
import JSONBigInt from 'json-bigint';
import { NANOERG_TO_ERG, TX_FEE } from './constants.js';
import { currentHeight, getExplorerBlockHeaders, getExplorerBlockHeadersFull } from './explorer.js';


export async function getErgoStateContext() {
    const explorerContext = (await getExplorerBlockHeaders());
    const block_headers = (await ergolib).BlockHeaders.from_json(explorerContext);
    const pre_header = (await ergolib).PreHeader.from_block_header(block_headers.get(0));
    return await getErgoStateContext2(0);
}

export async function getErgoStateContext2(contextId) {
    const explorerContext = (await getExplorerBlockHeadersFull()).splice(contextId, 10);
    const block_headers = (await ergolib).BlockHeaders.from_json(explorerContext);
    const pre_header = (await ergolib).PreHeader.from_block_header(block_headers.get(0));
    return new (await ergolib).ErgoStateContext(pre_header, block_headers);
}

export async function getBoxSelection(utxos, amountFloat, tokens) {
    const amountToSend = Math.round((amountFloat * NANOERG_TO_ERG)).toString();
    const amountToSendBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(amountToSend));
    const selector = new (await ergolib).SimpleBoxSelector();
    let boxSelection = {};

    try {
        boxSelection = selector.select(
            (await ergolib).ErgoBoxes.from_boxes_json(utxos),
            (await ergolib).BoxValue.from_i64(amountToSendBoxValue.as_i64()),
            tokens);
    } catch (e) {
        let msg = "[Wallet] Error: "
        if (JSON.stringify(e).includes("BoxValue out of bounds")) {
            msg = msg + "Increase the Erg amount to process the transaction. "
            return msg;
        }
        throw (e);
    }
    return boxSelection;
}

export async function signTransaction(unsignedTx, inputs, dataInputs, wallet) {
    //console.log("signTransaction1", unsignedTx, inputs, dataInputs);
    const unsignedTransaction = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(unsignedTx));
    const inputBoxes = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const dataInputsBoxes = (await ergolib).ErgoBoxes.from_boxes_json(dataInputs);
    const ctx = await getErgoStateContext();
    //console.log("signTransaction2", unsignedTx, inputs, dataInputs);
    const signedTx = wallet.sign_transaction(ctx, unsignedTransaction, inputBoxes, dataInputsBoxes);
    return signedTx.to_json();
}

export async function signTransactionMultiContext(unsignedTx, inputs, dataInputs, wallet) {
    //console.log("signTransaction1", unsignedTx, inputs, dataInputs);
    const unsignedTransaction = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(unsignedTx));
    const inputBoxes = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const dataInputsBoxes = (await ergolib).ErgoBoxes.from_boxes_json(dataInputs);
    for (let i = 0; i < 10; i++) {
        try {
            const ctx = await getErgoStateContext2(i);
            const signedTx = wallet.sign_transaction(ctx, unsignedTransaction, inputBoxes, dataInputsBoxes);
            console.log("try "+i.toString())
            return signedTx.to_json();
        } catch(e) {
            null;
        }
    }
}


export async function encodeLong(num) {
    return (await ergolib).Constant.from_i64((await ergolib).I64.from_str(num));
}

export async function createTransaction(boxSelection, outputCandidates, dataInputs, changeAddress, utxos, txFee = undefined) {
    const creationHeight = await currentHeight();
    var fee = TX_FEE;
    if (txFee) {
        fee = txFee;
    }
    const txBuilder = (await ergolib).TxBuilder.new(
        boxSelection,
        outputCandidates,
        creationHeight,
        (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(fee.toString())),
        (await ergolib).Address.from_base58(changeAddress),
        (await ergolib).BoxValue.SAFE_USER_MIN());
    const dataInputsWASM = new (await ergolib).DataInputs();
    for (const box of dataInputs) {
        const boxIdWASM = (await ergolib).BoxId.from_str(box.boxId);
        const dataInputWASM = new (await ergolib).DataInput(boxIdWASM);
        dataInputsWASM.add(dataInputWASM);
    }
    txBuilder.set_data_inputs(dataInputsWASM);
    const tx = parseUnsignedTx(txBuilder.build().to_json());
    //console.log(`tx: ${JSONBigInt.stringify(tx)}`);

    const unsignedTx = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(tx))
    //console.log("unsignedTx",unsignedTx,unsignedTx.id().to_str(),unsignedTx.id().to_str());
    var correctTx = parseUnsignedTx(unsignedTx.to_json());

    // Put back complete selected inputs in the same order
    correctTx.inputs = correctTx.inputs.map(box => {
        //console.log(`box: ${JSONBigInt.stringify(box)}`);
        const fullBoxInfo = parseUtxo(utxos.find(utxo => utxo.boxId === box.boxId));
        return {
            ...fullBoxInfo,
            extension: {}
        };
    });
    // Put back complete selected datainputs in the same order
    correctTx.dataInputs = correctTx.dataInputs.map(box => {
        //console.log(`box: ${JSONBigInt.stringify(box)}`);
        const fullBoxInfo = parseUtxo(dataInputs.find(utxo => utxo.boxId === box.boxId));
        return {
            ...fullBoxInfo,
            extension: {}
        };
    });
    //console.log(`correctTx tx: ${JSONBigInt.stringify(correctTx)}`);
    return correctTx;
}

export function parseUnsignedTx(str) {
    let json = JSONBigInt.parse(str);
    return {
        id: json.id,
        inputs: json.inputs,
        dataInputs: json.dataInputs,
        outputs: json.outputs.map(output => (parseUtxo(output))),
    };
}

function parseUtxo(json, addExtention = true, mode = 'input') {
    if (json === undefined) {
        return {};
    }
    var res = {};
    if (mode === 'input') {
        if ("id" in json) {
            res["boxId"] = json.id;
        } else {
            res["boxId"] = json.boxId;
        }
    }
    res["value"] = json.value.toString();
    res["ergoTree"] = json.ergoTree;
    if (Array.isArray(json.assets)) {
        res["assets"] = json.assets.map(asset => ({
            tokenId: asset.tokenId,
            amount: asset.amount.toString(),
            name: asset.name ?? '',
            decimals: asset.decimals ?? 0,
        }));
    } else {
        res["assets"] = [];
    }
    if (isDict(json["additionalRegisters"])) {
        res["additionalRegisters"] = parseAdditionalRegisters(json.additionalRegisters);
    } else {
        res["additionalRegisters"] = {};
    }

    res["creationHeight"] = json.creationHeight;

    if ("address" in json) {
        res["address"] = json.address;
    }

    if (mode === 'input') {
        if ("txId" in json) {
            res["transactionId"] = json.txId;
        } else {
            res["transactionId"] = json.transactionId;
        }
        res["index"] = json.index;
    }
    if (addExtention) {
        res["extension"] = {};
    }
    return res;
}

function parseAdditionalRegisters(json) {
    var registterOut = {};
    //console.log("json",json);
    Object.entries(json).forEach(([key, value]) => {
        //console.log("key",key,"value",value);
        if (isDict(value)) {
            registterOut[key] = value["serializedValue"];
        } else {
            registterOut[key] = value;
        }
      });
      //console.log("registterOut",registterOut);
    return registterOut;
}

function isDict(v) {
    return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}

export async function encodeLongArray(longArray) {
    return (await ergolib).Constant.from_i64_str_array(longArray);
}

export async function ergoTreeToAddress(ergoTree) {
    //console.log("ergoTreeToAddress",ergoTree);
    const ergoT = (await ergolib).ErgoTree.from_base16_bytes(ergoTree);
    const address = (await ergolib).Address.recreate_from_ergo_tree(ergoT);
    return address.to_base58();
}
