import { errorAlert, promptErgAmount, waitingAlert } from '../utils/Alerts';
import { BLOBINATOR_DEFI_MODULO_WIN, BLOBINATOR_DEFI_TOK_NUM, BLOBINATOR_FEE, BLOBINATOR_MIN_VALUE, BLOBINATOR_TOKEN_ID, BLOB_EXCHANGE_FEE, BLOB_MINT_FEE, BLOB_PRICE, CONFIG_TOKEN_ID, GAME_ADDRESS, GAME_TOKEN_ID, INI_BLOB_ARMOR_LVL, INI_BLOB_ATT_LEVEL, INI_BLOB_DEF_LEVEL, INI_BLOB_GAME, INI_BLOB_VICTORY, INI_BLOB_WEAPON_LVL, INI_BLOB_WEAPON_TYPE, MAX_POWER_DIFF, MIN_NANOERG_BOX_VALUE, NANOERG_TO_ERG, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, OATMEAL_PRICE, OATMEAL_TOKEN_ID, SPICY_OATMEAL_TOKEN_ID, TX_FEE } from '../utils/constants';
import { BLOB_ARMORS, BLOB_WEAPONS, WEAPONS_UPGRADE_PRICES } from '../utils/items_constants';
import { BLOBINATOR_FEE_SCRIPT_ADDRESS, BLOBINATOR_FEE_SCRIPT_HASH, BLOBINATOR_RESERVE_SCRIPT_ADDRESS, BLOBINATOR_RESERVE_SCRIPT_HASH, BLOBINATOR_SCRIPT_ADDRESS, BLOBINATOR_SCRIPT_HASH, BLOB_SCRIPT_HASH, BURN_ALL_SCRIPT_ADDRESS, BURN_ALL_SCRIPT_HASH, CONFIG_SCRIPT_ADDRESS, GAME_SCRIPT_HASH, OATMEAL_RESERVE_SCRIPT_ADDRESS, OATMEAL_RESERVE_SCRIPT_HASH, RESERVE_SCRIPT_ADDRESS } from "../utils/script_constants";
import { boxById, boxByTokenId, currentHeight, getUnspentBoxesForAddressUpdated } from './explorer';
import { encodeIntArray, encodeLong, encodeLongArray } from './serializer';
import { createTransaction, parseUtxo, setBoxRegisterByteArray, verifyTransactionIO } from './wasm';
import { getTokenUtxos, getUtxos, isValidWalletAddress, walletSignTx } from './wallet.js';
let ergolib = import('ergo-lib-wasm-browser');



