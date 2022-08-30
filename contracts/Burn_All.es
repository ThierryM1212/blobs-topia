{   
    // config box
    val configBox = CONTEXT.dataInputs(0)
    val validConfigBox = configBox.tokens(0)._1 == ConfigNFTId
    val txFee = configBox.R5[Coll[Long]].get(1)

    // All the tokens had to be burnt
    val validBurn = if (OUTPUTS.size == 2) {
                        OUTPUTS(0).tokens.size == 0    && // no tokens
                        OUTPUTS(1).tokens.size == 0       // no tokens
                    } else {
                        false
                    }
    
    // prevent too small burning by the bot, without signing
    val validBurnByAnyone = if (OUTPUTS(0).propositionBytes == proveDlog(GameFundPK).propBytes) {
                                OUTPUTS(0).value >= 100000000L   && // min 0.1 ERG
                                OUTPUTS(1).value == txFee           // txFee
                            } else {
                                false
                            }        
    
    // Game owner can burn the tokens for whichever amount and txFee
    // Without signing the minimal amount is 0.1 erg and must go to the game owner
    sigmaProp(validBurn && validConfigBox) && (proveDlog(GameFundPK) || sigmaProp(validBurnByAnyone))
}
