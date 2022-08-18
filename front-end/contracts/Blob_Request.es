{
    // inputs
    val blobDescIn = SELF.R4[Coll[Byte]].get
    val ownerPKin = SELF.R5[SigmaProp].get
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Byte]].get
    val gameScriptHash = configBox.R5[Coll[Byte]].get
    
    val validBlobTokens = if (OUTPUTS(0).tokens.size == 1 ) { 
        OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                                    &&
        OUTPUTS(0).tokens(0)._2 == 2
    } else {
        false
    }
    val validBlobRegister4 = if (OUTPUTS(0).R4[Coll[Byte]].isDefined) {
        OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn
    } else {
        false
    }
    val validBlobRegister5 = OUTPUTS(0).R5[Coll[Long]].isDefined
    val validBlobRegister6 = if (OUTPUTS(0).R6[SigmaProp].isDefined) {
        OUTPUTS(0).R6[SigmaProp].get == ownerPKin
    } else {
        false
    }
    val validBlobRegister7 = if (OUTPUTS(0).R7[Long].isDefined) {
        OUTPUTS(0).R7[Long].get == 0L
    } else {
        false
    }
    val validBlobRegister8 = if (OUTPUTS(0).R8[Long].isDefined) {
        OUTPUTS(0).R8[Long].get == 0L
    } else {
        false
    }
    val validBlobRegister9 = OUTPUTS(0).R9[Long].isDefined
    
    ownerPKin ||
    sigmaProp(
        // Blob is first output
        validConfigBox                                                               &&
        blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash                    &&
        validBlobTokens                                                              &&
        validBlobRegister4                                                           &&
        validBlobRegister5                                                           &&
        validBlobRegister6                                                           &&
        validBlobRegister7                                                           &&
        validBlobRegister8                                                           &&
        validBlobRegister9
        
    )
}