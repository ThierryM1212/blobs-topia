import { errorAlert, waitingAlert } from '../utils/Alerts';
import { BLOB_EXCHANGE_FEE, BLOB_MINT_FEE, BLOB_PRICE, CONFIG_TOKEN_ID, GAME_ADDRESS, GAME_TOKEN_ID, INI_BLOB_ATT_LEVEL, INI_BLOB_DEF_LEVEL, INI_BLOB_GAME, INI_BLOB_VICTORY, MAX_POWER_DIFF, MIN_NANOERG_BOX_VALUE, NANOERG_TO_ERG, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, OATMEAL_PRICE, OATMEAL_TOKEN_ID, TX_FEE } from '../utils/constants';
import { BLOB_SCRIPT_HASH, CONFIG_SCRIPT_ADDRESS, GAME_SCRIPT_HASH, OATMEAL_RESERVE_SCRIPT_HASH, RESERVE_SCRIPT_ADDRESS } from "../utils/script_constants";
import { boxById, boxByTokenId, currentHeight } from './explorer';
import { encodeHexConst, encodeLong, encodeLongArray } from './serializer';
import { createTransaction, getBoxSelection, parseUtxo, setBoxRegisterByteArray, verifyTransactionIO } from './wasm';
import { getAllUtxos, getTokenUtxos, getUtxos, isValidWalletAddress, walletSignTx } from './wallet.js';
let ergolib = import('ergo-lib-wasm-browser');



export async function burnGameTokenReserve(boxId) {
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        var utxos = await getUtxos(TX_FEE);
        const reservebox = await boxById(boxId);
        const reserveboxFixed = parseUtxo(reservebox);
        utxos.push(reserveboxFixed);
        var tokens = new (await ergolib).Tokens();
        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const reserveTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(reserveboxFixed.assets[0].amount));
        tokens.add(new (await ergolib).Token(
            gameTokenId,
            reserveTokenAmount)
        );

        const boxSelection = await getBoxSelection(utxos, MIN_NANOERG_BOX_VALUE / NANOERG_TO_ERG, tokens);
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
        const returnBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(GAME_ADDRESS)),
            creationHeight);
        returnBoxBuilder.add_token(gameTokenId, reserveTokenAmount);
        try {
            outputCandidates.add(returnBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, GAME_ADDRESS, utxos);

        console.log("correctTx", correctTx);
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }

    return null;
}


export async function burnOatmealReserve(boxId) {
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        var utxos = await getUtxos(TX_FEE);
        const reservebox = await boxById(boxId);
        const reserveboxFixed = parseUtxo(reservebox);
        utxos.push(reserveboxFixed);
        var tokens = new (await ergolib).Tokens();
        const oatmealTokenId = (await ergolib).TokenId.from_str(OATMEAL_TOKEN_ID);
        const reserveTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(reserveboxFixed.assets[0].amount));
        tokens.add(new (await ergolib).Token(
            oatmealTokenId,
            reserveTokenAmount)
        );

        const boxSelection = await getBoxSelection(utxos, MIN_NANOERG_BOX_VALUE / NANOERG_TO_ERG, tokens);
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
        const returnBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(GAME_ADDRESS)),
            creationHeight);
        returnBoxBuilder.add_token(oatmealTokenId, reserveTokenAmount);
        try {
            outputCandidates.add(returnBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, GAME_ADDRESS, utxos);

        console.log("correctTx", correctTx);
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }

    return null;
}

