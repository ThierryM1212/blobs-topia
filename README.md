# blobs-topia
Blob fighter game on ergo blockchain 
https://www.blobs-topia.fun/

# What is Blob's Topia ?
Blob's Topia is a game on Ergo blockchain in which you can own blob fighters smart contracts.<br>
Those blob fighters are owning an amount of ERG and can bet an amount for a fight.<br>
Once two blobs wait for the same bet, they can engage a fight.<br>
The winner get all the bets, minus the miner fees and the Blobinator fee.<br>
Both winner and loser get some Oatmeal tokens to be able to feed their blob and Spicy Oatmeal tokens to fight the Blobinator.<br>
By feeding a blob you can increase their Attack or Defense level to make them stronger and increase your winning ratio.<br>
The blobs have also an upgradeable armor and you can choose and upgrade their weapons to make them stronger<br>
The blobinator fee is collected during the fights, 3% of the fight amount.<br>
Once the total blobinator reach 1 ERG, a Blobinator is invocated and the blob can try to bait him with Spicy Oatmeal tokens.<br>
The Blobs have a fixed winning ratio of 1/30 against the Blobinator, the fight cost 2 transaction fees (0.0022 ERG).<br>

# Do I really own my blob ?
Yes, most of the actions for a blob are only doable by the address set in that blob.

# What can I do with my blob ?
What can I do with my blob ?
- ready to fight (and cancel)<br>
Set the Blob ready to fight for an amount of ERG (min 0.1).
- fight another blob<br>
Engage the fight with a Blob waiting for the same amount.
- bait the Blobinator (and cancel)<br>
Wait for a Blobinator and try to fight it.
- fight a Blobinator (if invoked)<br>
Fight the Blobinator.
- engage sale (and cancel)<br>
Set the Blob on sale for an amount of ERG (min 0.1).
- sell (change owner)<br>
Sell the Blob to another player (address).
- deposit/widthdraw ergs<br>
Add or remove ERGs from the Blob, minimum 0.1 ERG.
- feed the blob<br>
Increase the attack and defense level of the Blob by feeding him with Oatmeal tokens earned as fight reward.
- choose a weapon<br>
Choose a type of weapon for a Blob (Sword, Axe or Mace).
- upgrade the weapon<br>
Upgrade the weapon of the Blob to the next level.
- change weapon<br>
Change the kind of weapon for the Blob (restart at level 0).
- upgrade the armor<br>
Upgrade the armor of the Blob to the next level.
- kill the blob<br>
Destroy the Blob and returns the ERG content to the owner.



# Project structure
## front-end
React static js application

## contracts
Ergo contracts used by the game to be compiled off line and integrated in the script_constant.js files

## blobs-bot
Off-chain bot that can process the dApp requests, not mandatory as the buttons exists in the front end
Fight bot allowing to automatically re-engage the fight for a configured amount

