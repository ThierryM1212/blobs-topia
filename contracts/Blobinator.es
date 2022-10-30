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

    val validEngage = if (SELF.R4[Long].get == 0L && INPUTS.size == 2 && OUTPUTS.size > 3 && valibBlob &&
                            OUTPUTS(1).propositionBytes == SELF.propositionBytes
                         ) {
        // blobinator engaged
        OUTPUTS(1).tokens.size == 2                                              &&
        OUTPUTS(1).value == SELF.value                                           &&
        OUTPUTS(1).tokens(0)._1 == BlobinatorNFTId                               &&
        OUTPUTS(1).tokens(0)._2 == 1L                                             &&
        OUTPUTS(1).tokens(1)._1 == GameTokenNFTId                                &&
        OUTPUTS(1).tokens(1)._2 == 1L                                             &&
        OUTPUTS(1).R4[Long].get == OUTPUTS(0).R9[Long].get                       &&
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
    val blobWin = ((gameRandAbs + SELF.R4[Long].get.toBigInt) % blobinatorModuloWin.toBigInt) == 0

    val validBlobWin = if (blobWin && SELF.R4[Long].get > 0 && INPUTS.size == 2 && OUTPUTS.size == 3 &&  valibBlob &&
                            blake2b256(OUTPUTS(1).propositionBytes) == burnAllScriptHash
    ) {
        // blob
        OUTPUTS(0).value >= INPUTS(0).value - txFee + SELF.value - BoxMinValue   &&
        OUTPUTS(0).R9[Long].get == SELF.R4[Long].get                             &&
        // burn blobinator token
        OUTPUTS(1).value == BoxMinValue                                          &&
        OUTPUTS(1).tokens.size == 1                                              &&
        OUTPUTS(1).tokens(0)._1 == BlobinatorNFTId                               &&
        OUTPUTS(1).tokens(0)._2 == 1    // set R4 to avoid crash
    } else {
        false
    }

    val validBlobinatorWin = if (!blobWin && SELF.R4[Long].get > 0 && INPUTS.size == 2 && OUTPUTS.size == 3 && valibBlob &&
                                    OUTPUTS(1).propositionBytes == SELF.propositionBytes
    ) {
        // blob
        OUTPUTS(0).value >= INPUTS(0).value - txFee                 &&
        OUTPUTS(0).R9[Long].get == SELF.R4[Long].get                &&
        // blobinator
        OUTPUTS(1).value == SELF.value                              &&
        OUTPUTS(1).tokens.size == 1                                 &&
        OUTPUTS(1).tokens(0)._1 == BlobinatorNFTId                  &&
        OUTPUTS(1).tokens(0)._2 == 1                                &&
        OUTPUTS(1).R4[Long].get == 0
    } else {
        false
    }

    proveDlog(GameFundPK) || // DEBUG
    sigmaProp(
                validEngage        ||
                validBlobWin       ||
                validBlobinatorWin
             )

}



