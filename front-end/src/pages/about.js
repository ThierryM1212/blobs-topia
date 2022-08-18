import React from 'react';
import { Rating } from 'react-simple-star-rating';
import { WinPercent } from '../components/WinPercent';
import { BLOB_EXCHANGE_FEE, BLOB_MINT_FEE, BLOB_PRICE, MIN_NANOERG_BOX_VALUE, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, RATING_RANGES, TX_FEE } from '../utils/constants';
import { formatERGAmount } from '../utils/utils';

export default class AboutPage extends React.Component {

    render() {

        return (
            <div className='w-75 d-flex flex-column align-items-start m-2 p-2'>
                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is Blob's Topia ?</h5>
                    <h6>Blob's Topia is a game on Ergo blockchain in which you can own blob fighters smart contracts.</h6>
                    <h6>Those blob fighters are owning an amount of ERG and can bet an amount for a fight.</h6>
                    <h6>Once two blobs wait for the same bet, they can engage a fight.</h6>
                    <h6>The winner get all the bets, minus the miner fees.</h6>
                    <h6>Both winner and loser get some Oatmeal tokens to be able to feed their blob.</h6>
                    <h6>By feeding a blob you can increase their Attack or Defense level to make them stronger and increase your winning ratio.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Do I really own my blob ?</h5>
                    <h6>Yes, most of the actions for a blob are only doable by the address set in that blob.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>If I loose access to my address, my blob(s) will be stuck forever ?</h5>
                    <h6>Yes, except if there is a bug I'm not aware of.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is a blob, in reality ?</h5>
                    <h6>It is a unicellular body, named Physarum polycephalum that lives in the forest, it's size can range from micron to hectare.</h6>
                    <h6>It is not an animal but it can learn and share its learning.</h6>
                    <h6>It is can heals it-self.</h6>
                    <h6>It is can build optimized networks.</h6>
                    <h6>It has 720 different gender, so two blobs have 719/720 chances to be compatible.</h6>
                    <h6>More at:</h6>
                    <h6>
                        <a href="https://en.wikipedia.org/wiki/Physarum_polycephalum" target="_blank" rel="noreferrer">
                            https://en.wikipedia.org/wiki/Physarum_polycephalum
                        </a>
                    </h6>
                    <h6>
                        <a href="https://www.reuters.com/article/us-france-zoo-blob/paris-zoo-unveils-the-blob-an-organism-with-no-brain-but-720-sexes-idUSKBN1WV2AD" target="_blank" rel="noreferrer">
                            https://www.reuters.com/article/us-france-zoo-blob/paris-zoo-unveils-the-blob-an-organism-with-no-brain-but-720-sexes-idUSKBN1WV2AD
                        </a>
                    </h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What can I do with my blob ?</h5>
                    <h6> - deposit/widthdraw ergs</h6>
                    <h6> - feed the blob</h6>
                    <h6> - engage fight (and cancel)</h6>
                    <h6> - engage sale (and cancel)</h6>
                    <h6> - fight</h6>
                    <h6> - sold (change owner)</h6>
                    <h6> - kill the blob</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is required to play ?</h5>
                    <h6>Nothing, even without ERG address nor wallet you can play the "bot", and process manually the blob requests, the match making or the fight results.</h6>
                    <h6>To own a blob you need a compatible ergo wallet: </h6>
                    <h6>  Recommended setting: <strong>Nautilus on desktop Chrome browser</strong></h6>
                    <h6>This will allow you to run chained transactions to make the interaction with your blob faster.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How to play on desktop ?</h5>
                    <h6>You need to setup your address in the dApp and uses Nautilus (recommended) or SAFEW wallet in your browser.</h6>
                    <h6>With current SAFEW (v0.6.6) version you won't be able to run chained transactions.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How to play on mobile ?</h5>
                    <h6>You need to setup your address in the dApp and uses Ergo mobile wallet for signing transaction.</h6>
                    <h6>With current SAFEW (v0.6.6) version you won't be able to run chained transactions and will need to wait for the transactions to be mined for the next action.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How the winner is found ?</h5>
                    <h6>Depending the header id of the fight result transaction a winner is chosen by the smart contract.</h6>
                    <h6>With current Ergo wallet (1.10.2213) version you won't be able to run chained transactions and will need to wait for the transactions to be mined for the next action..</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is the winning reward ?</h5>
                    <h6>A fight is for a bet amount, engaged by each blob.</h6>
                    <h6>The winner get 2 * bet amount - 2 * transaction fee.</h6>
                    <h6>The winner get {NUM_OATMEAL_TOKEN_WINNER} oatmeal, the loser {NUM_OATMEAL_TOKEN_LOSER} oatmeal, used to feed the blob and increase its attack level and defense level.</h6>
                    <h6>The amount of distributed oatmeal tokens is configurable and may change.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What are the fees ?</h5>
                    <h6> - There is a fixed blob minting price, including a blob minting fee. (Blob price - blob mint fee - transaction fee) are credited to the blob after minting.</h6>
                    <h6>Current blob price: {formatERGAmount(BLOB_PRICE)} ERG</h6>
                    <h6>Current blob mint fee: {formatERGAmount(BLOB_MINT_FEE)} ERG</h6>
                    <h6> - The deposit, widthdraw and sell operations have a fee configured.</h6>
                    <h6>Current dApp fee: max({BLOB_EXCHANGE_FEE / 10} %, {formatERGAmount(MIN_NANOERG_BOX_VALUE)} ERG)</h6>
                    <h6> - There is no dApp fee on the fights, the miner transaction fees are taken from the figth bets.</h6>
                    <h6> - Those fees are configurable and may be adjusted by the game owner.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Why the miner fee is so high ({formatERGAmount(TX_FEE)} ERG) ?</h5>
                    <h6>Because we love the miners that allows ERG and that game to exist.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How the match making is done ?</h5>
                    <h6>Once two blobs are waiting for a fight for a given bet, anyone can pick them and engage the fight, the transaction does not require to be signed.</h6>
                    <h6> - Using the match making screen you can pick two blobs waiting for a fight for the same bet and try to proceed the match making.</h6>
                    <h6> - A match maker bot is running and process the engage the fights if blobs are found in the right state.</h6>
                    <h6>There is no garantee the match making you run will be processed, as anyone can try a different match making concurrently, the miners will choose the transaction confirmed.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Why the winner changed ?</h5>
                    <h6>Until the fight result transaction is not confirmed the winner may change.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <div className='d-flex flex-row align-items-center justify-content-center'>
                        <h5>What the </h5><div className='h-25'><WinPercent win_rate={0.532} /></div><h5> displayed in the fight ?</h5>
                    </div>
                    <h6>This is an estimation of the winning chance of each blob, by simulating 1000000 in a row.</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How are computed the Attack power and the defense power of my blob ?</h5>
                    <h6>Attack power = 6 * Attack Level + 3 * Defense level + 2 * Number of game + 4 * Number of victories</h6>
                    <h6>Defense power = 5 * Defense level + 5 * Number of game</h6>
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is the rating of my blob ? <Rating initialValue={4} readonly={true} size={20} /></h5>
                    <h6>The rating is computed from you average power: (Attack power + Defense power) / 2</h6>
                    <h6>Depending on the result you will get a rating from 0 to 5 stars the thresholds are:</h6>
                    <h6>From 0 to {RATING_RANGES[0]} : 0 stars</h6>
                    {
                        RATING_RANGES.map((value, index) =>
                            <h6>From {value} to {RATING_RANGES[index + 1]} : {index + 1} stars</h6>
                        )
                    }
                </div>

                <div className='w-75 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Is the game fair ?</h5>
                    <h6>By playing games and feeding your blob with oatmeal you are able to increase its statistics and its power.</h6>
                    <h6>This gives a better winning chance to the strong blobs.</h6>
                    <h6>However, the difference in power of two blobs is caped around 60%/40% winning ratio to avoid abuses.</h6>
                </div>

            </div>

        )
    }
}