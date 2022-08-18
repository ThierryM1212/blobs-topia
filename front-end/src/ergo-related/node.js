import { DEFAULT_NODE_ADDRESS } from '../utils/constants';
import { get, post } from './rest';
import { addressToErgoTree } from './serializer';

// in order to secure the node requests (port 9053) the following setting have been done on apache
// prevent any connection to 9053 except from localhost
// proxy https://transaction-builder.ergo.ga/blocks to http://localhost:9053/blocks/lastHeaders/10


async function getRequest(url) {
    const nodeApi = DEFAULT_NODE_ADDRESS;
    return await get(nodeApi + url).then(res => {
        return { data: res };
    });
}

async function postRequest(url, body = {}, apiKey = '') {
    const nodeApi = DEFAULT_NODE_ADDRESS;
    try {
        const res = await post(nodeApi + url, body)
        return { data: res };
    } catch (err) {
        console.log("postRequest", err);
        return { data: err.toString() }
    }
}

export async function getLastHeaders() {
    return await getRequest('blocks/lastHeaders/10')
        .then(res => res.data);
}

export async function getLastHeadersFull() {
    return await getRequest('blocks/lastHeaders/20')
        .then(res => res.data);
}

export async function sendTxNode(json) {
    const res = await postRequest('transactions', json);
    return res.data;
}

export async function currentHeight() {
    return getRequest('/info')
        .then(res => res.data)
        .then(res => res.headersHeight);
}

export async function boxById(id) {
    const res = await getRequest(`/utxo/byId/${id}`);
    return res.data;
}

export async function boxByIdMempool(id) {
    const res = await getRequest(`/utxo/withPool/byId/${id}`);
    return res.data;
}

export async function getScan(id) {
    const resScan = await getRequest(`/scan/unspentBoxes/${id}?minConfirmations=-1&maxConfirmations=-1&minInclusionHeight=0&maxInclusionHeight=-1`);
    var result = [];
    for (const reScanBox of resScan.data) {
        var box = reScanBox.box;
        box['address'] = reScanBox.address;
        result.push(box);
    }
    return result;
}

export async function getUnconfirmedTxsFor(addr) {
    const unconfirmedTx = await getRequest(`/transactions/unconfirmed?limit=100`);
    console.log("getUnconfirmedTxsFor", unconfirmedTx);
    const ergoTree = await addressToErgoTree(addr);

    var res = [];
    if (unconfirmedTx.data) {
        for (const tx of unconfirmedTx.data) {
            if (tx.inputs.map(b => b.ergoTree).includes(ergoTree) ||
                tx.outputs.map(b => b.ergoTree).includes(ergoTree)) {
                res.push(tx);
            }
        }
    }

    console.log("getUnconfirmedTxsFor", res);
    return res;
}

export async function getSpentAndUnspentBoxesFromMempool(address) {
    try {
        var unconfirmedTxs = await getUnconfirmedTxsFor(address);
        //console.log("getSpentAndUnspentBoxesFromMempool", unconfirmedTxs);
        var spentBoxes = [];
        var newBoxes = [];
        if (unconfirmedTxs && unconfirmedTxs.length > 0) {
            spentBoxes = unconfirmedTxs.map(tx => tx.inputs).flat();
            newBoxes = unconfirmedTxs.map(tx => tx.outputs).flat().filter(box => address === box.address);
        }
        console.log("getSpentAndUnspentBoxesFromMempool", spentBoxes, newBoxes)
        return [spentBoxes, newBoxes];
    } catch(e) {
        console.log(e);
        return [[],[]];
    }
}