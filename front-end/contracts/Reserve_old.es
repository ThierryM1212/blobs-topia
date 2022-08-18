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
    
    // Get the list of output boxes protected by the script of the Blob
    val outBlobBoxes = OUTPUTS.filter{(b:Box) =>
                    blake2b256(b.propositionBytes) == blobScriptHash
                  }
                  
    if (outBlobBoxes.size == 1) { // one blob in output
        val blobInfo = OUTPUTS(1).R5[Coll[Int]].get
        proveDlog(GameFundPK) || // Game owner own the reserve
        sigmaProp ({ 
              allOf(Coll(
                    OUTPUTS.size >= 3,
                    
                    // Token reserve is first input box replicated in firt output box
                    OUTPUTS(0).propositionBytes == SELF.propositionBytes,
                    OUTPUTS(0).tokens(0)._1 == GameTokenNFTId,
                    OUTPUTS(0).tokens(0)._2 == SELF.tokens(0)._2 - 2, // 2 tokens per blob
                    OUTPUTS(0).tokens.size == SELF.tokens.size,
                    OUTPUTS(0).value == SELF.value,
                    OUTPUTS(0).R4[Coll[Byte]].get == blobScriptHash,
                    OUTPUTS(0).R5[Coll[Byte]].get == gameScriptHash,
                    OUTPUTS(0).R6[Coll[Byte]].get == reserveName,
                    
                    // Blob is second output box
                    blake2b256(OUTPUTS(1).propositionBytes) == blobScriptHash,
                    OUTPUTS(1).tokens(0)._1 == GameTokenNFTId,
                    OUTPUTS(1).tokens(0)._2 == 2,
                    OUTPUTS(1).value == blobPrice - dAppBlobFee, // min 0.01 ERG
                    OUTPUTS(1).R4[Coll[Byte]].isDefined, // blob description
                    blobInfo.size == 4,
                    blobInfo(0) == 1, // blob Attack level
                    blobInfo(1) == 1, // blob Defense level
                    blobInfo(2) == 0, // blob number of Parties
                    blobInfo(3) == 0, // blob number of Victories
                    OUTPUTS(1).R6[SigmaProp].get.propBytes == INPUTS(0).propositionBytes, // blob owner PK
                    OUTPUTS(1).R7[Coll[Byte]].get == gameScriptHash,
                    OUTPUTS(1).R8[Long].get == 0, // cannot create the blob in "wait for game state"
                    OUTPUTS(1).R9[Long].get == 0, // cannot create the blob in "wait for sell state"
                    
                    // dApp Blob creation fee is third output box
                    OUTPUTS(2).value == dAppBlobFee, 
                    OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes,
                    OUTPUTS(2).tokens.size == 0,
                    
                    1 == 1
                    ))
          }) 
    } else { // Not 1 Blob in output
        proveDlog(GameFundPK)
    }
}
