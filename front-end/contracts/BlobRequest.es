{
    // inputs
    val blobDescIn = SELF.R4[Coll[Byte]].get
    val ownerPKin = SELF.R5[SigmaProp].get
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Byte]].get
    val gameScriptHash = configBox.R5[Coll[Byte]].get
    val blobPrice = configBox.R6[Coll[Long]].get(0)
    val blobMintFee = configBox.R6[Coll[Long]].get(1)
    val txFee = configBox.R6[Coll[Long]].get(4)
    val iniAttackLevel = configBox.R7[Coll[Long]].get(0)
    val iniDefenseLevel = configBox.R7[Coll[Long]].get(1)
    
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
    val validBlobRegister5 = if (OUTPUTS(0).R5[Coll[Long]].isDefined) {
        if (OUTPUTS(0).R5[Coll[Long]].get.size == 4) {
            OUTPUTS(0).R5[Coll[Long]].get(0) == iniAttackLevel                           &&
            OUTPUTS(0).R5[Coll[Long]].get(1) == iniDefenseLevel                          &&
            OUTPUTS(0).R5[Coll[Long]].get(2) == 0L                                       &&
            OUTPUTS(0).R5[Coll[Long]].get(3) == 0L
        } else {
            false
        }
    } else {
        false
    }
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
    
    ownerPKin ||
    sigmaProp(
        // Blob is first output
        blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash                    &&
        validBlobTokens                                                              &&
        OUTPUTS(0).value >= blobPrice - blobMintFee - txFee                          &&
        validBlobRegister4                                                           &&
        validBlobRegister5                                                           &&
        validBlobRegister6                                                           &&
        validBlobRegister7                                                           &&
        validBlobRegister8
        
    )
}