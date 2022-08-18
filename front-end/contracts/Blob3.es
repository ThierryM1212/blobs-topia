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
    
    val tokenAmountOut = OUTPUTS(0).tokens(0)._2
    //val selfScriptHash = blake2b256(SELF.propositionBytes)
    
    // compute states
    //val waitingForGame = (blobStateIn == state_waiting_for_game) && (r9ValueIn >= minGamePrice) && (SELF.tokens(0)._1 == GameTokenNFTId) && (tokenAmountIn == 2)
    //val inGame = (blobStateIn == state_in_game) && (SELF.tokens(0)._1 == GameTokenNFTId) && (tokenAmountIn == 1)
    //val inGameCreator = inGame && r9ValueIn > minGamePrice
    //val waitingForSell = (blobStateIn == state_waiting_for_sell) && (r9ValueIn >= blobAmountIn)
    val inStateQuiet = (blobStateIn == 0) && (r9ValueIn == 0) && (tokenAmountIn == 2)
    
    // last input box is provided by the owner of the blob
    val isOwner = (ownerPKIn.propBytes == INPUTS(INPUTS.size-1).propositionBytes)
    
    // function to check if a blob is replicated in the OUTPUTS(id)
    // do not check the state and the token amount
    //def isBlobReplicated(id:Int) = blake2b256(OUTPUTS(id).propositionBytes) == selfScriptHash                                &&
    //                               OUTPUTS(id).R4[Coll[Byte]].isDefined && OUTPUTS(id).R4[Coll[Byte]].get == blobDescIn      &&
    //                               OUTPUTS(id).R5[Coll[Long]].isDefined && OUTPUTS(id).R5[Coll[Long]].get == blobInfoIn        &&
    //                               OUTPUTS(id).R6[SigmaProp].isDefined && OUTPUTS(id).R6[SigmaProp].get == ownerPKIn         &&
    //                               OUTPUTS(id).R7[Coll[Byte]].isDefined && OUTPUTS(id).R7[Coll[Byte]].get  == gameScriptHash &&
    //                               OUTPUTS(id).tokens.size == 1                                                              &&
    //                               OUTPUTS(id).tokens(0)._1 == GameTokenNFTId                                                &&
    //                               OUTPUTS(id).tokens(0)._1 == tokenIdIn      
                                   
    
    // Separate the cases depending on how much blob there is in outputs:
    // 0 - Kill
    // 1 - create or cancel game, create or cancel sell, add/widthdraw funds
    // 2 - Play game, get game results
    val outBlobBoxes = OUTPUTS.filter{(b:Box) =>
                    blake2b256(b.propositionBytes) == blake2b256(SELF.propositionBytes)
                  }
                  
    //val validCancelGameOrSell = isBlobReplicated(0)                                           &&
    //                            OUTPUTS(0).value == SELF.value                                &&
    //                            tokenAmountOut == 2                                           &&
    //                            OUTPUTS(0).R8[Int].isDefined && OUTPUTS(0).R8[Int].get == 0   &&
    //                            OUTPUTS(0).R9[Long].isDefined && OUTPUTS(0).R9[Long].get == 0
    //
    //val validCreateGame = isBlobReplicated(0)                                           &&
    //                      tokenAmountOut == 2                                           &&
    //                      OUTPUTS(0).R8[Int].isDefined && OUTPUTS(0).R8[Int].get == 1   &&
    //                      OUTPUTS(0).R9[Long].isDefined                                 &&
    //                      OUTPUTS(0).R9[Long].get > minGamePrice                        &&
    //                      OUTPUTS(0).value >= OUTPUTS(0).R9[Long].get + blobERGAmount
    //                              
    //val validCreateSell = isBlobReplicated(0)                                           &&
    //                      OUTPUTS(0).value == SELF.value                                &&
    //                      tokenAmountOut == 2                                           &&
    //                      OUTPUTS(0).R8[Int].isDefined && OUTPUTS(0).R8[Int].get == 2   &&
    //                      OUTPUTS(0).R9[Long].get >= OUTPUTS(0).value + blobERGAmount
    //
    //val validFundExchange = isBlobReplicated(0)                                            &&
    //                        tokenAmountOut == 2                                            &&
    //                        OUTPUTS(0).value >= blobERGAmount                              &&
    //                        OUTPUTS(0).R8[Int].isDefined && OUTPUTS(0).R8[Int].get == 0    &&
    //                        OUTPUTS(0).R9[Long].isDefined && OUTPUTS(0).R9[Long].get == 0  &&
    //                        OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes &&
    //                        OUTPUTS(1).value >= dAppFee                                    &&
    //                        OUTPUTS(1).tokens.size == 0       
    //
    //val blobPrice = SELF.R9[Long].get
    //val sellAppFee = max(dAppFee, blobPrice / 100) // best of 0.01 ERG or 1% of sell amount
    //val validSell = OUTPUTS(0).propositionBytes == SELF.propositionBytes  &&
    //                OUTPUTS(0).tokens.size == 1    &&
    //                OUTPUTS(0).value == SELF.value &&
    //                OUTPUTS(0).R4[Coll[Byte]].isDefined &&
    //                OUTPUTS(0).R4[Coll[Byte]].get == SELF.R4[Coll[Byte]].get &&
    //                OUTPUTS(0).R5[Coll[Long]].isDefined &&
    //                OUTPUTS(0).R5[Coll[Long]].get == SELF.R5[Coll[Long]].get &&
    //                OUTPUTS(0).R6[SigmaProp].isDefined &&
    //                OUTPUTS(0).R6[SigmaProp].get.propBytes == INPUTS(INPUTS.size-1).propositionBytes &&
    //                OUTPUTS(0).R7[Coll[Byte]].isDefined &&
    //                OUTPUTS(0).R7[Coll[Byte]].get == SELF.R7[Coll[Byte]].get &&
    //                OUTPUTS(0).R8[Int].isDefined &&
    //                OUTPUTS(0).R8[Int].get == 0 &&
    //                OUTPUTS(0).R9[Long].isDefined &&
    //                OUTPUTS(0).R9[Long].get == 0 &&
    //                OUTPUTS(0).tokens(0)._1 == GameTokenNFTId &&
    //                tokenAmountOut == 2 &&
    //                OUTPUTS(1).propositionBytes == ownerPKIn.propBytes &&
    //                OUTPUTS(1).value == blobPrice - sellAppFee &&
    //                OUTPUTS(1).tokens.size == 0 &&
    //                OUTPUTS.size > 2 &&
    //                OUTPUTS(2).value >= sellAppFee &&
    //                OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes &&
    //                OUTPUTS(2).tokens.size == 0
    //
    //val boxToCheckCreateGame = if (SELF.R9[Long].get > 0) 1 else 0
    //val boxToCheckInGame = if (inGameCreator) 1 else 0
                  
    // The owner kill the blob and get the funds back
    proveDlog(GameFundPK) || // DEBUG
    sigmaProp ((
        outBlobBoxes.size == 0                                         &&
        isOwner                                                        &&
        inStateQuiet                                                   &&
        OUTPUTS(0).propositionBytes == proveDlog(GameFundPK).propBytes &&
        OUTPUTS(0).value >= dAppFee                                    &&
        OUTPUTS(0).tokens.size == 1                                    &&
        OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                      &&
        tokenAmountOut == 2
    )
    //||
    //(
    //    outBlobBoxes.size == 1 &&
    //    (
    //        (isOwner && (waitingForGame || waitingForSell) && validCancelGameOrSell) ||
    //        (isOwner && inStateQuiet && validCreateGame)                             ||
    //        (isOwner && inStateQuiet && validCreateSell)                             ||
    //        (isOwner && inStateQuiet && validFundExchange)                           ||
    //        (!isOwner && waitingForSell && validSell)
    //    )
    //)
    //||
    //(
    //    outBlobBoxes.size == 2 &&
    //    (
    //        ( // engage game
    //            OUTPUTS(0).R8[Int].isDefined && OUTPUTS(1).R8[Int].isDefined &&
    //            OUTPUTS(0).R8[Int].get == 3 && OUTPUTS(1).R8[Int].get == 3   &&
    //            blake2b256(SELF.propositionBytes) == blake2b256(INPUTS(0).propositionBytes) &&
    //            blake2b256(INPUTS(0).propositionBytes) == blake2b256(INPUTS(1).propositionBytes) &&
    //            INPUTS(0).R6[SigmaProp].isDefined && INPUTS(1).R6[SigmaProp].isDefined   &&
    //            INPUTS(0).R6[SigmaProp].get.propBytes != INPUTS(1).R6[SigmaProp].get.propBytes &&
    //            INPUTS(0).R8[Int].isDefined && INPUTS(1).R8[Int].isDefined &&
    //            INPUTS(0).R8[Int].get == 0 && INPUTS(1).R8[Int].get == 1 &&
    //            
    //            INPUTS.size > 1 &&
    //            blake2b256(OUTPUTS(2).propositionBytes) == gameScriptHash &&
    //            OUTPUTS(2).tokens.size == 1 &&
    //            OUTPUTS(2).tokens(0)._1 == GameTokenNFTId &&
    //            OUTPUTS(2).tokens(0)._2 == 2 &&
    //            INPUTS(1).R9[Long].isDefined &&
    //            OUTPUTS(2).value == (2 * INPUTS(1).R9[Long].get) &&
    //            OUTPUTS(2).R4[SigmaProp].isDefined && INPUTS(0).R6[SigmaProp].isDefined &&
    //            OUTPUTS(2).R4[SigmaProp].get.propBytes == INPUTS(0).R6[SigmaProp].get.propBytes &&
    //            OUTPUTS(2).R5[Coll[Long]].isDefined && INPUTS(0).R5[Coll[Long]].isDefined &&
    //            OUTPUTS(2).R5[Coll[Long]].get == INPUTS(0).R5[Coll[Long]].get &&
    //            OUTPUTS(2).R6[SigmaProp].isDefined && INPUTS(1).R6[SigmaProp].isDefined &&
    //            OUTPUTS(2).R6[SigmaProp].get.propBytes == INPUTS(1).R6[SigmaProp].get.propBytes &&
    //            OUTPUTS(2).R7[Coll[Long]].isDefined && INPUTS(1).R5[Coll[Long]].isDefined &&
    //            OUTPUTS(2).R7[Coll[Long]].get == INPUTS(1).R5[Coll[Long]].get &&
    //            OUTPUTS(2).R8[Coll[Byte]].isDefined &&
    //            OUTPUTS(2).R8[Coll[Byte]].get == blake2b256(SELF.propositionBytes) &&
    //            
    //            isBlobReplicated(boxToCheckCreateGame) &&
    //            OUTPUTS(boxToCheckCreateGame).tokens.size == 1 &&
    //            OUTPUTS(boxToCheckCreateGame).tokens(0)._2 == 1 && 
    //            
    //            OUTPUTS(0).R9[Long].isDefined && OUTPUTS(1).R9[Long].isDefined &&
    //            OUTPUTS(0).R9[Long].get == 0 && OUTPUTS(1).R9[Long].get == INPUTS(1).R9[Long].get &&
    //            OUTPUTS(1).R9[Long].get == INPUTS(1).R9[Long].get &&
    //            OUTPUTS(0).value == INPUTS(0).value - INPUTS(1).R9[Long].get &&
    //            OUTPUTS(1).value == INPUTS(1).value - INPUTS(1).R9[Long].get 
    //            
    //        )
    //        ||
    //        ( // game results
    //            OUTPUTS(0).R8[Int].isDefined && OUTPUTS(1).R8[Int].isDefined &&
    //            OUTPUTS(0).R8[Int].get == 0 && OUTPUTS(1).R8[Int].get == 0 &&
    //            INPUTS.size > 2 &&
    //            blake2b256(INPUTS(2).propositionBytes) == gameScriptHash &&
    //            isBlobReplicated(boxToCheckInGame) &&
    //            OUTPUTS(boxToCheckInGame).R8[Int].get == 0 &&
    //            OUTPUTS(boxToCheckInGame).R9[Long].get == 0 &&
    //            OUTPUTS(boxToCheckInGame).tokens.size == 1 &&
    //            OUTPUTS(boxToCheckInGame).tokens(0)._2 == 2 &&
    //            OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes &&
    //            OUTPUTS(2).value >= dAppFee &&
    //            OUTPUTS(2).tokens.size == 0
    //        )
    //    )
    //)
    )
}

