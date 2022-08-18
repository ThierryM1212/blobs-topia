{   
    // inputs
    val reserveValue = SELF.value
    val reserveTokens = SELF.tokens(0)
    
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val oatmealPrice = configBox.R6[Coll[Long]].get(5)
    
    val validSell =  if (OUTPUTS.size > 3) {
                        val tokenSellAmount = reserveTokens._2 - OUTPUTS(0).tokens(0)._2
                        // Reserve replicated
                        blake2b256(OUTPUTS(0).propositionBytes) == blake2b256(SELF.propositionBytes) &&
                        OUTPUTS(0).value == reserveValue                                             &&
                        OUTPUTS(0).tokens.size == 1                                                  &&
                        OUTPUTS(0).tokens(0)._1 == OatmealTokenNFTId                                 &&
                        OUTPUTS(0).tokens(0)._2 == reserveTokens._2 - tokenSellAmount                &&
                        // dApp pay box
                        OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes               &&
                        OUTPUTS(1).value >= tokenSellAmount * oatmealPrice                           &&
                        // Token delivery box
                        OUTPUTS(2).tokens(0)._1 == OatmealTokenNFTId                                 &&
                        OUTPUTS(2).tokens(0)._2 == tokenSellAmount
                    } else {
                        false
                    }
    
    proveDlog(GameFundPK) ||
      sigmaProp( 
        validConfigBox     &&
        validSell
      )
}
