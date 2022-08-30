{   
    // inputs
    val requestAmountNano = SELF.value
    val ownerPK = SELF.R4[SigmaProp].get
    
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val txFee = configBox.R5[Coll[Long]].get(1)
    val oatmealPrice = configBox.R5[Coll[Long]].get(5)
    
    val validBuy =  if (OUTPUTS.size > 3) {
                        val tokenSellAmount = (requestAmountNano - txFee - BoxMinValue) / oatmealPrice
                        // dApp pay box
                        OUTPUTS(1).propositionBytes == proveDlog(GameFundPK).propBytes               &&
                        OUTPUTS(1).value >= tokenSellAmount * oatmealPrice                           &&
                        // Token delivery box
                        OUTPUTS(2).propositionBytes == ownerPK.propBytes                             &&
                        OUTPUTS(2).tokens(0)._1 == OatmealTokenNFTId                                 &&
                        OUTPUTS(2).tokens(0)._2 == tokenSellAmount
                    } else {
                        false
                    }
    
    ownerPK ||
      sigmaProp( 
        validConfigBox     &&
        validBuy
      )
}