export async function burnGameTokenReserve(boxId) {
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        var utxos = await getUtxos(TX_FEE + MIN_NANOERG_BOX_VALUE);
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

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

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


export async function burnReserve(boxId) {
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        var utxos = await getUtxos(TX_FEE + MIN_NANOERG_BOX_VALUE);
        const reservebox = await boxById(boxId);
        const reserveboxFixed = parseUtxo(reservebox);
        utxos.push(reserveboxFixed);

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(MIN_NANOERG_BOX_VALUE.toString()));
        const returnBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(GAME_ADDRESS)),
            creationHeight);
        for (const asset of reserveboxFixed.assets) {
            const tokenIdWASM = (await ergolib).TokenId.from_str(asset.tokenId);
            const tokenAmountWASM = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(asset.amount.toString()));
            returnBoxBuilder.add_token(tokenIdWASM, tokenAmountWASM);
        }

        try {
            outputCandidates.add(returnBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, GAME_ADDRESS, utxos);

        console.log("correctTx", correctTx);
        await walletSignTx(alert, correctTx, address);
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
        var utxos = await getUtxos(TX_FEE + MIN_NANOERG_BOX_VALUE);
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        if (currentConfigBox.length > 0) {
            utxos.push(currentConfigBox[0]);
        }

        var tokens = new (await ergolib).Tokens();
        const configTokenId = (await ergolib).TokenId.from_str(CONFIG_TOKEN_ID);
        const configTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));
        tokens.add(new (await ergolib).Token(
            configTokenId,
            configTokenAmount)
        );

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        // prepare the new config box
        const configValue = MIN_NANOERG_BOX_VALUE.toString();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(configValue));
        const configBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(CONFIG_SCRIPT_ADDRESS)),
            creationHeight);
        const scriptHashArray = [
            BLOB_SCRIPT_HASH,
            GAME_SCRIPT_HASH,
            OATMEAL_RESERVE_SCRIPT_HASH,
            BURN_ALL_SCRIPT_HASH,
            BLOBINATOR_FEE_SCRIPT_HASH,
            BLOBINATOR_SCRIPT_HASH,
            BLOBINATOR_RESERVE_SCRIPT_HASH,
        ];
        const registerValue4 = scriptHashArray.map((val) => {
            return new Uint8Array(Buffer.from(val, 'hex'))
        });
        configBoxBuilder.set_register_value(4, (await ergolib).Constant.from_coll_coll_byte(registerValue4));
        const gameConf = [
            BLOB_EXCHANGE_FEE,
            TX_FEE,
            NUM_OATMEAL_TOKEN_LOSER,
            NUM_OATMEAL_TOKEN_WINNER,
            MAX_POWER_DIFF,
            OATMEAL_PRICE,
            BLOBINATOR_FEE,
            BLOBINATOR_MIN_VALUE,
            BLOBINATOR_DEFI_TOK_NUM,
            BLOBINATOR_DEFI_MODULO_WIN,
        ];
        configBoxBuilder.set_register_value(5, await encodeLongArray(gameConf));
        var armorConf = [];
        for (const armor of BLOB_ARMORS) {
            armorConf.push([armor.oatmeal_price.toString(), armor.attack_power.toString(), armor.defense_power.toString()]);
        }
        configBoxBuilder.set_register_value(6, await encodeLongArray(armorConf.flat()));
        configBoxBuilder.set_register_value(7, await encodeLongArray(WEAPONS_UPGRADE_PRICES));
        var weaponPowers = [];
        for (const weapon of BLOB_WEAPONS) {
            weaponPowers.push([weapon.attack_power.toString(), weapon.defense_power.toString()]);
        }
        configBoxBuilder.set_register_value(8, await encodeIntArray(weaponPowers.flat()));
        //const testArray = [(await ergolib).array_as_tuple(["0", "2", "3"]),
        //(await ergolib).array_as_tuple(["4", "5", "6"]),
        //(await ergolib).array_as_tuple(["7", "8", "9"])];
        //console.log("R9 type", (await ergolib).Constant.from_js(testArray).dbg_tpe())
        //configBoxBuilder.set_register_value(9, (await ergolib).Constant.from_js(testArray));
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

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

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
        const blobIniConf = [INI_BLOB_ATT_LEVEL, INI_BLOB_DEF_LEVEL, INI_BLOB_GAME, INI_BLOB_VICTORY, INI_BLOB_ARMOR_LVL, INI_BLOB_WEAPON_TYPE, INI_BLOB_WEAPON_LVL];
        reserveBoxBuilder.set_register_value(5, await encodeIntArray(blobIniConf));
        const blobPrices = [BLOB_PRICE, BLOB_MINT_FEE];
        reserveBoxBuilder.set_register_value(6, await encodeLongArray(blobPrices));
        reserveBoxBuilder.add_token(gameTokenId, reserveTokenAmountWASM);
        reserveBoxBuilder.set_register_value(7, (await encodeLong(reserveIniIdentifier)));
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
        var utxos = await getUtxos(TX_FEE + MIN_NANOERG_BOX_VALUE);
        var utxos1 = await getTokenUtxos(oatmealReserveTokenAmount, OATMEAL_TOKEN_ID);
        var utxos2 = [];
        console.log("reserve address", reserveAddress, OATMEAL_RESERVE_SCRIPT_ADDRESS,)
        if (reserveAddress === OATMEAL_RESERVE_SCRIPT_ADDRESS) {
            utxos2 = await getTokenUtxos(oatmealReserveTokenAmount, SPICY_OATMEAL_TOKEN_ID);
        }
        utxos = utxos.concat(utxos1).concat(utxos2).filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.boxId === value.boxId
            )));;
        console.log(utxos);
        var tokens = new (await ergolib).Tokens();
        console.log("this.state.oatmealReserveTokenAmount", oatmealReserveTokenAmount)
        const oatmealTokenId = (await ergolib).TokenId.from_str(OATMEAL_TOKEN_ID);
        const reserveTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(oatmealReserveTokenAmount));
        tokens.add(new (await ergolib).Token(
            oatmealTokenId,
            reserveTokenAmount)
        );
        var spicyOatmealTokenId = "";
        if (reserveAddress === OATMEAL_RESERVE_SCRIPT_ADDRESS) {
            spicyOatmealTokenId = (await ergolib).TokenId.from_str(SPICY_OATMEAL_TOKEN_ID);
            tokens.add(new (await ergolib).Token(
                spicyOatmealTokenId,
                reserveTokenAmount)
            );
        }

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

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
        if (reserveAddress === OATMEAL_RESERVE_SCRIPT_ADDRESS) {
            reserveBoxBuilder.add_token(spicyOatmealTokenId, reserveTokenAmount);
        }
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


