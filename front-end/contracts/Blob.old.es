{ 
    // A Blob:
    //   - ERG value: amount that can be spent in games fight against other blob
    //                blob owner can add or widthdraw ERGs friom its blob
    //   - 2 Tokens: "GameTokenNFTId", provided by the reserve script at its creation
    //               When engaged in a game the blob put one of its tokens in the game box and get it back after game widthdrawal
    //   - R4[Coll[Byte]]: Description for rendering of the blob encoded in a string (max 300B)
    //                     BlobName:color1:color2:eyes_type:mouth_type:svg_path
    //   - R5[Coll[Int]]: Blob evolving information, created with values [1, 1, 0, 0]
    //                    [Attack, Defense, Games, Victories]
    //   - R6[SigmaProp]: public key of the owner of the blob
    //   - R7[Coll[Byte]]: Hash of the game script, gameScriptHash
    //   - R8[Int]: State of the blob
    //   - R9[Long]: Value associated to the state

    // Blob States (R8):
    // 0 - quiet, R9=0
    // 1 - waiting for Game, R9=GameAmount
    // 2 - waiting for Sell, R9=BlobPrice
    // 3 - engaged in game, R9=GameAmount
    val state_quiet = 0
    val state_waiting_for_game = 1
    val state_waiting_for_sell = 2
    val state_in_game = 3
    
    val ownerPKin = SELF.R6[SigmaProp].get
    val blobInState = SELF.R8[Int].get
    val r9InValue = SELF.R9[Long].get
    val tokenAmountIn = SELF.tokens(0)._2
    val blobInAmount = SELF.value
    val gameScriptHash = SELF.R7[Coll[Byte]].get
    
    // compute states
    val waitingForGame = (blobInState == state_waiting_for_game) && (r9InValue >= minGamePrice) && (SELF.tokens(0)._1 == GameTokenNFTId) && (tokenAmountIn == 2)
    val inGame = (blobInState == state_in_game) && (SELF.tokens(0)._1 == GameTokenNFTId) && (tokenAmountIn == 1)
    val inGameCreator = inGame && r9InValue > minGamePrice
    val waitingForSell = (blobInState == state_waiting_for_sell) && (r9InValue >= blobInAmount)
    val inStateQuiet = (blobInState == 0) && (r9InValue == 0) && (tokenAmountIn == 2)
    
    // last input box is provided by the owner of the blob
    val isOwner = (ownerPKin.propBytes == INPUTS(INPUTS.size-1).propositionBytes)
    
    // function to check if a blob is replicated in the OUTPUTS(id)
    // do not check the state and the token amount
    def isBlobReplicated(id:Int) = OUTPUTS(id).propositionBytes   == SELF.propositionBytes    &&
                                   OUTPUTS(id).R4[Coll[Byte]].get == SELF.R4[Coll[Byte]].get  &&
                                   OUTPUTS(id).R5[Coll[Int]].get  == SELF.R5[Coll[Int]].get   &&
                                   OUTPUTS(id).R6[SigmaProp].get  == SELF.R6[SigmaProp].get   &&
                                   OUTPUTS(id).R7[Coll[Byte]].get == SELF.R7[Coll[Byte]].get  &&
                                   OUTPUTS(id).tokens(0)._1       == GameTokenNFTId           &&
                                   OUTPUTS(id).tokens(0)._1       == SELF.tokens(0)._1        &&
                                   OUTPUTS(id).tokens.size        == 1                        &&
                                   1 == 1
    
    // Separate the cases depending on how much blob there is in outputs:
    // 0 - Kill
    // 1 - create or cancel game, create or cancel sell, add/widthdraw funds
    // 2 - Play game, get game results
    val outBlobBoxes = OUTPUTS.filter{(b:Box) =>
                    b.propositionBytes == SELF.propositionBytes
                  }
                  
    val tokenAmountOut = OUTPUTS(0).tokens(0)._2
    if (outBlobBoxes.size == 0) { // No blob in outputs
        // The owner kill the blob and get the funds back
        sigmaProp ({ 
          allOf(Coll(
                    isOwner,
                    // dAppFee, get the tokens back
                    OUTPUTS(0).propositionBytes == proveDlog(GameFundPK).propBytes,
                    OUTPUTS(0).value >= dAppFee,
                    OUTPUTS(0).tokens(0)._1 == GameTokenNFTId,
                    tokenAmountOut == 2,
                    // get the funds back to player wallet in change box
                    OUTPUTS(1).propositionBytes == SELF.R6[SigmaProp].get.propBytes, // owner wallet
                    1 == 1
                  ))
                  })
                  
    } else if (outBlobBoxes.size == 1) { // cases with one blob in outputs(0)
        val validCancelGameOrSell = allOf(Coll(
                                            isBlobReplicated(0),
                                            OUTPUTS(0).R8[Int].get == 0, // state quiet
                                            OUTPUTS(0).R9[Long].get == 0,
                                            OUTPUTS(0).value == SELF.value,
                                            tokenAmountOut == 2,
                                            1 == 1
                                          ))
        val validCreateGame = allOf(Coll(
                                        isBlobReplicated(0),
                                        OUTPUTS(0).R8[Int].get == 1, // State waiting for game
                                        OUTPUTS(0).R9[Long].get > minGamePrice,
                                        OUTPUTS(0).value >= OUTPUTS(0).R9[Long].get + blobERGAmount,
                                        tokenAmountOut == 2,
                                        1 == 1
                                      ))
        val validCreateSell = allOf(Coll(
                                        isBlobReplicated(0),
                                        OUTPUTS(0).R8[Int].get == 2, // State waiting for sell
                                        OUTPUTS(0).R9[Long].get >= OUTPUTS(0).value + blobERGAmount,
                                        OUTPUTS(0).value == SELF.value,
                                        tokenAmountOut == 2,
                                        1 == 1
                                      ))
        val validFundExchange = allOf(Coll(
                                        isBlobReplicated(0),
                                        OUTPUTS(0).R8[Int].get == 0, // state quiet
                                        OUTPUTS(0).R9[Long].get == 0,
                                        tokenAmountOut == 2,
                                        OUTPUTS(0).value >= blobERGAmount,
                                        // dAppFee
                                        OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes,
                                        OUTPUTS(1).value >= dAppFee,
                                        OUTPUTS(1).tokens.size == 0,
                                        1 == 1
                                      ))
        val blobPrice = SELF.R9[Long].get
        val sellAppFee = max(dAppFee, blobPrice / 100) // best of 0.01 ERG or 1% of sell amount
        val validSell = allOf(Coll(
                            // check replicated blob to new adress R6
                            OUTPUTS(0).propositionBytes == SELF.propositionBytes,
                            OUTPUTS(0).R4[Coll[Byte]].get == SELF.R4[Coll[Byte]].get,
                            OUTPUTS(0).R5[Coll[Int]].get == SELF.R5[Coll[Int]].get,
                            OUTPUTS(0).R6[SigmaProp].get.propBytes == INPUTS(INPUTS.size-1).propositionBytes, // New owner last input box
                            OUTPUTS(0).R7[Coll[Byte]].get == SELF.R7[Coll[Byte]].get,
                            OUTPUTS(0).R8[Int].get == 0, // cannot sell a blob in state waiting for game
                            OUTPUTS(0).R9[Long].get == 0, // cannot sell a blob in state waiting for sell
                            OUTPUTS(0).tokens(0)._1 == GameTokenNFTId,
                            tokenAmountOut == 2,
                            OUTPUTS(0).tokens.size == 1,
                            OUTPUTS(0).value == SELF.value, // blob sold with its content of ERG
                            
                            // Pay the amount to the original owner
                            OUTPUTS(1).propositionBytes == ownerPKin.propBytes,
                            OUTPUTS(1).value == blobPrice - sellAppFee,
                            OUTPUTS(1).tokens.size == 0,
                            
                            // dApp Blob creation fee is third output box
                            OUTPUTS(2).value >= sellAppFee,
                            OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes,
                            OUTPUTS(2).tokens.size == 0,
                            1 == 1
                          ))
        
        sigmaProp ({ 
          anyOf(Coll(
                    isOwner && (waitingForGame || waitingForSell) && validCancelGameOrSell,
                    isOwner && inStateQuiet && validCreateGame,
                    isOwner && inStateQuiet && validCreateSell,
                    isOwner && inStateQuiet && validFundExchange,
                    !isOwner && waitingForSell && validSell,
                    1 == 0
                  ))
                  })
        
    } else if (outBlobBoxes.size == 2) { // cases with two blobs in outputs(0) and outputs(1)
        val gameAmount = INPUTS(1).R9[Long].get
        val boxToCheckCreateGame = if (SELF.R9[Long].get > 0) 1 else 0 // check if this box has created the game or is engaging the game
        if (OUTPUTS(0).R8[Int].get == 3 && OUTPUTS(1).R8[Int].get == 3) { // Engage the game
            sigmaProp ({ 
                allOf(Coll(
                    // first input blob engaging the game
                    // second input blob was waiting for the game with R8 set to 1 and R9 to GameAmount
                    // third input ERG amount for the transaction fee
                    
                    // first two inputs are blobs
                    SELF.propositionBytes == INPUTS(0).propositionBytes,
                    INPUTS(0).propositionBytes == INPUTS(1).propositionBytes,
                    
                    INPUTS(0).R6[SigmaProp].get.propBytes != INPUTS(1).R6[SigmaProp].get.propBytes, // cannot play against him-self
                    INPUTS(0).R8[Int].get == 0, // first input was in quiet state
                    INPUTS(1).R8[Int].get == 1, // second input was waiting for game
                    
                    // Validate the GameBox output that includes both player game amount, both blob info
                    blake2b256(OUTPUTS(2).propositionBytes) == gameScriptHash,
                    OUTPUTS(2).value == (2 * gameAmount),
                    OUTPUTS(2).tokens(0)._1 == GameTokenNFTId,
                    OUTPUTS(2).tokens(0)._2 == 2,
                    OUTPUTS(2).tokens.size == 1,
                    OUTPUTS(2).R4[SigmaProp].get.propBytes == INPUTS(0).R6[SigmaProp].get.propBytes, // P1 PK
                    OUTPUTS(2).R5[Coll[Int]].get == INPUTS(0).R5[Coll[Int]].get, // P1 [ Attack, Defense, Parties, Victories ]
                    OUTPUTS(2).R6[SigmaProp].get.propBytes == INPUTS(1).R6[SigmaProp].get.propBytes, // P2 PK
                    OUTPUTS(2).R7[Coll[Int]].get == INPUTS(1).R5[Coll[Int]].get, // P2 [ Attack, Defense, Parties, Victories ]
                    OUTPUTS(2).R8[Coll[Byte]].get == blake2b256(SELF.propositionBytes), // blobScriptHash
                    
                    // Validate blob replicated and its state
                    isBlobReplicated(boxToCheckCreateGame),
                    OUTPUTS(boxToCheckCreateGame).tokens(0)._2 == 1,
                    OUTPUTS(0).R8[Int].get == 3 && OUTPUTS(1).R8[Int].get == 3,
                    OUTPUTS(0).R9[Long].get == 0 && OUTPUTS(1).R9[Long].get == gameAmount,
                    OUTPUTS(1).R9[Long].get == gameAmount,
                    OUTPUTS(0).value == INPUTS(0).value - gameAmount,
                    OUTPUTS(1).value == INPUTS(1).value - gameAmount,
                    
                    1 == 1
                ))
            })
        } else if (OUTPUTS(0).R8[Int].get == 0 && OUTPUTS(1).R8[Int].get == 0) { // Get game results
            val boxToCheckInGame = if (inGameCreator) 1 else 0
            sigmaProp ({ 
                allOf(Coll(
                        // Gamebox is third input
                        blake2b256(INPUTS(2).propositionBytes) == gameScriptHash,
                        
                        // blob replicated in output 0 (player) or 1 (creator)
                        isBlobReplicated(boxToCheckInGame),
                        OUTPUTS(boxToCheckInGame).R8[Int].get == 0, // go back to quiet state
                        OUTPUTS(boxToCheckInGame).R9[Long].get == 0,
                        OUTPUTS(boxToCheckInGame).tokens(0)._2 == 2, // get the token back from the game box
                        // dAppFee
                        OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes,
                        OUTPUTS(2).value >= dAppFee,
                        OUTPUTS(2).tokens.size == 0,
                        // Game script will check the game results
                        1 == 1
                      ))
            })
        } else { // False
            sigmaProp ({ 1 == 0 })
        }
    } else { // False
        sigmaProp ({ 1 == 0 })
    }
}

