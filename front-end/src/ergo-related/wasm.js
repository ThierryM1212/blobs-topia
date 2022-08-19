import JSONBigInt from 'json-bigint';
import { currentHeight, getExplorerBlockHeaders, getExplorerBlockHeadersFull } from './explorer';
import { NANOERG_TO_ERG, TX_FEE, GAME_TOKEN_ID, DEFAULT_NODE_ADDRESS } from '../utils/constants';
import { TextEncoder } from 'text-decoding';
import { byteArrayToBase64, encodeContract } from './serializer';
import { get } from './rest';
let ergolib = import('ergo-lib-wasm-browser');

/* global BigInt */

export async function getBoxSelection(utxos, amountFloat, tokens) {
    const amountToSend = Math.round((amountFloat * NANOERG_TO_ERG)).toString();
    const amountToSendBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(amountToSend));
    const selector = new (await ergolib).SimpleBoxSelector();
    let boxSelection = {};
    //console.log("ErgoBoxes", (await ergolib).ErgoBoxes.from_boxes_json(utxos).get(0).to_json());

    try {
        boxSelection = selector.select(
            (await ergolib).ErgoBoxes.from_boxes_json(utxos),
            (await ergolib).BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add((await ergolib).I64.from_str(TX_FEE.toString()))),
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

export async function createTransaction(boxSelection, outputCandidates, dataInputs, changeAddress, utxos) {
    console.log("createTransaction utxos", utxos);
    const creationHeight = await currentHeight();
    const txBuilder = (await ergolib).TxBuilder.new(
        boxSelection,
        outputCandidates,
        creationHeight,
        (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(TX_FEE.toString())),
        (await ergolib).Address.from_base58(changeAddress),
        (await ergolib).BoxValue.SAFE_USER_MIN());
    var dataInputsWASM = new (await ergolib).DataInputs();
    for (const box of dataInputs) {
        const boxIdWASM = (await ergolib).BoxId.from_str(box.boxId);
        const dataInputWASM = new (await ergolib).DataInput(boxIdWASM);
        dataInputsWASM.add(dataInputWASM);
    }
    txBuilder.set_data_inputs(dataInputsWASM);
    console.log("parseUnsignedTx")
    const tx = parseUnsignedTx(txBuilder.build().to_json());
    console.log("createTransaction tx", tx);

    const unsignedTx = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(tx))
    var correctTx = parseUnsignedTx(unsignedTx.to_json());

    // Put back complete selected inputs in the same order
    correctTx.inputs = correctTx.inputs.map(box => {
        const fullBoxInfo = parseUtxo(utxos.find(utxo => utxo.boxId === box.boxId));
        return {
            ...fullBoxInfo,
            extension: {}
        };
    });
    // Put back complete selected datainputs in the same order
    correctTx.dataInputs = correctTx.dataInputs.map(box => {
        const fullBoxInfo = parseUtxo(dataInputs.find(utxo => utxo.boxId === box.boxId));
        return {
            ...fullBoxInfo,
            extension: {}
        };
    });
    // Ensure tx balance
    const missingErgs = getMissingErg(correctTx.inputs, correctTx.outputs);
    const tokens = getMissingTokens(correctTx.inputs, correctTx.outputs);
    if (missingErgs > 0 || Object.keys(tokens) > 0) {
        console.log("incorrect tx balance, ", missingErgs, tokens);
        const contract = await encodeContract(changeAddress);
        const balanceBoxindex = correctTx.outputs.findIndex((output => output.ergoTree === contract));
        var newOutputs = correctTx.outputs.filter(output => output.ergoTree !== contract);
        const newBalanceBox = await buildBalanceBox(correctTx.inputs, newOutputs, changeAddress);
        newOutputs.splice(balanceBoxindex, 0, newBalanceBox);
        correctTx.outputs = [...newOutputs];
    }

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

export function parseUtxo(json, addExtention = true, mode = 'input') {
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

export function parseUtxos(utxos, addExtention, mode = 'input') {
    var utxosFixed = [];
    for (const i in utxos) {
        utxosFixed.push(parseUtxo(utxos[i], addExtention, mode))
    }
    return utxosFixed;
}

function parseAdditionalRegisters(json) {
    var registterOut = {};
    //console.log("json", json);
    Object.entries(json).forEach(([key, value]) => {
        //console.log("key", key, "value", value);
        if (isDict(value)) {
            registterOut[key] = value["serializedValue"];
        } else {
            registterOut[key] = value;
        }
    });
    //console.log("registterOut", registterOut);
    return registterOut;
}

export async function setBoxRegisterByteArray(box, register, str_value) {
    const value_Uint8Array = new TextEncoder().encode(str_value);
    box.set_register_value(register, (await ergolib).Constant.from_byte_array(value_Uint8Array));
}

export async function addSimpleOutputBox(outputCandidates, amountErgsFloat, payToAddress, creationHeight) {
    const amountNanoErgStr = Math.round((amountErgsFloat * NANOERG_TO_ERG)).toString();
    const amountBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(amountNanoErgStr));
    const outputBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
        amountBoxValue,
        (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(payToAddress)),
        creationHeight);
    try {
        outputCandidates.add(outputBoxBuilder.build());
    } catch (e) {
        console.log(`building output error: ${e}`);
        throw e;
    }
}


