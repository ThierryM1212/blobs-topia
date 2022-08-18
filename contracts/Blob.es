{ 
    // input
    val blobValueIn = SELF.value
    val blobDescIn = SELF.R4[Coll[Byte]].get
    val blobAttLevelIn = SELF.R5[Coll[Long]].get(0)
    val blobDefLevelIn = SELF.R5[Coll[Long]].get(1)
    val blobNumGameIn = SELF.R5[Coll[Long]].get(2)
    val blobNumWinIn = SELF.R5[Coll[Long]].get(3)
    val ownerPKin = SELF.R6[SigmaProp].get
    val blobStateIn = SELF.R7[Long].get
    val blobStateValueIn = SELF.R8[Long].get
    val blobUniqueId = SELF.R9[Long].get
    
    // config box, required for any blob action
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Byte]].get
    val gameScriptHash = configBox.R5[Coll[Byte]].get
    val blobExchangeFee = configBox.R6[Coll[Long]].get(0)
    val txFee = configBox.R6[Coll[Long]].get(1)
    val oatmealReserverHash = configBox.R7[Coll[Byte]].get
    val blobMinValue = 2000000L + txFee
    
    // verify basic attributes of a blob
    def isBlob(id: Int) = if (blake2b256(OUTPUTS(id).propositionBytes) == blobScriptHash ) {
        OUTPUTS(id).tokens(0)._1 == GameTokenNFTId                               &&
        OUTPUTS(id).value >= blobMinValue
    } else {
        false
    }

    // verify the different improvable stats of a blob are replicated
    def isBlobR5Replicated(id:Int) = OUTPUTS(id).R5[Coll[Long]].get(0) == blobAttLevelIn            &&
                                     OUTPUTS(id).R5[Coll[Long]].get(1) == blobDefLevelIn            &&
                                     OUTPUTS(id).R5[Coll[Long]].get(2) == blobNumGameIn             &&
                                     OUTPUTS(id).R5[Coll[Long]].get(3) == blobNumWinIn
    
    // BASIC BLOB VERIFICATION in OUTPUTS(0) and OUTPUTS(1)
    val validBlob0 = isBlob(0)
    val validBlob1 = isBlob(1)
    
    // KILL BLOB
    val validKill = if (!validBlob0) {
        val blobKillMinFee = max(blobValueIn * blobExchangeFee / 1000, 1000000)
        if (OUTPUTS(0).propositionBytes == proveDlog(GameFundPK).propBytes) {
            OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                       &&
            OUTPUTS(0).tokens(0)._2 == 2                                    &&
            OUTPUTS(0).value >= blobKillMinFee                              &&
            OUTPUTS(1).propositionBytes == ownerPKin.propBytes              &&
            OUTPUTS(1).value >= blobValueIn - blobKillMinFee - txFee
        } else {
            false
        }
    } else {
        false
    }
    
    // ADD/WIDTHDRAW FUNDS
    val validAddWidthdrawFund = if (validBlob0 && blobStateIn == 0) {
        val blobValueDiff = max(blobValueIn - OUTPUTS(0).value, blobValueIn - OUTPUTS(0).value)
        val minBlobWidthdrawFee = max(blobValueDiff * blobExchangeFee / 1000, 1000000L)
        if (OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes) {
            OUTPUTS(1).value >= minBlobWidthdrawFee                       &&
            OUTPUTS(0).tokens(0)._2 == 2                                  &&
            OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                   &&
            isBlobR5Replicated(0)                                         &&
            OUTPUTS(0).R6[SigmaProp].get == ownerPKin                     &&
            OUTPUTS(0).R7[Long].get == 0                                  &&
            OUTPUTS(0).R8[Long].get == 0                                  &&
            OUTPUTS(0).R9[Long].get == blobUniqueId                       &&
            blobStateValueIn == 0
        } else {
            false
        }
    } else {
        false
    }
    
    // SET STATUS
    val validSetStatus = if (validBlob0 && blobStateIn == 0) {
        OUTPUTS(0).value == blobValueIn                               &&
        OUTPUTS(0).tokens(0)._2 == 2                                  &&
        OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                   &&
        isBlobR5Replicated(0)                                         &&
        OUTPUTS(0).R6[SigmaProp].get == ownerPKin                     &&
        OUTPUTS(0).R9[Long].get == blobUniqueId                       &&
        (
            (OUTPUTS(0).R7[Long].get == 2)
            ||
            (
            OUTPUTS(0).R7[Long].get == 1                              &&
            OUTPUTS(0).R8[Long].get <= blobValueIn - blobMinValue
            )
        )
    } else {
        false
    }
    
    // UNSET STATUS 
    // Upgrade to new blobscript
    val validUnsetStatus = if (validBlob0 && blobStateIn != 3) {
        OUTPUTS(0).value == blobValueIn                               &&
        OUTPUTS(0).tokens(0)._2 == 2                                  &&
        OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                   &&
        isBlobR5Replicated(0)                                         &&
        OUTPUTS(0).R6[SigmaProp].get == ownerPKin                     &&
        OUTPUTS(0).R7[Long].get == 0                                  &&
        OUTPUTS(0).R8[Long].get == 0                                  &&
        OUTPUTS(0).R9[Long].get == blobUniqueId
    } else {
        false
    }
    
    // SELL BLOB
    val validSell = if (validBlob0 && (blobStateIn == 2)) {
        if (OUTPUTS.size > 3) {
            val minBlobSellFee = max(blobStateValueIn * blobExchangeFee / 1000, 1000000L)
            if (OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes) {
                OUTPUTS(1).value >= minBlobSellFee                            &&
                OUTPUTS(2).propositionBytes == ownerPKin.propBytes            &&
                OUTPUTS(2).value >= blobStateValueIn                          &&
                OUTPUTS(0).value == blobValueIn                               &&
                OUTPUTS(0).tokens(0)._2 == 2                                  &&
                OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                   &&
                isBlobR5Replicated(0)                                         &&
                OUTPUTS(0).R7[Long].get == 0                                  &&
                OUTPUTS(0).R8[Long].get == 0                                  &&
                OUTPUTS(0).R9[Long].get == blobUniqueId
            } else {
                false
            }
        } else {
            false
        }
    } else {
        false
    }

    // ENGAGE FIGTH
    val validEngageFigth = if (validBlob0 && validBlob1 && (blobStateIn == 1)) {
        if (OUTPUTS.size >= 4) {
            if (blake2b256(OUTPUTS(2).propositionBytes) == gameScriptHash) {
                //ensure blob replication in Oatmeal reserver script to reduce ergoTree size
                blake2b256(INPUTS(2).propositionBytes) == oatmealReserverHash
            } else {
                false
            }
        } else {
            false
        }
    } else {
        false
    }

    // FIGTH RESULT
    val validFightResult = if (validBlob0 && validBlob1 && (blobStateIn == 3)) {
        (
            ( // blob replicated 0
            OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                   &&
            // R5 checked by the Game script                              &&
            OUTPUTS(0).R6[SigmaProp].get == ownerPKin                     &&
            OUTPUTS(0).R7[Long].get == 0                                  &&
            OUTPUTS(0).R8[Long].get == 0                                  &&
            OUTPUTS(0).R9[Long].get == blobUniqueId                       &&
            OUTPUTS(0).tokens(0)._2 == 2
            )
        ||
            ( // blob replicated 1
            OUTPUTS(1).R4[Coll[Byte]].get == blobDescIn                   &&
            // R5 checked by the Game script                              &&
            OUTPUTS(1).R6[SigmaProp].get == ownerPKin                     &&
            OUTPUTS(1).R7[Long].get == 0                                  &&
            OUTPUTS(1).R8[Long].get == 0                                  &&
            OUTPUTS(1).R9[Long].get == blobUniqueId                       &&
            OUTPUTS(1).tokens(0)._2 == 2
            )
        )
    } else {
        false
    }

    // FEED BLOB
    val validFeed = if (validBlob0 && !validBlob1 && (blobStateIn == 0)) {
        if (OUTPUTS.size > 2) {
            if (OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes) {
                OUTPUTS(0).value == blobValueIn                                &&
                OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                    &&
                OUTPUTS(0).R5[Coll[Long]].get(2) == blobNumGameIn              &&
                OUTPUTS(0).R5[Coll[Long]].get(3) == blobNumWinIn               &&
                OUTPUTS(0).R6[SigmaProp].get == ownerPKin                      &&
                OUTPUTS(0).R7[Long].get == 0                                   &&
                OUTPUTS(0).R8[Long].get == 0                                   &&
                OUTPUTS(0).R9[Long].get == blobUniqueId                        &&
                OUTPUTS(0).tokens(0)._2 == 2                                   &&
                OUTPUTS(1).tokens.size == 1                                    &&
                OUTPUTS(1).tokens(0)._1 == OatmealTokenNFTId                   &&
                OUTPUTS(0).R5[Coll[Long]].get(0) <= 1000                       &&
                OUTPUTS(0).R5[Coll[Long]].get(1) <= 1000                       &&
                OUTPUTS(1).tokens(0)._2 >= (OUTPUTS(0).R5[Coll[Long]].get(0) + OUTPUTS(0).R5[Coll[Long]].get(1)) - (blobAttLevelIn + blobDefLevelIn)
            } else {
                false
            }
        } else {
            false
        }
    } else {
        false
    }
    
    
    // FINAL RESULT
    (sigmaProp(validConfigBox) &&
        (
            ( // Owner actions
            ownerPKin && sigmaProp( 
                                    validKill               ||
                                    validAddWidthdrawFund   ||
                                    validSetStatus          ||
                                    validUnsetStatus        ||
                                    validFeed
                                  )
            ) ||
            (// Action by anyone
                sigmaProp(
                          validSell                         ||
                          validEngageFigth                  ||
                          validFightResult
                         )
            )
        )
    )
}

