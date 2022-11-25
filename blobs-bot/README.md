# Blob's bot
Bot running the Blob's Topia off-chain transaction without signing required
Fight bot allowing to automatically re-engage the fight for a configured amount

# Usage
## Install
npm i

## Install pm2
npm i pm2 -g

## Run dApp offchain bot
First start:
- pm2 start blobs-bot.config.cjs

Stop:
- pm2 stop blobs-bot

Start:
- pm2 start blobs-bot

## Run the fight bot
The fight bot will set the status of the blobs to "Ready to fight" for the provided amount when the blobs are in status "Quiet".<br/>
- Copy .env.example to .env file
- Set the required info for your mnemonic, address, blob IDs, and amount

First start:
- pm2 start fight-bot.config.cjs

Stop:
- pm2 stop fight-bot

Start:
- pm2 start fight-bot

## Monitor the bots
- pm2 monit