export async function getTokens(tokenId, tokenAmount) {
    var tokens = new (await ergolib).Tokens();
    const _tokenId = (await ergolib).TokenId.from_str(tokenId);
    const _tokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(tokenAmount.toString()));
    tokens.add(new (await ergolib).Token(
        _tokenId,
        _tokenAmount)
    );
    return tokens;
}

export function getNumberGameTokens(boxList) {
    var tokenAmount = 0;
    for (const box of boxList) {
        if (box.assets) {
            for (const token of box.assets) {
                if (token.tokenId === GAME_TOKEN_ID) {
                    tokenAmount += parseInt(token.amount);
                }
            }
        }
    }
    return tokenAmount;
}

export function getUtxosListValue(utxos) {
    return utxos.reduce((acc, utxo) => acc += BigInt(utxo.value), BigInt(0));
}

export function getTokenListFromUtxos(utxos) {
    var tokenList = {};
    for (const i in utxos) {
        for (const j in utxos[i].assets) {
            if (utxos[i].assets[j].tokenId in tokenList) {
                tokenList[utxos[i].assets[j].tokenId] = BigInt(tokenList[utxos[i].assets[j].tokenId]) + BigInt(utxos[i].assets[j].amount);
            } else {
                tokenList[utxos[i].assets[j].tokenId] = BigInt(utxos[i].assets[j].amount);
            }
        }
    }
    return tokenList;
}

export function getMissingErg(inputs, outputs) {
    const amountIn = getUtxosListValue(inputs);
    const amountOut = getUtxosListValue(outputs);
    if (amountIn >= amountOut) {
        return amountIn - amountOut;
    } else {
        return BigInt(0);
    }
}

export function getMissingTokens(inputs, outputs) {
    const tokensIn = getTokenListFromUtxos(inputs);
    const tokensOut = getTokenListFromUtxos(outputs);
    var res = {};
    console.log("getMissingTokens", tokensIn, tokensOut);
    if (tokensIn !== {}) {
        for (const token in tokensIn) {
            if (tokensOut !== {} && token in tokensOut) {
                if (tokensIn[token] - tokensOut[token] > 0) {
                    res[token] = tokensIn[token] - tokensOut[token];
                }
            } else {
                res[token] = tokensIn[token];
            }
        }
    }
    console.log("getMissingTokens", tokensIn, tokensOut, res);
    return res;
}

export async function buildBalanceBox(inputs, outputs, address) {
    const missingErgs = getMissingErg(inputs, outputs).toString();
    const contract = await encodeContract(address);
    const tokens = buildTokenList(getMissingTokens(inputs, outputs));
    const height = await currentHeight();
    console.log("buildBalanceBox", missingErgs, contract, tokens, height)

    return {
        value: missingErgs,
        ergoTree: contract,
        assets: tokens,
        additionalRegisters: {},
        creationHeight: height,
        extension: {},
        index: undefined,
        boxId: undefined,
    };
}

export function buildTokenList(tokens) {
    var res = [];
    if (tokens !== {}) {
        for (const i in tokens) {
            res.push({ "tokenId": i, "amount": tokens[i].toString() });
        }
    };
    return res;
}

