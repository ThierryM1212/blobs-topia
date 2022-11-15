{ 
    // input
    val blobValueIn = SELF.value
    val blobDescIn = SELF.R4[Coll[Byte]].get
    val blobAttLevelIn = SELF.R5[Coll[Int]].get(0)
    val blobDefLevelIn = SELF.R5[Coll[Int]].get(1)
    val blobNumGameIn = SELF.R5[Coll[Int]].get(2)
    val blobNumWinIn = SELF.R5[Coll[Int]].get(3)
    val blobArmorLvlIn = SELF.R5[Coll[Int]].get(4)
    val blobWeaponTypeIn = SELF.R5[Coll[Int]].get(5)
    val blobWeaponLvlIn = SELF.R5[Coll[Int]].get(6)
    val ownerPKin = SELF.R6[SigmaProp].get
    val blobStateIn = SELF.R7[Long].get
    val blobStateValueIn = SELF.R8[Long].get
    val blobUniqueId = SELF.R9[Long].get
    
    // config box, required for any blob action
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Coll[Byte]]].get(0)
    val gameScriptHash = configBox.R4[Coll[Coll[Byte]]].get(1)
    val oatmealReserverHash = configBox.R4[Coll[Coll[Byte]]].get(2)
    val burnAllScriptHash = configBox.R4[Coll[Coll[Byte]]].get(3)
    val blobinatorScriptHash = configBox.R4[Coll[Coll[Byte]]].get(5)
    val blobExchangeFee = configBox.R5[Coll[Long]].get(0)
    val txFee = configBox.R5[Coll[Long]].get(1)
    val spicyOatmealDefiNumber = configBox.R5[Coll[Long]].get(8)
    val armorConf = configBox.R6[Coll[Long]].get // [armor0Price, armor0Att, armor0Def, armor1Price, armor1Att, armor1Def,... , armor3Def]
    val weaponUpgradePricesConf = configBox.R7[Coll[Long]].get // [ choose weapon/change type , 0->1, 1->2, 2->3] weapons upgrade prices

    
    // BASIC BLOB VERIFICATION in OUTPUTS(0) and OUTPUTS(1)
    val blobMinValue = 2 * BoxMinValue + txFee
    val validBlob0 = if (blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash ) {
        OUTPUTS(0).tokens.size >= 1                                             &&
        OUTPUTS(0).tokens(0)._1 == GameTokenNFTId                               &&
        OUTPUTS(0).value >= blobMinValue
    } else {
        false
    }
    val validBlob1 = if (blake2b256(OUTPUTS(1).propositionBytes) == blobScriptHash ) {
        OUTPUTS(1).tokens.size >= 1                                             &&
        OUTPUTS(1).tokens(0)._1 == GameTokenNFTId                               &&
        OUTPUTS(1).value >= blobMinValue
    } else {
        false
    }
    val basicBlob0Replicated = if (validBlob0) {
        OUTPUTS(0).R9[Long].get == blobUniqueId                       &&
        OUTPUTS(0).tokens(0)._2 == 2                                  &&
        OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                   &&
        OUTPUTS(0).R6[SigmaProp].get == ownerPKin
    } else {
        false
    }
    
    // KILL BLOB
    val validKill = if (!validBlob0) {
        val blobKillMinFee = max(blobValueIn * blobExchangeFee / 1000, BoxMinValue)
        if (blake2b256(OUTPUTS(0).propositionBytes) == burnAllScriptHash) {
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
        val minBlobWidthdrawFee = max(blobValueDiff * blobExchangeFee / 1000, BoxMinValue)
        if (OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes) {
            OUTPUTS(1).value >= minBlobWidthdrawFee                       &&
            basicBlob0Replicated                                          &&
            OUTPUTS(0).R5[Coll[Int]].get == SELF.R5[Coll[Int]].get        &&
            OUTPUTS(0).R7[Long].get == 0
        } else {
            false
        }
    } else {
        false
    }
    
    // SET STATUS
    // setable:
    // 1 - ready for fight
    // 2 - on sale
    // 4 - ready for blobinator fight
    val validSetStatus = if (validBlob0 && blobStateIn == 0) {
        if (OUTPUTS(0).value == blobValueIn                               &&
            basicBlob0Replicated                                          &&
            OUTPUTS(0).R5[Coll[Int]].get == SELF.R5[Coll[Int]].get
            ) {
                if (OUTPUTS(0).R7[Long].get == 4 && OUTPUTS(0).tokens.size > 1) {
                    // waiting Blobinator fight
                    OUTPUTS(0).tokens(1)._1 == SpicyOatmealNFTId          &&
                    OUTPUTS(0).tokens(1)._2 == spicyOatmealDefiNumber
                } else {
                    ((OUTPUTS(0).R7[Long].get == 2) // sell
                    ||
                    ( // ready for fight
                    OUTPUTS(0).R7[Long].get == 1                              &&
                    OUTPUTS(0).R8[Long].get <= blobValueIn - blobMinValue     &&
                    OUTPUTS(0).R8[Long].get >= 100000000L     // min fight amount 0.1 ERG
                    ))
                }
        } else {
            false
        }
    } else {
        false
    }
    
    // UNSET STATUS 
    // Upgrade to new blobscript
    val validUnsetStatus = if (validBlob0 && blobStateIn != 3 && blobStateIn != 5) {
        OUTPUTS(0).value == blobValueIn                               &&
        basicBlob0Replicated                                          &&
        OUTPUTS(0).R5[Coll[Int]].get == SELF.R5[Coll[Int]].get        &&
        OUTPUTS(0).tokens.size == 1                                   &&
        OUTPUTS(0).R7[Long].get == 0                                  &&
        OUTPUTS(0).R8[Long].get == 0
    } else {
        false
    }
    
    // SELL BLOB
    val validSell = if (validBlob0 && (blobStateIn == 2)) {
        if (OUTPUTS.size > 3) {
            val minBlobSellFee = max(blobStateValueIn * 2 * blobExchangeFee / 1000, BoxMinValue)
            if (OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes) {
                OUTPUTS(1).value >= minBlobSellFee                            &&
                OUTPUTS(2).propositionBytes == ownerPKin.propBytes            &&
                OUTPUTS(2).value >= blobStateValueIn                          &&
                OUTPUTS(0).value == blobValueIn                               &&
                OUTPUTS(0).tokens(0)._2 == 2                                  &&
                OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                   &&
                OUTPUTS(0).R5[Coll[Int]].get == SELF.R5[Coll[Int]].get        &&
                OUTPUTS(0).R7[Long].get == 0                                  &&
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

    // ENGAGE fight
    val validEngageFigth = if (validBlob0 && validBlob1 && (blobStateIn == 1)) {
        if (OUTPUTS.size >= 4) {
            if (blake2b256(OUTPUTS(2).propositionBytes) == gameScriptHash) {
                //ensure blob replication in Oatmeal reserve script to reduce ergoTree size
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

    // ENGAGE BLOBINATOR and BLOBINATOR FIGHT RESULT
    val validEngageFightBlobinator = if (validBlob0 && (blobStateIn == 4 || blobStateIn == 5) && INPUTS.size == 2) {
        blake2b256(INPUTS(1).propositionBytes) == blobinatorScriptHash &&
        OUTPUTS(0).R9[Long].get == blobUniqueId                        &&
        OUTPUTS(0).tokens(0)._2 >= 1                                   &&
        OUTPUTS(0).R4[Coll[Byte]].get == blobDescIn                    &&
        OUTPUTS(0).R5[Coll[Int]].get == SELF.R5[Coll[Int]].get         &&
        OUTPUTS(0).R6[SigmaProp].get == ownerPKin                      &&
        (
            (blobStateIn == 4 && OUTPUTS(0).R7[Long].get == 5 && OUTPUTS(0).tokens(0)._2 == 1)    ||
            (blobStateIn == 5 && OUTPUTS(0).R7[Long].get == 0 && OUTPUTS(0).tokens(0)._2 == 2)
        )
    } else {
        false
    }
    
    // fight RESULT
    val validFightResult = if (validBlob0 && validBlob1 && (blobStateIn == 3)) {
        (
            ( // blob replicated 0
            basicBlob0Replicated                                          &&
            // R5 checked by the Game script                              &&
            OUTPUTS(0).R7[Long].get == 0
            )
        ||
            ( // blob replicated 1
            OUTPUTS(1).R4[Coll[Byte]].get == blobDescIn                   &&
            // R5 checked by the Game script                              &&
            OUTPUTS(1).R6[SigmaProp].get == ownerPKin                     &&
            OUTPUTS(1).R7[Long].get == 0                                  &&
            OUTPUTS(1).R9[Long].get == blobUniqueId                       &&
            OUTPUTS(1).tokens(0)._2 == 2
            )
        )
    } else {
        false
    }

    // FEED BLOB
    // Upgrade blob armor or weapon
    val validUpgrade = if (validBlob0 && !validBlob1 && (blobStateIn == 0)) {
        if (OUTPUTS.size > 2) {
            if (blake2b256(OUTPUTS(1).propositionBytes) == burnAllScriptHash) {
                OUTPUTS(0).value == blobValueIn                               &&
                basicBlob0Replicated                                          &&
                OUTPUTS(0).R5[Coll[Int]].get(2) == blobNumGameIn              &&
                OUTPUTS(0).R5[Coll[Int]].get(3) == blobNumWinIn               &&
                OUTPUTS(0).R7[Long].get == 0                                  &&
                OUTPUTS(1).tokens.size == 1                                   &&
                OUTPUTS(1).tokens(0)._1 == OatmealTokenNFTId                  &&
                (
                    ( // increase attack and/or defense lvl
                        OUTPUTS(0).R5[Coll[Int]].get(0) <= 1000                      &&
                        OUTPUTS(0).R5[Coll[Int]].get(1) <= 1000                      &&
                        OUTPUTS(0).R5[Coll[Int]].get(4) == blobArmorLvlIn            &&
                        OUTPUTS(0).R5[Coll[Int]].get(5) == blobWeaponTypeIn          &&
                        OUTPUTS(0).R5[Coll[Int]].get(6) == blobWeaponLvlIn           &&
                        OUTPUTS(1).tokens(0)._2 >= (OUTPUTS(0).R5[Coll[Int]].get(0) + OUTPUTS(0).R5[Coll[Int]].get(1)) - (blobAttLevelIn + blobDefLevelIn)
                    ) ||
                    ( // upgrade armor
                        OUTPUTS(0).R5[Coll[Int]].get(0) == blobAttLevelIn            &&
                        OUTPUTS(0).R5[Coll[Int]].get(1) == blobDefLevelIn            &&
                        OUTPUTS(0).R5[Coll[Int]].get(4) == blobArmorLvlIn + 1        &&
                        OUTPUTS(0).R5[Coll[Int]].get(5) == blobWeaponTypeIn          &&
                        OUTPUTS(0).R5[Coll[Int]].get(6) == blobWeaponLvlIn           &&
                        OUTPUTS(1).tokens(0)._2 >= armorConf(3 * (blobArmorLvlIn + 1))
                    ) ||
                    ( // choose / upgrade weapon
                        OUTPUTS(0).R5[Coll[Int]].get(0) == blobAttLevelIn            &&
                        OUTPUTS(0).R5[Coll[Int]].get(1) == blobDefLevelIn            &&
                        OUTPUTS(0).R5[Coll[Int]].get(4) == blobArmorLvlIn            &&
                        // type 0 initial weapon lvl 0
                        // type 1 sword lvl 0,1,2,3
                        // type 2 axe lvl 0,1,2,3
                        // type 3 mace lvl 0,1,2,3
                        (
                            ( // choose a weapon - change weapon type (also reset level)
                                OUTPUTS(0).R5[Coll[Int]].get(5) > 0                     &&
                                OUTPUTS(0).R5[Coll[Int]].get(5) != blobWeaponTypeIn     &&
                                OUTPUTS(0).R5[Coll[Int]].get(6) == 0                    &&
                                OUTPUTS(1).tokens(0)._2 >= weaponUpgradePricesConf(0)
                            ) ||
                            ( // upgrade weapon - same type, lvl + 1
                                OUTPUTS(0).R5[Coll[Int]].get(5) == blobWeaponTypeIn     &&
                                OUTPUTS(0).R5[Coll[Int]].get(6) == blobWeaponLvlIn + 1  &&
                                OUTPUTS(1).tokens(0)._2 >= weaponUpgradePricesConf(blobWeaponLvlIn + 1)
                            )
                        )
                    )
                )
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
                                    validUpgrade
                                  )
            ) ||
            (// Action by anyone
                sigmaProp(
                          validSell                         ||
                          validEngageFigth                  ||
                          validFightResult                  ||
                          validEngageFightBlobinator
                         )
            )
        )
    )
}

