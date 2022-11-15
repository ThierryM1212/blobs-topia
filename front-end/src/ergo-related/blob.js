import JSONBigInt from 'json-bigint';
import { errorAlert, promptErgAmount, promptUpgradeItem, promptWeaponType, waitingAlert } from "../utils/Alerts";
import { BLOBINATOR_DEFI_TOK_NUM, BLOB_ERG_MIN_VALUE, BLOB_EXCHANGE_FEE, BLOB_PRICE, CONFIG_TOKEN_ID, GAME_ADDRESS, GAME_TOKEN_ID, MIN_NANOERG_BOX_VALUE, NANOERG_TO_ERG, OATMEAL_TOKEN_ID, SPICY_OATMEAL_TOKEN_ID, TX_FEE } from "../utils/constants";
import { BLOB_ARMORS, WEAPONS_UPGRADE_PRICES } from '../utils/items_constants';
import { BLOB_REQUEST_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS, BURN_ALL_SCRIPT_ADDRESS, OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS } from "../utils/script_constants";
import { boxByTokenId, currentHeight } from "./explorer";
import { encodeIntArray, encodeLong } from './serializer';
import { addSimpleOutputBox, createTransaction, getUtxosListValue, parseUtxo, setBoxRegisterByteArray, verifyTransactionIO } from "./wasm";
import { getBalance, getTokenUtxos, getUtxos, isValidWalletAddress, walletSignTx } from "./wallet.js";
let ergolib = import('ergo-lib-wasm-browser');



export async function refundRequest(blobRequestBoxJSON) {
    const creationHeight = await currentHeight();
    const address = localStorage.getItem('address');
    var alert = waitingAlert("Preparing the refund transaction...");
    const blobRequestIniValueNano = blobRequestBoxJSON.value;
    const walletOK = await isValidWalletAddress(address);
    if (walletOK) {
        const utxos = [blobRequestBoxJSON];
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        addSimpleOutputBox(outputCandidates, (blobRequestIniValueNano - TX_FEE) / NANOERG_TO_ERG, address, creationHeight);
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, address, utxos);
        console.log("correctTx", correctTx)
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        alert = errorAlert("No wallet found")
    }
}

export async function addWidthDrawBlob(mode, blobBoxJSON) {
    console.log("addWidthDraw mode", mode);
    const creationHeight = await currentHeight();
    var amountFloat = 0.0;
    if (mode === "add") {
        amountFloat = await promptErgAmount("Deposit", "Amount to deposit in the blob.", "Deposit", 0.01);
    } else {
        amountFloat = await promptErgAmount("Withdraw", "Amount to withdraw from the blob.", "Withdraw", 0.01);
    }

    const amountNano = Math.round(amountFloat * NANOERG_TO_ERG);
    console.log("addWidthDraw amountFloat", amountFloat);
    const address = localStorage.getItem('address');
    var alert = waitingAlert("Preparing the transaction...");
    var dAppFeeNano = Math.max(Math.round(amountNano * BLOB_EXCHANGE_FEE / 1000), MIN_NANOERG_BOX_VALUE);
    const blobIniValueNano = parseInt(blobBoxJSON.value);
    var blobOutValueNano = blobIniValueNano;
    if (mode === "add") {
        blobOutValueNano = blobIniValueNano + amountNano;
    } else {
        blobOutValueNano = blobIniValueNano - amountNano;
    }
    if (blobOutValueNano < BLOB_ERG_MIN_VALUE) {
        alert = errorAlert("Not enough ERG in the Blob after operation, min value " + BLOB_ERG_MIN_VALUE + " nanoERG");
        return;
    }
    console.log("addWidthDraw blobOutValueNano", blobOutValueNano);

    const walletOK = await isValidWalletAddress(address);
    if (walletOK) {
        var utxos = [];
        if (mode === "add") {
            console.log("addWidthDraw amount", amountNano + dAppFeeNano + MIN_NANOERG_BOX_VALUE);
            utxos = await getUtxos(amountNano + dAppFeeNano + MIN_NANOERG_BOX_VALUE);
        } else {
            utxos = await getUtxos(MIN_NANOERG_BOX_VALUE + TX_FEE + dAppFeeNano);
        }

        utxos.unshift(blobBoxJSON);
        console.log("utxos value: " + getUtxosListValue(utxos))
        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);

        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();

        // Blob Box
        const blobBoxOutWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blobBoxJSON));
        const blobboxOutValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobOutValueNano.toString()));
        const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            blobboxOutValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
            creationHeight);
        blobBoxBuilder.set_register_value(4, blobBoxOutWASM.register_value(4));
        blobBoxBuilder.set_register_value(5, blobBoxOutWASM.register_value(5));
        blobBoxBuilder.set_register_value(6, blobBoxOutWASM.register_value(6));
        blobBoxBuilder.set_register_value(7, blobBoxOutWASM.register_value(7));
        blobBoxBuilder.set_register_value(8, blobBoxOutWASM.register_value(8));
        blobBoxBuilder.set_register_value(9, blobBoxOutWASM.register_value(9));
        blobBoxBuilder.add_token(gameTokenId, blobTokenAmount);
        try {
            outputCandidates.add(blobBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }

        // dApp fee box
        addSimpleOutputBox(outputCandidates, dAppFeeNano / NANOERG_TO_ERG, GAME_ADDRESS, creationHeight);

        if (mode === "widthdraw") {
            addSimpleOutputBox(outputCandidates, amountNano / NANOERG_TO_ERG, address, creationHeight);
        }

        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, address, utxos);

        console.log("correctTx", correctTx)
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    }
    //alert.close()

}

