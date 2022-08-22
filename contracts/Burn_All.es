{   

    val validBurn =  if (OUTPUTS.size == 2) {
                        OUTPUTS(0).propositionBytes == proveDlog(GameFundPK).propBytes               &&
                        OUTPUTS(0).tokens.size == 0                                                  &&
                        OUTPUTS(1).value == 1100000L                                                 &&
                        OUTPUTS(1).tokens.size == 0
                    } else {
                        false
                    }
    
      sigmaProp(validBurn)
}