export function verifyTransactionIO(tx) {
    const tokenAmountIn = getNumberGameTokens(tx.inputs);
    const tokenAmountOut = getNumberGameTokens(tx.outputs);
    const valueIn = getUtxosListValue(tx.inputs);
    const valueOut = getUtxosListValue(tx.outputs);
    const txOK = (tokenAmountIn === tokenAmountOut && valueIn === valueOut);
    console.log(txOK, "valueIn", valueIn, "valueOut", valueOut, "tokenAmountIn", tokenAmountIn, "tokenAmountOut", tokenAmountOut);
    if (!txOK) {
        console.log(tx);
    }
    return txOK;
}

export function getTokenAmount(box, tokenId) {
    var tokenAmount = "0";
    for (const asset of box.assets) {
        if (asset.tokenId === tokenId) {
            tokenAmount = asset.amount;
        }
    }
    return tokenAmount;
}

export function getRegisterValue(box, register) {
    if (register in box.additionalRegisters) {
        if (isDict(box.additionalRegisters[register])) {
            //console.log("getRegisterValue", box.additionalRegisters[register].serializedValue);
            return box.additionalRegisters[register].serializedValue;
        } else {
            return box.additionalRegisters[register];
        }
    } else {
        return "";
    }
}

export function getRegisterValue2(box, register) {

    return box.additionalRegisters[register];
}

function isDict(v) {
    return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

export async function getErgoStateContext() {
    const res =  await getExplorerBlockHeaders();
    const block_headers = (await ergolib).BlockHeaders.from_json(res);
    const pre_header = (await ergolib).PreHeader.from_block_header(block_headers.get(0));
    return new (await ergolib).ErgoStateContext(pre_header, block_headers);
}

export async function getErgoStateContext2(contextId) {
    const res = await getExplorerBlockHeadersFull();
    console.log("getErgoStateContext2", res);
    const explorerContext = res.slice(contextId, 10 + contextId);
    const block_headers = (await ergolib).BlockHeaders.from_json(explorerContext);
    const pre_header = (await ergolib).PreHeader.from_block_header(block_headers.get(0));
    return new (await ergolib).ErgoStateContext(pre_header, block_headers);
}

export async function signTransactionMultiContext(unsignedTx, inputs, dataInputs, wallet) {
    //console.log("signTransaction1", unsignedTx, inputs, dataInputs);
    const unsignedTransaction = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(unsignedTx));
    const inputBoxes = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const dataInputsBoxes = (await ergolib).ErgoBoxes.from_boxes_json(dataInputs);
    for (let i = 0; i < 10; i++) {
        try {
            console.log("try "+i.toString())
            const ctx = await getErgoStateContext2(i);
            const signedTx = wallet.sign_transaction(ctx, unsignedTransaction, inputBoxes, dataInputsBoxes);
            
            return [signedTx.to_json(), i];
        } catch(e) {
            console.log(e);
            continue;
        }
    }
    return undefined;
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

// https://github.com/ergoplatform/eips/pull/37 ergopay:<txBase64safe>
export async function getTxReducedB64Safe(json, inputs, dataInputs = []) {
    //console.log("getTxReducedB64Safe", json, inputs, dataInputs);
    const [txId, reducedTx] = await getTxReduced(json, inputs, dataInputs);
    //console.log("getTxReducedB64Safe1", json, inputs, dataInputs);
    // Reduced transaction is encoded with Base64
    const txReducedBase64 = byteArrayToBase64(reducedTx.sigma_serialize_bytes());
    //console.log("getTxReducedB64Safe2", json, inputs, dataInputs);
    const ergoPayTx = txReducedBase64.replace(/\//g, '_').replace(/\+/g, '-');
    //console.log("getTxReducedB64Safe3", txId, ergoPayTx);
    // split by chunk of 1000 char to generates the QR codes

    return [txId, ergoPayTx];
}

async function getTxReduced(json, inputs, dataInputs) {
    // build ergolib objects from json
    //console.log("getTxReduced", json, inputs, dataInputs);
    const unsignedTx = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(json));
    const inputBoxes = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const inputDataBoxes = (await ergolib).ErgoBoxes.from_boxes_json(dataInputs);
    const ctx = await getErgoStateContext();
    return [unsignedTx.id().to_str(), (await ergolib).ReducedTransaction.from_unsigned_tx(unsignedTx, inputBoxes, inputDataBoxes, ctx)];
}