export async function killBlob(blobBoxJSON) {
    console.log("boxId", blobBoxJSON.boxId);
    const address = localStorage.getItem('address');

    const alert = waitingAlert("Preparing the transaction...");
    if (await isValidWalletAddress(address)) {
        //var utxos = await getAllUtxos();
        //const blobBox = await boxByBoxId(this.state.boxId);
        //const blobBoxFixed = parseUtxo(blobBoxJSON);
        //console.log("blobBoxFixed", blobBoxFixed);
        const utxos = [blobBoxJSON];
        const creationHeight = await currentHeight();
        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();

        // dApp return box
        const blobBoxInWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blobBoxJSON));
        var dappReturnValue = Math.round(blobBoxJSON.value * BLOB_EXCHANGE_FEE / 1000);
        if (dappReturnValue < MIN_NANOERG_BOX_VALUE) {
            dappReturnValue = MIN_NANOERG_BOX_VALUE;
        }
        //console.log("dappReturnValue", dappReturnValue);
        const dappReturnValueBox = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(dappReturnValue.toString()));;
        const returnBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            dappReturnValueBox,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BURN_ALL_SCRIPT_ADDRESS)),
            creationHeight);
        returnBoxBuilder.add_token(gameTokenId, blobTokenAmount);
        returnBoxBuilder.set_register_value(4, blobBoxInWASM.register_value(4));
        returnBoxBuilder.set_register_value(5, blobBoxInWASM.register_value(5));
        returnBoxBuilder.set_register_value(6, blobBoxInWASM.register_value(6));
        returnBoxBuilder.set_register_value(7, blobBoxInWASM.register_value(7));
        returnBoxBuilder.set_register_value(8, blobBoxInWASM.register_value(8));
        returnBoxBuilder.set_register_value(9, blobBoxInWASM.register_value(9));
        try {
            outputCandidates.add(returnBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }

        // user return box
        const userReturnValue = blobBoxJSON.value - dappReturnValue - TX_FEE;
        addSimpleOutputBox(outputCandidates, parseFloat(userReturnValue / NANOERG_TO_ERG), address, creationHeight);
        const currentConfigBoxes = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBoxes, GAME_ADDRESS, utxos);
        console.log("correctTx fixed", correctTx)
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }
    return null;
}

