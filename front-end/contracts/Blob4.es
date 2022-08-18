{ 
    // A Blob:
    //   - ERG value: amount that can be spent in games fight against other blob
    //                blob owner can add or widthdraw ERGs friom its blob
    //   - 2 Tokens: "GameTokenNFTId", provided by the reserve script at its creation
    //               When engaged in a game the blob put one of its tokens in the game box and get it back after game widthdrawal
    //   - R4[Coll[Byte]]: Description for rendering of the blob encoded in a string (max 300B)
    //                     BlobName:color1:color2:eyes_type:mouth_type:svg_path
    //   - R5[Coll[Long]]: Blob evolving information, created with values [1, 1, 0, 0]
    //                    [Attack, Defense, Games, Victories]
    //   - R6[SigmaProp]: public key of the owner of the blob
    //   - R7[Coll[Byte]]: Hash of the game script, gameScriptHash
    //   - R8[Int]: State of the blob
    //   - R9[Int]: Value associated to the state

    // Blob States (R8):
    // 0 - quiet, R9=0
    // 1 - waiting for Game, R9=GameAmount
    // 2 - waiting for Sell, R9=BlobPrice
    // 3 - engaged in game, R9=GameAmount
    val state_quiet = 0
    val state_waiting_for_game = 1
    val state_waiting_for_sell = 2
    val state_in_game = 3
    
    val blobDescIn = SELF.R4[Coll[Byte]].get
    val blobInfoIn = SELF.R5[Coll[Long]].get
    val ownerPKIn = SELF.R6[SigmaProp].get
    val gameScriptHash = SELF.R7[Coll[Byte]].get
    val blobStateIn = SELF.R8[Int].get
    val r9ValueIn = SELF.R9[Long].get
    val tokenIdIn = SELF.tokens(0)._1
    val tokenAmountIn = SELF.tokens(0)._2
    val blobAmountIn = SELF.value
    val selfScriptHash = blake2b256(SELF.propositionBytes)
    
	def isBlobReplicated(id:Int) = blake2b256(OUTPUTS(id).propositionBytes) == selfScriptHash                                &&
                                   OUTPUTS(id).R4[Coll[Byte]].isDefined && OUTPUTS(id).R4[Coll[Byte]].get == blobDescIn      &&
                                   OUTPUTS(id).R5[Coll[Long]].isDefined && OUTPUTS(id).R5[Coll[Long]].get == blobInfoIn      &&
                                   OUTPUTS(id).R6[SigmaProp].isDefined && OUTPUTS(id).R6[SigmaProp].get == ownerPKIn         &&
                                   OUTPUTS(id).R7[Coll[Byte]].isDefined && OUTPUTS(id).R7[Coll[Byte]].get  == gameScriptHash &&
                                   OUTPUTS(id).tokens.size == 1                                                              &&
                                   OUTPUTS(id).tokens(0)._1 == GameTokenNFTId                                                &&
                                   OUTPUTS(id).tokens(0)._1 == tokenIdIn 
	
	val blobIsReplicated0 = isBlobReplicated(0)
	//val blobIsReplicated1 = isBlobReplicated(1)
	
	//val validCreateGame = blobIsReplicated0                                      &&
	//                      blobAmountIn == OUTPUTS(0).value                       &&
	//                      blobStateIn == 0                                       &&
	//					  OUTPUTS(0).R8[Int].get == 1                            &&
	//					  OUTPUTS(0).R9[Long].get >= minGamePrice                &&
	//					  OUTPUTS(0).R9[Long].get < blobAmountIn - blobERGAmount
    //
	//val validCancelGame = blobIsReplicated0                       &&
	//		              blobAmountIn == OUTPUTS(0).value        &&
	//                      blobStateIn == 1                        &&
	//					  OUTPUTS(0).R8[Int].get == 0             &&
	//					  OUTPUTS(0).R9[Long].get == 0L
	//					
	//val validAddWidthdrawFunds = blobIsReplicated0                                               &&
	//                             blobStateIn == 0                                                &&
	//					           OUTPUTS(0).R8[Int].get == 0                                     &&
	//					           OUTPUTS(0).R9[Long].get == 0L                                   &&
	//					           OUTPUTS(0).value >= blobERGAmount                               &&
	//					           OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes  &&
	//					           OUTPUTS(1).value >= dAppFee
	//					
	val validKillBlob = OUTPUTS(0).propositionBytes == proveDlog(GameFundPK).propBytes &&
	                    OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                      &&
                        OUTPUTS(0).tokens(0)._2 == 2                                   &&
						OUTPUTS(0).value >= dAppFee
	
	//val validCreateSell = blobIsReplicated0                        &&
	//                      blobAmountIn == OUTPUTS(0).value         &&
	//                      blobStateIn == 0                         &&
	//					  OUTPUTS(0).R8[Int].get == 2              &&
	//					  OUTPUTS(0).R9[Long].get >= blobERGAmount 
	//
	//val validCancelSell = blobIsReplicated0                        &&
	//                      blobAmountIn == OUTPUTS(0).value         &&
	//                      blobStateIn == 2                         &&
	//					  OUTPUTS(0).R8[Int].get == 0              &&
	//					  OUTPUTS(0).R9[Long].get == 0L 
	//
	//val validSell = OUTPUTS.size > 2                                                                         &&
	//                blake2b256(OUTPUTS(0).propositionBytes) == selfScriptHash                                &&
    //                OUTPUTS(0).R4[Coll[Byte]].isDefined && OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn       &&
    //                OUTPUTS(0).R5[Coll[Long]].isDefined && OUTPUTS(0).R5[Coll[Long]].get == blobInfoIn       &&
    //                OUTPUTS(0).R7[Coll[Byte]].isDefined && OUTPUTS(0).R7[Coll[Byte]].get  == gameScriptHash  &&
    //                OUTPUTS(0).tokens.size == 1                                                              &&
    //                OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                                                &&
    //                OUTPUTS(0).tokens(0)._1 == tokenIdIn                                                     &&
	//                blobAmountIn == OUTPUTS(0).value                                                         &&
	//				OUTPUTS(0).R6[SigmaProp].get.propBytes == INPUTS(INPUTS.size - 1).propositionBytes       &&
	//				OUTPUTS(0).R8[Int].get == 0                                                              &&
	//				OUTPUTS(0).R9[Long].get == 0L                                                            &&
	//				OUTPUTS(1).propositionBytes == ownerPKIn.propBytes                                       &&
	//				OUTPUTS(1).value >= r9ValueIn                                                            &&
	//				OUTPUTS(2).propositionBytes == ownerPKIn.propBytes                                       &&
	//				OUTPUTS(2).value >= dAppFee
					
	sigmaProp (
        validKillBlob 
		
    )
	
	
    
}