export async function mintBlobinatorReserve(blobinatorReserveTokenAmount) {
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(GAME_ADDRESS)) {
        var utxos = await getUtxos(TX_FEE + MIN_NANOERG_BOX_VALUE);
        var utxos1 = await getTokenUtxos(blobinatorReserveTokenAmount, BLOBINATOR_TOKEN_ID);
        utxos = utxos.concat(utxos1).filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.boxId === value.boxId
            )));;
        var tokens = new (await ergolib).Tokens();
        console.log("this.state.blobinatorReserveTokenAmount", blobinatorReserveTokenAmount)
        const blobinatorTokenId = (await ergolib).TokenId.from_str(BLOBINATOR_TOKEN_ID);
        const reserveTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(blobinatorReserveTokenAmount));
        tokens.add(new (await ergolib).Token(
            blobinatorTokenId,
            reserveTokenAmount)
        );

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

        // prepare the reserve output box
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const reserveValue = MIN_NANOERG_BOX_VALUE.toString();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(reserveValue));
        const reserveBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_RESERVE_SCRIPT_ADDRESS)),
            creationHeight);
        reserveBoxBuilder.add_token(blobinatorTokenId, reserveTokenAmount);
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
            await walletSignTx(alert, correctTx, GAME_ADDRESS);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to the wallet")
    }
    return null;
}

export async function adminInvokeBlobinator(amount) {
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(GAME_ADDRESS)) {
        var utxos = await getUtxos(amount + TX_FEE);
        var utxos1 = await getTokenUtxos(1, BLOBINATOR_TOKEN_ID);
        utxos = utxos.concat(utxos1).filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.boxId === value.boxId
            )));;
        var tokens = new (await ergolib).Tokens();
        const blobinatorTokenId = (await ergolib).TokenId.from_str(BLOBINATOR_TOKEN_ID);
        const blobinatorTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("1"));
        tokens.add(new (await ergolib).Token(
            blobinatorTokenId,
            blobinatorTokenAmount)
        );

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

        // prepare the blobinator output box
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const blobinatorValue = amount.toString();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobinatorValue));
        const blobinatorBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_SCRIPT_ADDRESS)),
            creationHeight);
        blobinatorBoxBuilder.add_token(blobinatorTokenId, blobinatorTokenAmount);
        await setBoxRegisterByteArray(blobinatorBoxBuilder, 4, "");
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
            console.log(`building error: ${e}`);
            throw e;
        }
        // Create the transaction
        const correctTx = await createTransaction(boxSelection, outputCandidates, [], GAME_ADDRESS, utxos);

        console.log("final transaction", correctTx)

        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, GAME_ADDRESS);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to the wallet")
    }
    return null;
}

export async function adminCollectBurnFee() {
    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(GAME_ADDRESS)) {
        var utxos = await getUnspentBoxesForAddressUpdated(BURN_ALL_SCRIPT_ADDRESS, 500);

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

        // prepare the blobinator output box
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();

        // Create the transaction
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, GAME_ADDRESS, utxos);

        // Burn the tokens
        correctTx.outputs[0].assets = [];
        console.log("final transaction", correctTx)

        await walletSignTx(alert, correctTx, GAME_ADDRESS);

    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to the wallet")
    }
    return null;
}



export async function donateBlobinatorFee() {
    const amountFloat = await promptErgAmount("Donate for the Blobinator", "Give ERG for the Blobinator to be invoked", "Donate", 0.01);
    const amountNano = Math.round(amountFloat * NANOERG_TO_ERG)
    const alert = waitingAlert("Preparing the transaction...");
    const address = localStorage.getItem("address") ?? "";

    if (await isValidWalletAddress(address)) {
        var utxos = await getUtxos(TX_FEE + amountNano);
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

        // prepare the donation output box
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const boxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(amountNano.toString()));
        const donateBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            boxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOBINATOR_FEE_SCRIPT_ADDRESS)),
            creationHeight);
        try {
            outputCandidates.add(donateBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        // Create the transaction
        console.log("address", address)
        const correctTx = await createTransaction(boxSelection, outputCandidates, [], address, utxos);

        console.log("final transaction", correctTx)
        await walletSignTx(alert, correctTx, address);
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to the wallet")
    }
    return null;
}