export async function buyBlob(blobBoxJSON) {
    console.log("buyBlob");
    const creationHeight = await currentHeight();
    const amountNano = parseInt(blobBoxJSON.additionalRegisters.R8.renderedValue);
    const dAppFeeNano = Math.max(Math.round(amountNano * 2 * BLOB_EXCHANGE_FEE / 1000), MIN_NANOERG_BOX_VALUE);

    const address = localStorage.getItem('address');
    var alert = waitingAlert("Preparing the transaction...");
    const blobIniValueNano = blobBoxJSON.value;

    const walletOK = await isValidWalletAddress(address);
    if (walletOK) {
        var utxos = await getUtxos(amountNano + TX_FEE + dAppFeeNano);
        utxos.unshift(parseUtxo(blobBoxJSON));
        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();

        // BLOB BOX
        const blobBoxInWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blobBoxJSON));
        const blobboxOutValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str(blobIniValueNano.toString()));
        const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            blobboxOutValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
            creationHeight);
        blobBoxBuilder.set_register_value(4, blobBoxInWASM.register_value(4));
        blobBoxBuilder.set_register_value(5, blobBoxInWASM.register_value(5));
        const newOwnerSigmaProp = (await ergolib).Constant.from_ecpoint_bytes(
            (await ergolib).Address.from_base58(address).to_bytes(0x00).subarray(1, 34)
        );
        console.log((await ergolib).Address.from_base58(address).to_bytes(0x00));
        blobBoxBuilder.set_register_value(6, newOwnerSigmaProp);
        blobBoxBuilder.set_register_value(7, (await encodeLong("0")));
        blobBoxBuilder.set_register_value(8, (await encodeLong("0")));
        blobBoxBuilder.set_register_value(9, blobBoxInWASM.register_value(9));
        blobBoxBuilder.add_token(gameTokenId, blobTokenAmount);
        try {
            outputCandidates.add(blobBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }

        // dApp fee box
        addSimpleOutputBox(outputCandidates, dAppFeeNano / NANOERG_TO_ERG, GAME_ADDRESS, creationHeight);

        // payment to old owner box
        const preOwnerScript = blobBoxInWASM.register_value(6).encode_to_base16();
        const preOwnerAddress = (await ergolib).Address.recreate_from_ergo_tree((await ergolib).ErgoTree.from_base16_bytes("00" + preOwnerScript)).to_base58();
        addSimpleOutputBox(outputCandidates, parseFloat(amountNano / NANOERG_TO_ERG), preOwnerAddress, creationHeight);

        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, address, utxos);

        console.log("correctTx", correctTx)
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    }
    //alert.close()
}

export async function setBlobStatus(mode, blobBoxJSON) {
    console.log("setBlobStatus mode", mode);
    const creationHeight = await currentHeight();
    var amountNano = 0;
    if (mode === 'fight') { 
        const amountFloat = await promptErgAmount('Fight a blob', "Choose an amount for the fight bet, both blob fighting needs to have the same bet.", "Fight", 0.1);
        amountNano = Math.round(amountFloat * NANOERG_TO_ERG);
    } else if (mode === 'sell') {
        const amountFloat = await promptErgAmount('Sell the blob', "Choose an amount to sell the blob and its content.", "Sell", 0.01);
        amountNano = Math.round(amountFloat * NANOERG_TO_ERG);
    }

    const blobIniValueNano = blobBoxJSON.value;
    const address = localStorage.getItem('address');
    var alert = waitingAlert("Preparing the transaction...");

    const walletOK = await isValidWalletAddress(address);
    if (walletOK) {
        var utxos = [];
        utxos = await getUtxos(MIN_NANOERG_BOX_VALUE + TX_FEE);
        if (mode === 'blobinator') {
            const utxos1 = await getTokenUtxos(BLOBINATOR_DEFI_TOK_NUM, SPICY_OATMEAL_TOKEN_ID);
            utxos = utxos.concat(utxos1).filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.boxId === value.boxId
                )));;
        }
        utxos.unshift(parseUtxo(blobBoxJSON));
        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();
        const spicyOatmealTokenId = (await ergolib).TokenId.from_str(SPICY_OATMEAL_TOKEN_ID);
        const spicyOatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str(BLOBINATOR_DEFI_TOK_NUM.toString()));

        // Blob Box
        var blobStatus = '0', blobStatusValue = '0';
        if (mode === 'fight') {
            blobStatus = '1';
            blobStatusValue = amountNano.toString();
            const maxFightValueNano = parseInt(blobIniValueNano) - BLOB_ERG_MIN_VALUE;
            console.log("maxFightValueNano", maxFightValueNano, amountNano);
            if (amountNano > maxFightValueNano) {
                errorAlert("Not enough ERG in the blob to fight, maximum fight value: " + (maxFightValueNano / NANOERG_TO_ERG).toFixed(4) + " ERG");
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
        try {
            var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, address, utxos);
        } catch (e) {
            console.error(e)
            errorAlert("Error updating blob status", e.toString())
            return;
        }
        console.log("correctTx", correctTx)
        if (correctTx) {
            await walletSignTx(alert, correctTx, address);
        }
    }
}

