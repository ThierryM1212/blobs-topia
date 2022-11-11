{   
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobinatorFeeScriptHash = configBox.R4[Coll[Coll[Byte]]].get(4)
    val blobinatorScriptHash = configBox.R4[Coll[Coll[Byte]]].get(5)
    val blobinatorReserveScriptHash = configBox.R4[Coll[Coll[Byte]]].get(6)
    val txFee = configBox.R5[Coll[Long]].get(1)
    val blobinatorMinAmount = configBox.R5[Coll[Long]].get(7)

    // consolidate blobinator fee boxes
    val validConsolidateFee = if (OUTPUTS.size == 2) {
        INPUTS.size >= 20                                                       &&
        blake2b256(OUTPUTS(0).propositionBytes) == blobinatorFeeScriptHash      &&
        OUTPUTS(0).value > blobinatorMinAmount / 10                             &&
        OUTPUTS(0).value <= blobinatorMinAmount                                 &&
        OUTPUTS(1).value == txFee // all the inputs go to the consolidated box
    } else {
        false
    }

    // invoke blobinator
    val validInvokeBlobinator = if (!validConsolidateFee && OUTPUTS.size == 3) {
        blake2b256(OUTPUTS(0).propositionBytes) == blobinatorScriptHash            &&
        OUTPUTS(0).value >= blobinatorMinAmount                                    &&
        OUTPUTS(0).tokens.size == 1                                                &&
        OUTPUTS(0).tokens(0)._1 == BlobinatorNFTId                                 &&
        OUTPUTS(0).tokens(0)._2 == 1                                               &&
        OUTPUTS(0).R9[Long].get == 0L                                              &&  // blobinator state quiet
        OUTPUTS(0).R8[Long].get == 0L                                              &&  // blobinator 0 victory
        blake2b256(OUTPUTS(1).propositionBytes) == blobinatorReserveScriptHash     &&
        OUTPUTS(2).value == txFee
    } else {
        false
    }
   
    proveDlog(GameFundPK) || // DEBUG
    sigmaProp(validConfigBox  && 
              ( 
                validConsolidateFee 
               || 
                validInvokeBlobinator
              )
              )
}



