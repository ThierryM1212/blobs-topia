{   
    // inputs
    val requestAmountNano = SELF.value
    val ownerPK = SELF.R4[SigmaProp].get
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val oatmealPrice = configBox.R6[Coll[Long]].get(5)
    
    val validBuy =  if (OUTPUTS.size > 3) {
                        val tokenSellAmount = requestAmountNano / oatmealPrice
                        // dApp pay box
                        OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes               &&
                        OUTPUTS(1).value >= tokenSellAmount * oatmealPrice                           &&
                        // Token delivery box
                        OUTPUTS(2).tokens(0)._1 == OatmealTokenNFTId                                 &&
                        OUTPUTS(2).tokens(0)._2 == tokenSellAmount
                    } else {
                        false
                    }
    
    sigmaProp(ownerPK) ||
      sigmaProp( 
        validConfigBox     &&
        validBuy
      )
}