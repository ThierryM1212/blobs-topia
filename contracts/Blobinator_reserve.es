{   
 
    // inputs
    val reserveValue = SELF.value
    val reserveTokens = SELF.tokens(0)
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobinatorScriptHash = configBox.R4[Coll[Coll[Byte]]].get(5)
    val txFee = configBox.R5[Coll[Long]].get(1)
    val blobinatorMinAmount = configBox.R5[Coll[Long]].get(7)
    
    val validBlobinator = if (blake2b256(OUTPUTS(0).propositionBytes) == blobinatorScriptHash ) {
                                OUTPUTS(0).tokens(0)._1 == BlobinatorNFTId             &&
                                OUTPUTS(0).tokens(0)._2 == 1                           &&
                                OUTPUTS(0).tokens.size == 1                            &&
                                OUTPUTS(0).R9[Long].get == 0L                          &&
                                OUTPUTS(0).value >= blobinatorMinAmount
                            } else {
                                false
                            }
    
    val validReserve = if (OUTPUTS(1).propositionBytes == SELF.propositionBytes) {
                            OUTPUTS(1).tokens.size == 1                                                  &&
                            OUTPUTS(1).tokens(0)._1 == BlobinatorNFTId                                   &&
                            OUTPUTS(1).tokens(0)._2 == reserveTokens._2 - 1                              &&
                            OUTPUTS(1).value == reserveValue
                        } else {
                            false
                        }

    // miner box
    val validMinerBox = OUTPUTS(2).value == txFee && OUTPUTS.size == 3 // with 2 outputs fixed values, all remaining ERGs go to OUTPUTS(0)
    
    proveDlog(GameFundPK) || // burn the reserve
      sigmaProp( 
        validConfigBox                                             &&
        // Blobinator is first output
        validBlobinator                                            &&
        // Token reserve is replicated in second output box
        validReserve                                               &&
        // Ensure we only have 3 outputs
        validMinerBox
      )
}
