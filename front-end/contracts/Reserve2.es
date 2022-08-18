{   
 
    // Token reserve script to bootstrap the smart contract chain
    // The reserve delivers 2 tokens to a box protected by the Blob.es script
    // It is self-replicated in the first output
    // The blob box is the second ouput
    // dApp Fee is the third output box
    // Its ERG value defines the price to mint a Blob, it can also be spent by the "GameFundPK", the public key of "Admin" of the game (game token owner)

    val blobScriptHash = SELF.R4[Coll[Byte]].get
    val gameScriptHash = SELF.R5[Coll[Byte]].get
    val reserveName = SELF.R6[Coll[Byte]].get
    val blobPrice = SELF.value
    
    proveDlog(GameFundPK) ||
      sigmaProp( 
        
        // Token reserve is first input box replicated in firt output box
        blake2b256(OUTPUTS(0).propositionBytes) == blake2b256(SELF.propositionBytes) &&
        OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                                    &&
        OUTPUTS(0).tokens(0)._2 == SELF.tokens(0)._2 - 2                             &&
        OUTPUTS(0).tokens.size == SELF.tokens.size                                   &&
        OUTPUTS(0).value == blobPrice                                                &&
        OUTPUTS(0).R4[Coll[Byte]].get == blobScriptHash                              &&
        OUTPUTS(0).R5[Coll[Byte]].get == gameScriptHash                              &&
        OUTPUTS(0).R6[Coll[Byte]].get == reserveName                                 &&
        
        // Blob is second output box
        blake2b256(OUTPUTS(1).propositionBytes) == blobScriptHash                    &&
        OUTPUTS(1).tokens(0)._1 == GameTokenNFTId                                    &&
        OUTPUTS(1).tokens(0)._2 == 2                                                 &&
        OUTPUTS(1).value >= blobPrice - dAppBlobFee                                  &&
        OUTPUTS(1).R4[Coll[Byte]].isDefined                                          &&
        OUTPUTS(1).R5[Coll[Long]].get.size == 4                                      &&
        OUTPUTS(1).R5[Coll[Long]].get(0) == 1                                        &&
        OUTPUTS(1).R5[Coll[Long]].get(1) == 1                                        &&
        OUTPUTS(1).R5[Coll[Long]].get(2) == 0                                        &&
        OUTPUTS(1).R5[Coll[Long]].get(3) == 0                                        &&
        OUTPUTS(1).R7[Coll[Byte]].get == gameScriptHash                              &&
        OUTPUTS(1).R8[Int].get == 0                                                  &&
        OUTPUTS(1).R9[Long].get == 0                                                 &&
        
        // dApp Blob creation fee is third output box
        OUTPUTS(2).value >= dAppBlobFee                                              &&
        OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes
      )
}
