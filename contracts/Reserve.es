{   
 
    // inputs
    val reserveValue = SELF.value
    val reserveTokens = SELF.tokens(0)
    val reserveName = SELF.R4[Coll[Byte]].get
    val iniAttackLevel = SELF.R5[Coll[Long]].get(0)
    val iniDefenseLevel = SELF.R5[Coll[Long]].get(1)
    val blobPrice = SELF.R6[Coll[Long]].get(0)
    val blobMintFee = SELF.R6[Coll[Long]].get(1)
    val uniqueId = SELF.R7[Long].get
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Coll[Byte]]].get(0)
    val txFee = configBox.R5[Coll[Long]].get(1)
    
    val validBlob = if (blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash ) {
                        OUTPUTS(0).tokens(0)._1 == GameTokenNFTId              &&
                        OUTPUTS(0).tokens(0)._2 == 2                           &&
                        OUTPUTS(0).R5[Coll[Long]].get(0) == iniAttackLevel     &&
                        OUTPUTS(0).R5[Coll[Long]].get(1) == iniDefenseLevel    &&
                        OUTPUTS(0).R5[Coll[Long]].get(2) == 0L                 &&
                        OUTPUTS(0).R5[Coll[Long]].get(3) == 0L                 &&
                        OUTPUTS(0).R6[SigmaProp].isDefined                     &&
                        OUTPUTS(0).R7[Long].get == 0L                          &&
                        OUTPUTS(0).R8[Long].get == 0L                          &&
                        OUTPUTS(0).R9[Long].get == uniqueId                    &&
                        OUTPUTS(0).value >= SELF.value - blobMintFee - txFee
                    } else {
                        false
                    }
    
    val validReserve = if (OUTPUTS(1).propositionBytes == SELF.propositionBytes) {
                            OUTPUTS(1).R4[Coll[Byte]].get == reserveName                                 &&
                            OUTPUTS(1).tokens.size == 1                                                  &&
                            OUTPUTS(1).tokens(0)._1 == GameTokenNFTId                                    &&
                            OUTPUTS(1).tokens(0)._2 == reserveTokens._2 - 2                              &&
                            OUTPUTS(1).value == reserveValue                                             &&
                            OUTPUTS(1).R5[Coll[Long]].get(0) == iniAttackLevel                           &&
                            OUTPUTS(1).R5[Coll[Long]].get(1) == iniDefenseLevel                          &&
                            OUTPUTS(1).R6[Coll[Long]].get(0) == blobPrice                                &&
                            OUTPUTS(1).R6[Coll[Long]].get(1) == blobMintFee                              &&
                            OUTPUTS(1).R7[Long].get == uniqueId + 1
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
        validConfigBox                                                               &&
        // Blob is first output
        validBlob                                                                    &&
        
        // Token reserve is second input box replicated in second output box
        validReserve                                                                 &&
        
        // dApp Blob creation fee is third output box
        validMintFee
        
      )
}