export async function createBlobRequest(name, color1, color2, eyes_pos, mouth_type, svgPath) {
    console.log("createBlobRequest")
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    const walletOK = await isValidWalletAddress(address);
    if (walletOK) {
        var utxos = await getUtxos(BLOB_PRICE + TX_FEE);
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();

        // Blob Box
        const blobBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((BLOB_PRICE).toString()));
        const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            blobBoxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_REQUEST_SCRIPT_ADDRESS)), // will be changed
            creationHeight);
        const blobDesc = name + ":" + color1.substring(1) + ":" + color2.substring(1) + ":" + eyes_pos + ":" + mouth_type + ":" + svgPath;
        await setBoxRegisterByteArray(blobBoxBuilder, 4, blobDesc);
        const ownerSigmaProp = (await ergolib).Constant.from_ecpoint_bytes(
            (await ergolib).Address.from_base58(address).to_bytes(0x00).subarray(1, 34)
        );
        blobBoxBuilder.set_register_value(5, ownerSigmaProp);
        try {
            outputCandidates.add(blobBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        var correctTx = await createTransaction(boxSelection, outputCandidates, [], address, utxos);
        console.log("final transaction", correctTx)
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }
    return null;
}

export async function feedBlob(blobBoxJSON, mode, var1 = 0, var2 = 0) {
    var infoArray = JSON.parse(blobBoxJSON.additionalRegisters.R5.renderedValue);
    var totalOatmealTokens = 0;
    if (mode === 'feed') {
        totalOatmealTokens = var1 + var2;
        infoArray[0] = infoArray[0] + var2; // Attack
        infoArray[1] = infoArray[1] + var1; // Defense
    }
    if (mode === 'armor') {
        var currentArmorLvl = infoArray[4];
        if (currentArmorLvl + 1 > BLOB_ARMORS.length) {
            errorAlert("Already at max level of the armor")
            return;
        }
        totalOatmealTokens = BLOB_ARMORS[currentArmorLvl + 1].oatmeal_price;
        infoArray[4] = infoArray[4] + 1;
        //const res = await confirmAlert("Upgrade blob armor to level " + infoArray[4],
        //    "Price: " + totalOatmealTokens + " Oatmeal", "OK", "No")
        const res = await promptUpgradeItem('armor', currentArmorLvl);
        if (!res.isConfirmed) {
            return;
        }
    }
    if (mode === 'choose weapon' || (mode === 'upgrade weapon')) {
        const currentWeaponType = infoArray[5];
        const currentWeaponLvl = infoArray[6];

        if (mode === 'choose weapon') {
            infoArray[5] = await promptWeaponType([1, 2, 3].filter(i => i !== currentWeaponType));
            infoArray[6] = 0;
            totalOatmealTokens = WEAPONS_UPGRADE_PRICES[0];
        }

        if (mode === 'upgrade weapon') {
            if (currentWeaponType === 0) {
                errorAlert("Cannot upgrade initial weapon")
                return;
            }
            if (currentWeaponLvl >= 3) {
                errorAlert("Already at max level of the weapon")
                return;
            }
            const res = await promptUpgradeItem('weapon', currentWeaponLvl, currentWeaponType);
            if (!res.isConfirmed) {
                return;
            }
            infoArray[6] = currentWeaponLvl + 1;
            totalOatmealTokens = WEAPONS_UPGRADE_PRICES[currentWeaponLvl + 1];
        }
    }

    const tokenBalance = await getBalance(OATMEAL_TOKEN_ID);
    if (tokenBalance < totalOatmealTokens) {
        errorAlert("Not enough Oatmeal tokens, only " + tokenBalance.toString() + " available")
        return;
    }

    const creationHeight = await currentHeight();
    const address = localStorage.getItem('address');
    var alert = waitingAlert("Preparing the transaction...");
    const walletOK = await isValidWalletAddress(address);
    if (walletOK) {
        var utxos = [];
        var utxos2 = [];
        try {
            utxos = await getTokenUtxos(totalOatmealTokens, OATMEAL_TOKEN_ID);
            utxos2 = await getUtxos(TX_FEE + MIN_NANOERG_BOX_VALUE);
        } catch (e) {
            console.log(e);
            errorAlert(e.toString());
            return;
        }
        utxos = utxos.concat(utxos2).filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.boxId === value.boxId
            )));
        utxos.unshift(parseUtxo(blobBoxJSON));

        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();

        const gameTokenId = (await ergolib).TokenId.from_str(GAME_TOKEN_ID);
        const blobTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str("2"));

        const oatmealTokenId = (await ergolib).TokenId.from_str(OATMEAL_TOKEN_ID);
        const oatmealTokenAmount = (await ergolib).TokenAmount.from_i64((await ergolib).I64.from_str((totalOatmealTokens).toString()));

        // BLOB with stat increased
        const blobBoxInWASM = (await ergolib).ErgoBox.from_json(JSONBigInt.stringify(blobBoxJSON));
        const blobBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            blobBoxInWASM.value(),
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BLOB_SCRIPT_ADDRESS)),
            creationHeight);
        blobBoxBuilder.set_register_value(4, blobBoxInWASM.register_value(4));
        blobBoxBuilder.set_register_value(5, await encodeIntArray(infoArray));
        blobBoxBuilder.set_register_value(6, blobBoxInWASM.register_value(6));
        blobBoxBuilder.set_register_value(7, blobBoxInWASM.register_value(7));
        blobBoxBuilder.set_register_value(8, blobBoxInWASM.register_value(8));
        blobBoxBuilder.set_register_value(9, blobBoxInWASM.register_value(9));
        blobBoxBuilder.add_token(gameTokenId, blobTokenAmount);
        try {
            outputCandidates.add(blobBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }

        // Oatmeal burn box
        const oatMealReturnBox = new (await ergolib).ErgoBoxCandidateBuilder(
            (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((MIN_NANOERG_BOX_VALUE).toString())),
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(BURN_ALL_SCRIPT_ADDRESS)),
            creationHeight);
        oatMealReturnBox.add_token(oatmealTokenId, oatmealTokenAmount);
        try {
            outputCandidates.add(oatMealReturnBox.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }

        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var correctTx = await createTransaction(boxSelection, outputCandidates, currentConfigBox, address, utxos);
        console.log("final transaction", correctTx)
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }
    return null;
}

