# blobs-topia
Blob fighter game on ergo blockchain 
https://www.blobs-topia.fun/

# What is Blob's Topia ?
Blob's Topia is a game on Ergo blockchain in which you can own blob fighters smart contracts.
Those blob fighters are owning an amount of ERG and can bet an amount for a fight.
Once two blobs wait for the same bet, they can engage a fight.
The winner get all the bets, minus the miner fees.
Both winner and loser get some Oatmeal tokens to be able to feed their blob.
By feeding a blob you can increase their Attack or Defense level to make them stronger and increase your winning ratio.

# Do I really own my blob ?
Yes, most of the actions for a blob are only doable by the address set in that blob.

# What can I do with my blob ?
- deposit/widthdraw ergs
- feed the blob
- engage fight (and cancel)
- engage sale (and cancel)
- fight
- sell (change owner)
- kill the blob

# Project structure
## front-end
React static js application

## contracts
Ergo contracts used by the game to be compiled off line and integrated in the script_constant.js files

## blobs-bot
Off-chain bot that can process the dApp requests, not mandatory as the buttons exists in the front end

