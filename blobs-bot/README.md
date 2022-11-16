# Blob's bot
Bot running the Blob's Topia off-chain transaction without signing required
Fight bot allowing to automatically re-engage the fight for a configured amount

# Usage
## Install
npm i

## Run dApp offchain bot
- node blobs-bot.js

## Run the fight bot
The fight bot will set the status of the blobs to "Ready to fight" for the provided amount when the blobs are in status "Quiet".
- Copy .env.example to .env file
- Set the required info for your mnemonic, address, blob IDs, and amount
- node fight-bot.js
