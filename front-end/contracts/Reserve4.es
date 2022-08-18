{   
 
    // inputs
    val reserveValue = SELF.value
    val reserveTokens = SELF.tokens(0)
    val reserveName = SELF.R4[Coll[Byte]].get
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Byte]].get
    val gameScriptHash = configBox.R5[Coll[Byte]].get
    val blobPrice = configBox.R6[Coll[Long]].get(0)
    val blobMintFee = configBox.R6[Coll[Long]].get(1)
    val iniAttackLevel = configBox.R7[Coll[Long]].get(0)
    val iniDefenseLevel = configBox.R7[Coll[Long]].get(1)
    
    val validBlob = if (blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash) {
                        OUTPUTS(0).tokens(0)._1 == GameTokenNFTId              &&
                        OUTPUTS(0).tokens(0)._2 == 2                           &&
                        OUTPUTS(0).R5[Coll[Long]].get(0) == iniAttackLevel     &&
                        OUTPUTS(0).R5[Coll[Long]].get(1) == iniDefenseLevel    &&
                        OUTPUTS(0).R5[Coll[Long]].get(2) == 0L                 &&
                        OUTPUTS(0).R5[Coll[Long]].get(3) == 0L                 &&
                        OUTPUTS(0).R6[SigmaProp].isDefined                     &&
                        OUTPUTS(0).R7[Long].get == 0L                          &&
                        OUTPUTS(0).R8[Long].get == 0L
                    } else {
                        false
                    }
    
    val validReserve =  if (OUTPUTS.size > 1) {
                            if (OUTPUTS(1).R4[Coll[Byte]].isDefined) {
                                if (OUTPUTS(1).tokens.size == 1) {
                                    blake2b256(OUTPUTS(1).propositionBytes) == blake2b256(SELF.propositionBytes) &&
                                    OUTPUTS(1).R4[Coll[Byte]].get == reserveName                                 &&
                                    OUTPUTS(1).tokens(0)._1 == GameTokenNFTId                                    &&
                                    OUTPUTS(1).tokens(0)._2 == reserveTokens._2 - 2                              &&
                                    OUTPUTS(1).value == reserveValue
                                } else {
                                    false
                                }
                            } else {
                                false
                            }
                        } else {
                            false
                        }
    
    val validMintFee =  if (OUTPUTS.size > 2) {
                            OUTPUTS(2).value >= blobMintFee                                 &&
                            OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes  &&
                            OUTPUTS(2).tokens.size == 0
                        } else {
                            false
                        }
    
    proveDlog(GameFundPK) ||
      sigmaProp( 
        // Blob is first output
        validBlob                                                                    &&
        
        // Token reserve is second input box replicated in second output box
        validReserve                                                                 &&
        
        // dApp Blob creation fee is third output box
        validMintFee
        
      )
}
