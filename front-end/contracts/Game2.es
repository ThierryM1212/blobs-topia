{ 
    // Script protecting the box with the fight result between two blobs
    // INPUTS(0): Blob playing the game (R8=3, R9=0)
    // INPUTS(1): Blob having created the game (R8=3, R9=GameAmount)
    // INPUTS(2): This box
    // INPUTS(>=3): player wallet to provide the transaction fee

    val p1PK = SELF.R4[SigmaProp].get
    val p2PK = SELF.R6[SigmaProp].get
    val p1Info = SELF.R5[Coll[Long]].get
    val p2Info = SELF.R7[Coll[Long]].get
    val blobScriptHash = SELF.R8[Coll[Byte]].get
    val maxPowerDiff = 4500 // allow a maximum of 60/40 victory ratio to keep the game "fair"
    val gameScriptHash = blake2b256(SELF.propositionBytes)
    
    // Weighting the stats for the max value: Att: 10, Def: 5, games: 4, victories: 8
    val p1Power = 10*p2Info(0)+5*p2Info(1)+4*p2Info(2)+8*p2Info(3)
    val p2Power = 10*p2Info(0)+5*p2Info(1)+4*p2Info(2)+8*p2Info(3)
    // Weighting the stats for the min value: Def: 10, games: 10
    val p1Def = 10*p1Info(1) + 10*p1Info(2)
    val p2Def = 10*p2Info(1) + 10*p2Info(2)
    
    // Probability problem is as follow:
    //   P1 and P2 pick 2 numbers P1 in [a,b] and P2 in [a+n,b+n]
    //   Here a=0, b=65535 (int 16bit), max(n)=4500
    //   Probability P1 wins is: (1-n/(b-a+1)²*(1-1/(b-a+n+1)*1/2 
    //   https://math.stackexchange.com/questions/4321167/compute-win-lose-chances-picking-two-integers-in-different-overlapping-intervals
    val p1PowerAdj = if (p1Power > p2Power + maxPowerDiff) p2Power + maxPowerDiff else p1Power
    val p2PowerAdj = if (p2Power > p1Power + maxPowerDiff) p1Power + maxPowerDiff else p2Power
    // Defense and parties set a min score
    val p1DefAdj = if (p1Def > p2Def + maxPowerDiff) p2Def + maxPowerDiff else p1Def
    val p2DefAdj = if (p2Def > p1Def + maxPowerDiff) p1Def + maxPowerDiff else p2Def
    // compute score based on 16bit integer grabbed in the headers(0) 
    // it cannot be predicted when this box was created
    // The same computation is done in the front end javascript to build the correct game widthdraw transaction
    val p1Score = max(byteArrayToBigInt(CONTEXT.headers(0).id.slice(1, 3)).toBigInt, p1DefAdj) + p1PowerAdj
    val p2Score = max(byteArrayToBigInt(CONTEXT.headers(0).id.slice(5, 7)).toBigInt, p2DefAdj) + p2PowerAdj
    
    val p1win = (p1Score > p2Score) // P1 engage the game and lose in case of draw
    
    // randomly affect attack or defense points as game reward (3 for the winner 1 for the loser)
    val isIncreaseAttack = ((byteArrayToBigInt(CONTEXT.headers(0).id.slice(7, 9)).toBigInt % 2) == 1)
    
    // check if blob1 and blob2 have their statistics increased properly: 
    //  - attack or defense
    //  - 1 point for lose, 3 points for win
    val outP1Info = OUTPUTS(0).R5[Coll[Long]].get
    // P1 win increase att+3, party+1, victories+1
    // P1 win increase def+3, party+1, victories+1
    // P1 lose increase att+1, party+1
    // P1 lose increase def+1, party+1
    val validP1Info = (p1win && isIncreaseAttack && outP1Info(0) == p2Info(0)+3 && outP1Info(1) == p2Info(1) && outP1Info(2) == p2Info(2)+1 && outP1Info(3) == p2Info(3)+1)  ||
                      (p1win && !isIncreaseAttack && outP1Info(0) == p2Info(0) && outP1Info(1) == p2Info(1)+3 && outP1Info(2) == p2Info(2)+1 && outP1Info(3) == p2Info(3)+1) ||
                      (!p1win && isIncreaseAttack && outP1Info(0) == p2Info(0)+1 && outP1Info(1) == p2Info(1) && outP1Info(2) == p2Info(2)+1 && outP1Info(3) == p2Info(3))   ||
                      (!p1win && !isIncreaseAttack && outP1Info(0) == p2Info(0) && outP1Info(1) == p2Info(1)+1 && outP1Info(2) == p2Info(2)+1 && outP1Info(3) == p2Info(3)) 
                    
    val outP2Info = OUTPUTS(1).R5[Coll[Long]].get
    // P2 win increase att+3, party+1, victories+1
    // P2 win increase def+3, party+1, victories+1
    // P2 lose increase att+1, party+1
    // P2 lose increase def+1, party+1
    val validP2Info = (!p1win && isIncreaseAttack && outP2Info(0) == p2Info(0)+3 && outP2Info(1) == p2Info(1) && outP2Info(2) == p2Info(2)+1 && outP2Info(3) == p2Info(3)+1)  ||
                      (!p1win && !isIncreaseAttack && outP2Info(0) == p2Info(0) && outP2Info(1) == p2Info(1)+3 && outP2Info(2) == p2Info(2)+1 && outP2Info(3) == p2Info(3)+1) ||
                      (p1win && isIncreaseAttack && outP2Info(0) == p2Info(0)+1 && outP2Info(1) == p2Info(1) && outP2Info(2) == p2Info(2)+1 && outP2Info(3) == p2Info(3))     ||
                      (p1win && !isIncreaseAttack && outP2Info(0) == p2Info(0) && outP2Info(1) == p2Info(1)+1 && outP2Info(2) == p2Info(2)+1 && outP2Info(3) == p2Info(3))
    
    // Check that the amount go to the winner
    val blob1Funds = INPUTS(0).value
    val blob2Funds = INPUTS(1).value
    val gameAmount = SELF.value / 2
    val validValues = (p1win && OUTPUTS(0).value == blob1Funds + gameAmount - dAppFee && OUTPUTS(1).value == blob2Funds) ||
                      (!p1win && OUTPUTS(0).value == blob1Funds && OUTPUTS(1).value == blob2Funds + gameAmount - dAppFee)

    proveDlog(GameFundPK) ||  // DEBUG
    ( (p1PK || p2PK) &&
    sigmaProp ( 
                // P1 blob
                blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash &&
                OUTPUTS(0).tokens.size == 1 &&
                OUTPUTS(0).tokens(0)._1 == GameTokenNFTId &&
                OUTPUTS(0).tokens(0)._2 == 2 &&
                OUTPUTS(0).R6[SigmaProp].get == p1PK &&
                OUTPUTS(0).R7[Coll[Byte]].get == gameScriptHash &&
                OUTPUTS(0).R8[Long].get == 0 &&
                OUTPUTS(0).R9[Long].get == 0 &&
                // P2 blob
                blake2b256(OUTPUTS(1).propositionBytes) == blobScriptHash &&
                OUTPUTS(1).tokens.size == 1 &&
                OUTPUTS(1).tokens(0)._1 == GameTokenNFTId &&
                OUTPUTS(1).tokens(0)._2 == 2 &&
                OUTPUTS(1).R6[SigmaProp].get == p2PK &&
                OUTPUTS(1).R7[Coll[Byte]].get == gameScriptHash &&
                OUTPUTS(1).R8[Long].get == 0 &&
                OUTPUTS(1).R9[Long].get == 0 &&
                // dAppFee
                OUTPUTS(2).propositionBytes == proveDlog(GameFundPK).propBytes &&
                OUTPUTS(2).value == dAppFee &&
                OUTPUTS(2).tokens.size == 0 &&
                
                validP1Info &&
                validP2Info &&
                validValues
              )
    )
}

