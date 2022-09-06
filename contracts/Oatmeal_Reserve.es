{   
 
    // inputs
    val reserveValue = SELF.value
    val reserveTokens = SELF.tokens(0)
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Coll[Byte]]].get(0)
    val gameScriptHash = configBox.R4[Coll[Coll[Byte]]].get(1)
    val txFee = configBox.R5[Coll[Long]].get(1)
    val numOatmealLose = configBox.R5[Coll[Long]].get(2)
    val numOatmealWin = configBox.R5[Coll[Long]].get(3)
    val totalOatmeal = numOatmealLose + numOatmealWin
    
    val validBlob1 = if (OUTPUTS.size > 3 && INPUTS.size == 3) {
                            if (blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash) {
                                OUTPUTS(0).value == INPUTS(0).value - INPUTS(0).R8[Long].get    &&
                                OUTPUTS(0).R4[Coll[Byte]].get == INPUTS(0).R4[Coll[Byte]].get   &&
                                OUTPUTS(0).R5[Coll[Int]].get == INPUTS(0).R5[Coll[Int]].get     &&
                                OUTPUTS(0).R6[SigmaProp].get == INPUTS(0).R6[SigmaProp].get     &&
                                OUTPUTS(0).R7[Long].get == 3                                    &&
                                OUTPUTS(0).R8[Long].get == INPUTS(0).R8[Long].get               &&
                                OUTPUTS(0).R9[Long].get == INPUTS(0).R9[Long].get               &&
                                OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                       &&
                                OUTPUTS(0).tokens(0)._2 == 1
                            } else {
                                false
                            }
                        } else {
                            false
                        }
    
    val validBlob2 = if (OUTPUTS.size > 3 && INPUTS.size == 3) {
                            if (blake2b256(OUTPUTS(1).propositionBytes) == blobScriptHash) {
                                OUTPUTS(1).value == INPUTS(1).value - INPUTS(1).R8[Long].get    &&
                                OUTPUTS(1).R4[Coll[Byte]].get == INPUTS(1).R4[Coll[Byte]].get   &&
                                OUTPUTS(1).R5[Coll[Int]].get == INPUTS(1).R5[Coll[Int]].get     &&
                                OUTPUTS(1).R6[SigmaProp].get == INPUTS(1).R6[SigmaProp].get     &&
                                OUTPUTS(1).R7[Long].get == 3                                    &&
                                OUTPUTS(1).R8[Long].get == INPUTS(1).R8[Long].get               &&
                                OUTPUTS(1).R9[Long].get == INPUTS(1).R9[Long].get               &&
                                OUTPUTS(1).tokens(0)._1 == GameTokenNFTId                       &&
                                OUTPUTS(1).tokens(0)._2 == 1
                            } else {
                                false
                            }
                        } else {
                            false
                        }
                        
    val validGameBox =  if (OUTPUTS.size > 3 && INPUTS.size == 3) {
                            if (blake2b256(OUTPUTS(2).propositionBytes) == gameScriptHash) {
                                OUTPUTS(2).tokens.size == 2                                              &&
                                OUTPUTS(2).tokens(1)._1 == OatmealTokenNFTId                             &&
                                OUTPUTS(2).tokens(1)._2 == totalOatmeal                                  &&
                                OUTPUTS(0).R8[Long].get == OUTPUTS(1).R8[Long].get                       &&
                                // blob in first position for the figth                                  
                                OUTPUTS(2).value >= 2 * OUTPUTS(0).R8[Long].get - txFee                  &&
                                OUTPUTS(2).R4[SigmaProp].get == OUTPUTS(0).R6[SigmaProp].get             &&
                                OUTPUTS(2).R5[Long].get == OUTPUTS(0).R9[Long].get                       &&
                                OUTPUTS(2).R6[Coll[Int]].get == OUTPUTS(0).R5[Coll[Int]].get             &&
                                // blob in second position for the figth                                  
                                OUTPUTS(2).value >= 2 * OUTPUTS(1).R8[Long].get - txFee                  &&
                                OUTPUTS(2).R7[SigmaProp].get == OUTPUTS(1).R6[SigmaProp].get             &&
                                OUTPUTS(2).R8[Long].get == OUTPUTS(1).R9[Long].get                       &&
                                OUTPUTS(2).R9[Coll[Int]].get == OUTPUTS(1).R5[Coll[Int]].get
                            } else {
                                false
                            }
                        } else {
                            false
                        }
    
    val validReserve =  if (OUTPUTS.size > 3 && INPUTS.size == 3) {
                            blake2b256(OUTPUTS(3).propositionBytes) == blake2b256(SELF.propositionBytes) &&
                            OUTPUTS(3).value == reserveValue                                             &&
                            OUTPUTS(3).tokens.size == 1                                                  &&
                            OUTPUTS(3).tokens(0)._1 == OatmealTokenNFTId                                 &&
                            OUTPUTS(3).tokens(0)._2 == reserveTokens._2 - totalOatmeal
                        } else {
                            false
                        }
    
    proveDlog(GameFundPK) ||
      sigmaProp( 
        validConfigBox                                                               &&
        validReserve                                                                 &&
        validGameBox                                                                 &&
        validBlob1                                                                   &&
        validBlob2
        
      )
}
