import { fetch } from 'undici';
import { TextDecoderStream } from 'node:stream/web';
import JSONBigInt from 'json-bigint';
import { DEFAULT_EXPLORER_API_ADDRESS, DEFAULT_NODE_ADDRESS } from './constants.js';

async function get(url, apiKey = '') {
    try {
        return await fetch(url, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                api_key: apiKey,
            }
        }).then(res => res.json());
    } catch (e) {
        console.error(e);
        return [];
    }
}
async function getStream(url, apiKey = '') {
    try {
        const response = await fetch(url)
        const stream = response.body;
        const textStream = stream.pipeThrough(new TextDecoderStream());
        var res = '';
        for await (const chunk of textStream) {
            res += chunk;
        }
        return res;
    } catch (e) {
        console.error(e);
        return [];
    }
}
async function getStreamRequestV1(url) {
    return await getStream(DEFAULT_EXPLORER_API_ADDRESS + 'api/v1' + url, '')
}
async function getRequestV1(url) {
    const res = await get(DEFAULT_EXPLORER_API_ADDRESS + 'api/v1' + url, '')
    return res.items;
}
async function getRequestV0(url) {
    const res = await get(DEFAULT_EXPLORER_API_ADDRESS + 'api/v0' + url, '')
    return res.items;
}
async function getRequest(url) {
    const res = await get(DEFAULT_NODE_ADDRESS + url, '')
    return res;
}
async function postRequest(url, body = {}, apiKey = '') {
    try {
        const res = await postTx(DEFAULT_NODE_ADDRESS + url, body)
        return res;
    } catch(err) {
        console.log("postRequest", err);
        return err.toString();
    }
}

export async function postTxMempool(tx) {
    try {
        const res = await postTx(DEFAULT_EXPLORER_API_ADDRESS + 'api/v1' + '/mempool/transactions/submit', tx);
        return res;
    } catch (err) {
        console.log("postTxMempool", err);
        return undefined;
    }
}

export async function sendTx(json) {
    const res = await postTxMempool(json);
    //const res = await postRequest('transactions', json)
    return res;
}

async function postTx(url, body = {}, apiKey = '') {
    //console.log("post", url)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'mode': 'cors',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
        body: JSONBigInt.stringify(body)
    });
    const [responseOk, bodyRes] = await Promise.all([response.ok, response.json()]);
    if (responseOk) {
        //console.log("fetch1", bodyRes);
        if (typeof bodyRes === 'object') {
            return bodyRes.id;
        } else {
            return bodyRes;
        }
    } else {
        console.log("fetch2", bodyRes);
        return;
    }
}

export async function currentHeight() {
    return getRequestV0('/blocks?limit=1')
        .then(res => res[0].height);
}
export async function getUnspentBoxesByAddress(address) {
    return await getRequestV1('/boxes/unspent/byAddress/' + address);
}
export async function boxByTokenId(tokenId) {
    return await getRequestV1(`/boxes/unspent/byTokenId/${tokenId}`);
}
export async function getLastHeaders() {
    return await getRequest('blocks/lastHeaders/10');
}
export async function getExplorerBlockHeaders() {
    return (await getRequestV1(`/blocks/headers`)).slice(0, 10);
}
export async function getExplorerBlockHeadersFull() {
    return (await getRequestV1(`/blocks/headers`));
}
export async function getMempoolUnspentBoxesByAddresses(addresses) {
    var mempoolBoxes = await getStreamRequestV1('/mempool/boxes/unspent');
    // build valid JSON from streamed output
    mempoolBoxes = mempoolBoxes.replaceAll('"spentTransactionId":null}{"boxId":', '"spentTransactionId":null},{"boxId":');
    const mempoolBoxesJSON = JSONBigInt.parse('[' + mempoolBoxes + ']');
    var res = {}
    for (const address of addresses) {
        res[address] = [];
    }
    for (const box of mempoolBoxesJSON) {
        for (const address of addresses) {
            if (box.address === address) {
                res[address].push(box);
            }
        }
    }
    return res;
}
