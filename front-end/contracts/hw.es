{
    val configBox = CONTEXT.dataInputs(0)
    // Check config box NFT
    val validConfigBox = configBox.tokens(0)._1 == configBoxNFTId
    val defined = OUTPUTS(0).tokens.size > 0 && OUTPUTS(0).R4[Coll[Byte]].isDefined

    if (validConfigBox && defined) {
      val ownerScript = configBox.R4[SigmaProp].get
      val priceOfServiceToken = configBox.R5[Long].get
      sigmaProp (if (defined) {
        val inServiceToken = SELF.tokens(0)
        val outServiceToken = OUTPUTS(0).tokens(0)
        val outValue: Long = ((inServiceToken._2 - outServiceToken._2) * priceOfServiceToken).toLong
        allOf(Coll(
            inServiceToken._1 == serviceTokenId,
            outServiceToken._1 == serviceTokenId,
            OUTPUTS(0).propositionBytes == SELF.propositionBytes,
            OUTPUTS(0).R4[Coll[Byte]].get == SELF.id,
            OUTPUTS(1).value >= outValue,
            OUTPUTS(1).propositionBytes == ownerScript.propBytes
            ))
      } else { false } )
    }
    else if (validConfigBox) {
      val ownerScript = configBox.R4[SigmaProp].get
      ownerScript
    }
    else {sigmaProp (false)}
}
  
  