export async function updateConfigurationBox() {
    console.log("updateConf");
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        const creationHeight = await currentHeight();
        // select the inputs
        var utxos = await getAllUtxos();
        console.log("utxos", utxos);
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        console.log("ConfigItem componentDidMount currentConfigBox", currentConfigBox);
        if (currentConfigBox.length > 0) {
            utxos.push(currentConfigBox[0]);
        }
        console.log("utxos2", utxos);

        var tokens = new (await ergolib).Tokens();
        const configTokenId = (await ergolib).TokenId.from_str(CONFIG_TOKEN_ID);
        const configTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));
        tokens.add(new (await ergolib).Token(
            configTokenId,
            configTokenAmount)
        );
        const boxSelection = await getBoxSelection(utxos, MIN_NANOERG_BOX_VALUE / NANOERG_TO_ERG, tokens);
        console.log("boxSelection", boxSelection);

        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        // prepare the new config box
        const configValue = MIN_NANOERG_BOX_VALUE.toString();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(configValue));
        const configBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(CONFIG_SCRIPT_ADDRESS)),
            creationHeight);
        configBoxBuilder.set_register_value(4, await encodeHexConst(BLOB_SCRIPT_HASH));
        configBoxBuilder.set_register_value(5, await encodeHexConst(GAME_SCRIPT_HASH));
        const gameConf = [BLOB_EXCHANGE_FEE, TX_FEE, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, MAX_POWER_DIFF, OATMEAL_PRICE];
        configBoxBuilder.set_register_value(6, await encodeLongArray(gameConf));
        configBoxBuilder.set_register_value(7, await encodeHexConst(OATMEAL_RESERVE_SCRIPT_HASH));

        const scriptHashArray = [BLOB_SCRIPT_HASH, GAME_SCRIPT_HASH, OATMEAL_RESERVE_SCRIPT_HASH];
        const registerValue8 = scriptHashArray.map((val) => {
            return new Uint8Array(Buffer.from(val, 'hex'))
        });
        configBoxBuilder.set_register_value(8, (await ergolib).Constant.from_coll_coll_byte(registerValue8));

        configBoxBuilder.add_token(configTokenId, configTokenAmount);
        try {
            outputCandidates.add(configBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        const correctTx = await createTransaction(boxSelection, outputCandidates, [], GAME_ADDRESS, utxos);

        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    }
}

export async function mintGameTokenReserve(reserveName, reserveTokenAmount, reserveIniIdentifier) {
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        console.log("this.state.reserveTokenAmount", reserveTokenAmount)
        var utxos = await getTokenUtxos(reserveTokenAmount, GAME_TOKEN_ID);
        console.log("utxos", utxos)
        var utxos1 = await getUtxos(TX_FEE + MIN_NANOERG_BOX_VALUE);

        utxos = utxos.concat(utxos1).filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.boxId === value.boxId
            )));

        console.log(utxos);
        var tokens = new (await ergolib).Tokens();

        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const reserveTokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(reserveTokenAmount));
        tokens.add(new (await ergolib).Token(
            gameTokenId,
            reserveTokenAmountWASM)
        );
        const boxSelection = await getBoxSelection(utxos, MIN_NANOERG_BOX_VALUE / NANOERG_TO_ERG, tokens);

        // prepare the reserve output box
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const reserveValue = MIN_NANOERG_BOX_VALUE.toString();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(reserveValue));
        const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(RESERVE_SCRIPT_ADDRESS)),
            creationHeight);
        await setBoxRegisterByteArray(reserveBoxBuilder, 4, reserveName);
        const blobIniConf = [INI_BLOB_ATT_LEVEL, INI_BLOB_DEF_LEVEL, INI_BLOB_GAME, INI_BLOB_VICTORY];
        reserveBoxBuilder.set_register_value(5, await encodeLongArray(blobIniConf));
        const blobPrice = [BLOB_PRICE, BLOB_MINT_FEE];
        reserveBoxBuilder.set_register_value(6, await encodeLongArray(blobPrice));
        reserveBoxBuilder.add_token(gameTokenId, reserveTokenAmountWASM);
        reserveBoxBuilder.set_register_value(7, (await encodeLong(reserveIniIdentifier)))
        try {
            outputCandidates.add(reserveBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        // Create the transaction
        const correctTx = await createTransaction(boxSelection, outputCandidates, [], GAME_ADDRESS, utxos);

        console.log("final transaction", correctTx)

        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }
    return null;
}

export async function mintOatmealReserve(reserveAddress, oatmealReserveTokenAmount) {
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        var utxos = await getAllUtxos();
        console.log(utxos);
        var tokens = new (await ergolib).Tokens();
        console.log("this.state.oatmealReserveTokenAmount", oatmealReserveTokenAmount)
        const oatmealTokenId = (await ergolib).TokenId.from_str(OATMEAL_TOKEN_ID);
        const reserveTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(oatmealReserveTokenAmount));
        tokens.add(new (await ergolib).Token(
            oatmealTokenId,
            reserveTokenAmount)
        );
        const boxSelection = await getBoxSelection(utxos, MIN_NANOERG_BOX_VALUE / NANOERG_TO_ERG, tokens);

        // prepare the reserve output box
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const reserveValue = MIN_NANOERG_BOX_VALUE.toString();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(reserveValue));
        const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(reserveAddress)),
            creationHeight);
        reserveBoxBuilder.add_token(oatmealTokenId, reserveTokenAmount);
        try {
            outputCandidates.add(reserveBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        // Create the transaction
        const correctTx = await createTransaction(boxSelection, outputCandidates, [], GAME_ADDRESS, utxos);

        console.log("final transaction", correctTx)

        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }
    return null;
}