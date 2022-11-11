{   
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Coll[Byte]]].get(0)
    val burnAllScriptHash = configBox.R4[Coll[Coll[Byte]]].get(3)
    val txFee = configBox.R5[Coll[Long]].get(1)
    val numSpicyOatmeal = configBox.R5[Coll[Long]].get(8)
    val blobinatorModuloWin = configBox.R5[Coll[Long]].get(9)

    val valibBlob = blake2b256(INPUTS(0).propositionBytes) == blobScriptHash  &&
                    blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash

    val validEngage = if (SELF.R9[Long].get == 0L && INPUTS.size == 2 && OUTPUTS.size > 3 && valibBlob &&
                            OUTPUTS(1).propositionBytes == SELF.propositionBytes
                         ) {
        // blobinator engaged
        OUTPUTS(1).tokens.size == 2                                              &&
        OUTPUTS(1).value == SELF.value                                           &&
        OUTPUTS(1).tokens(0)._1 == BlobinatorNFTId                               &&
        OUTPUTS(1).tokens(0)._2 == 1L                                            &&
        OUTPUTS(1).tokens(1)._1 == GameTokenNFTId                                &&
        OUTPUTS(1).tokens(1)._2 == 1L                                            &&
        OUTPUTS(1).R8[Long].get == SELF.R8[Long].get                             &&
        OUTPUTS(1).R9[Long].get == OUTPUTS(0).R9[Long].get                       &&
        // burn Spicy Oatmeal
        blake2b256(OUTPUTS(2).propositionBytes) == burnAllScriptHash             &&
        OUTPUTS(2).value == BoxMinValue                                          &&
        OUTPUTS(2).tokens(0)._1 == SpicyOatmealNFTId                             &&
        OUTPUTS(2).tokens(0)._2 == numSpicyOatmeal                               &&
        OUTPUTS(2).tokens.size == 1
    } else {
        false
    }

    val gameRand = byteArrayToBigInt(CONTEXT.headers(0).id.slice(0, 4))
    val gameRandAbs = max(gameRand, -1.toBigInt * gameRand)
    // winner depends on both Blob id and header id
    val blobWin = ((gameRandAbs + SELF.R9[Long].get.toBigInt) % blobinatorModuloWin.toBigInt) == 0
    val isChainedTransaction = SELF.creationInfo._1 == OUTPUTS(0).creationInfo._1

    val validBlobWin = if (blobWin && SELF.R9[Long].get > 0 && INPUTS.size == 2 && OUTPUTS.size == 3 &&  valibBlob &&
                            blake2b256(OUTPUTS(1).propositionBytes) == burnAllScriptHash &&
                            !isChainedTransaction
    ) {
        // blob
        OUTPUTS(0).value >= INPUTS(0).value - txFee + SELF.value - BoxMinValue   &&
        OUTPUTS(0).R9[Long].get == SELF.R9[Long].get                             &&
        // burn blobinator token
        OUTPUTS(1).value == BoxMinValue                                          &&
        OUTPUTS(1).tokens.size == 1                                              &&
        OUTPUTS(1).tokens(0)._1 == BlobinatorNFTId                               &&
        OUTPUTS(1).tokens(0)._2 == 1
    } else {
        false
    }

    val validBlobinatorWin = if (!blobWin && SELF.R9[Long].get > 0 && INPUTS.size == 2 && OUTPUTS.size == 3 && valibBlob &&
                                    OUTPUTS(1).propositionBytes == SELF.propositionBytes &&
                                    !isChainedTransaction
    ) {
        // blob
        OUTPUTS(0).value >= INPUTS(0).value - txFee                 &&
        OUTPUTS(0).R9[Long].get == SELF.R9[Long].get                &&
        // blobinator
        OUTPUTS(1).value == SELF.value                              &&
        OUTPUTS(1).tokens.size == 1                                 &&
        OUTPUTS(1).tokens(0)._1 == BlobinatorNFTId                  &&
        OUTPUTS(1).tokens(0)._2 == 1                                &&
        OUTPUTS(1).R9[Long].get == 0                                &&
        OUTPUTS(1).R8[Long].get == SELF.R8[Long].get + 1L
    } else {
        false
    }

    //proveDlog(GameFundPK) || // DEBUG
    sigmaProp(
                validEngage        ||
                validBlobWin       ||
                validBlobinatorWin
             )

}



