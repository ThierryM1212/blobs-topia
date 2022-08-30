{ 

    val p1PK = SELF.R4[SigmaProp].get
    val p1UniqueId = SELF.R5[Long].get
    val p1Info = SELF.R6[Coll[Long]].get
    val p2PK = SELF.R7[SigmaProp].get
    val p2UniqueId = SELF.R8[Long].get
    val p2Info = SELF.R9[Coll[Long]].get
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val blobScriptHash = configBox.R4[Coll[Coll[Byte]]].get(0)
    val txFee = configBox.R5[Coll[Long]].get(1)
    val numOatmealLose = configBox.R5[Coll[Long]].get(2)
    val numOatmealWin = configBox.R5[Coll[Long]].get(3)
    val maxPowerDiff = configBox.R5[Coll[Long]].get(4)
    
    // Weighting the stats for the max value: Att: 10, Def: 5, games: 4, victories: 8
    val p1Power = 6*p1Info(0)+3*p1Info(1)+2*p1Info(2)+4*p1Info(3)
    val p2Power = 6*p2Info(0)+3*p2Info(1)+2*p2Info(2)+4*p2Info(3)
    // Weighting the stats for the min value: Def: 10, games: 10
    val p1Def = 5*p1Info(1) + 5*p1Info(2)
    val p2Def = 5*p2Info(1) + 5*p2Info(2)
    
    // Probability problem is as follow:
    //   P1 and P2 pick 2 numbers P1 in [a,b] and P2 in [a+n,b+n]
    //   Here a=0, b=32767 (signed int 16bit), max(n)=3300 (max 60/40 victory ratio)
    //   Probability P1 wins is: (1-n/(b-a+1)²*(1-1/(b-a+n+1)*1/2 
    //   https://math.stackexchange.com/questions/4321167/compute-win-lose-chances-picking-two-integers-in-different-overlapping-intervals
    val p1PowerAdj = min(p2Power + maxPowerDiff, p1Power)
    val p2PowerAdj = min(p1Power + maxPowerDiff, p2Power)
    // Defense and parties set a min score
    val p1DefAdj = min(p2Def + maxPowerDiff, p1Def)
    val p2DefAdj = min(p1Def + maxPowerDiff, p2Def)
    // compute score based on 16-bit integer grabbed in the headers(0) 
    // it cannot be predicted when this box was created
    val p1Rand = byteArrayToBigInt(CONTEXT.headers(0).id.slice(1, 3))
    val p2Rand = byteArrayToBigInt(CONTEXT.headers(0).id.slice(3, 5))
    val p1RandAbs = max(p1Rand, -1 * p1Rand)
    val p2RandAbs = max(p2Rand, -1 * p2Rand)
    val p1Score = max(p1RandAbs, p1DefAdj) + p1PowerAdj
    val p2Score = max(p2RandAbs, p2DefAdj) + p2PowerAdj
    
    val p1win = (p1Score > p2Score)
    
    // Check that the amount go to the winner
    val blob1Funds = INPUTS(0).value
    val blob2Funds = INPUTS(1).value
    val gameAmount = ( SELF.value + txFee ) / 2
    val validValues = anyOf(Coll(
                        p1win && OUTPUTS(0).value == blob1Funds + 2 * gameAmount - 2 * txFee - 2 * BoxMinValue && OUTPUTS(1).value == blob2Funds,
                        !p1win && OUTPUTS(0).value == blob1Funds && OUTPUTS(1).value == blob2Funds + 2 * gameAmount - 2 * txFee - 2 * BoxMinValue
                      ))
                      
    // Check Oatmeal token distribution
    val validP1Oatmeal = if (OUTPUTS.size > 3) {
        OUTPUTS(2).propositionBytes == p1PK.propBytes       &&
        OUTPUTS(2).tokens.size == 1                         &&
        OUTPUTS(2).tokens(0)._1 == OatmealTokenNFTId        &&
        (
          (p1win && OUTPUTS(2).tokens(0)._2 == numOatmealWin)     || 
          (!p1win && OUTPUTS(2).tokens(0)._2 == numOatmealLose)
        )
    } else {
        false
    }
    val validP2Oatmeal = if (OUTPUTS.size > 3) {
        OUTPUTS(3).propositionBytes == p2PK.propBytes       &&
        OUTPUTS(3).tokens.size == 1                         &&
        OUTPUTS(3).tokens(0)._1 == OatmealTokenNFTId        &&
        (
          (p1win && OUTPUTS(3).tokens(0)._2 == numOatmealLose)     || 
          (!p1win && OUTPUTS(3).tokens(0)._2 == numOatmealWin)
        )
    } else {
        false
    }
    
    val validBlob0 = if (blake2b256(OUTPUTS(0).propositionBytes) == blobScriptHash) {
        OUTPUTS(0).R6[SigmaProp].get == p1PK             &&
        OUTPUTS(0).R7[Long].get == 0                     &&
        OUTPUTS(0).R8[Long].get == 0                     &&
        OUTPUTS(0).R9[Long].get == p1UniqueId
    } else {
        false
    }
    
    val validBlob1 = if (blake2b256(OUTPUTS(1).propositionBytes) == blobScriptHash) {
        OUTPUTS(1).R6[SigmaProp].get == p2PK             &&
        OUTPUTS(1).R7[Long].get == 0                     &&
        OUTPUTS(1).R8[Long].get == 0                     &&
        OUTPUTS(1).R9[Long].get == p2UniqueId
    } else {
        false
    }
    
    // check if blob1 and blob2 have their game played statistics increased properly 
    val validP1Info = if (OUTPUTS(0).R5[Coll[Long]].isDefined) {
        val outP1Info = OUTPUTS(0).R5[Coll[Long]].get
        anyOf(Coll(
                // P1 win increase party+1, victories+1
                p1win && outP1Info(0) == p1Info(0) && outP1Info(1) == p1Info(1) && outP1Info(2) == p1Info(2)+1 && outP1Info(3) == p1Info(3)+1,
                // P1 lose increase party+1
                !p1win && outP1Info(0) == p1Info(0) && outP1Info(1) == p1Info(1) && outP1Info(2) == p1Info(2)+1 && outP1Info(3) == p1Info(3),
              ))
    } else {
        false
    }
    
    val validP2Info = if (OUTPUTS(1).R5[Coll[Long]].isDefined) {
        val outP2Info = OUTPUTS(1).R5[Coll[Long]].get
        anyOf(Coll(
                // P2 win increase party+1, victories+1
                !p1win && outP2Info(0) == p2Info(0) && outP2Info(1) == p2Info(1) && outP2Info(2) == p2Info(2)+1 && outP2Info(3) == p2Info(3)+1,
                // P2 lose increase party+1
                p1win && outP2Info(0) == p2Info(0) && outP2Info(1) == p2Info(1) && outP2Info(2) == p2Info(2)+1 && outP2Info(3) == p2Info(3),
              ))
    } else {
        false
    }
    
    //proveDlog(GameFundPK) ||
    sigmaProp ({ 
      allOf(Coll(
                validConfigBox,
                validBlob0,
                validBlob1,
                
                // Game results
                validValues,
                validP1Oatmeal,
                validP2Oatmeal,
                validP1Info,
                validP2Info
              ))
              })

}