export async function createOatmealBuyRequest(ergAmount) {
    console.log("createBlobRequest")
    const address = localStorage.getItem('address');
    const alert = waitingAlert("Preparing the transaction...");
    const walletOK = await isValidWalletAddress(address);
    if (walletOK) {
        var utxos = await getUtxos(ergAmount);
        const inputsWASM = (await ergolib).ErgoBoxes.from_boxes_json(utxos);
        const dataListWASM = new (await ergolib).ErgoBoxAssetsDataList();
        const boxSelection = new (await ergolib).BoxSelection(inputsWASM, dataListWASM);
        const creationHeight = await currentHeight();
        const outputCandidates = (await ergolib).ErgoBoxCandidates.empty();

        // Blob Box
        const oatmealBuyBoxValue = (await ergolib).BoxValue.from_i64((await ergolib).I64.from_str((ergAmount - TX_FEE).toString()));
        const oatmealBuyBoxBuilder = new (await ergolib).ErgoBoxCandidateBuilder(
            oatmealBuyBoxValue,
            (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS)),
            creationHeight);
        const ownerSigmaProp = (await ergolib).Constant.from_ecpoint_bytes(
            (await ergolib).Address.from_base58(address).to_bytes(0x00).subarray(1, 34)
        );
        oatmealBuyBoxBuilder.set_register_value(4, ownerSigmaProp);
        try {
            outputCandidates.add(oatmealBuyBoxBuilder.build());
        } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
        }
        var correctTx = await createTransaction(boxSelection, outputCandidates, [], address, utxos);
        console.log("final transaction", correctTx)
        if (verifyTransactionIO(correctTx)) {
            await walletSignTx(alert, correctTx, address);
        }
    } else {
        errorAlert("Incorrect address", "The address provided does not match the address connected to Yoroi wallet")
    }
    return null;
}
