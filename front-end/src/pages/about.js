import React from 'react';
import { Rating } from 'react-simple-star-rating';
import { WinPercent } from '../components/WinPercent';
import { BLOB_EXCHANGE_FEE, BLOB_MINT_FEE, BLOB_PRICE, MIN_NANOERG_BOX_VALUE, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, RATING_RANGES, TX_FEE } from '../utils/constants';
import { formatERGAmount } from '../utils/utils';

export default class AboutPage extends React.Component {

    render() {

        return (
            <div className='w-75 d-flex flex-column align-items-start m-2 p-2'>
                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is Blob's Topia ?</h5>
                    <p>Blob's Topia is a game on Ergo blockchain in which you can own blob fighters smart contracts.</p>
                    <p>Those blob fighters are owning an amount of ERG and can bet an amount for a fight.</p>
                    <p>Once two blobs wait for the same bet, they can engage a fight.</p>
                    <p>The winner get all the bets, minus the miner fees.</p>
                    <p>Both winner and loser get some Oatmeal tokens to be able to feed their blob.</p>
                    <p>By feeding a blob you can increase their Attack or Defense level to make them stronger and increase your winning ratio.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Do I really own my blob ?</h5>
                    <p>Yes, most of the actions for a blob are only doable by the address set in that blob.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>If I loose access to my address, my blob(s) will be stuck forever ?</h5>
                    <p>Yes, except if there is a bug I'm not aware of.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is a blob, in reality ?</h5>
                    <p>It is a unicellular body, named Physarum polycephalum that lives in the forest, it's size can range from micron to hectare.</p>
                    <p>It is not an animal but it can learn and share its learning.</p>
                    <p>It is can heals it-self.</p>
                    <p>It is can build optimized networks.</p>
                    <p>It has 720 different gender, so two blobs have 719/720 chances to be compatible.</p>
                    <p>More at:</p>
                    <a className='aboutlink' href="https://en.wikipedia.org/wiki/Physarum_polycephalum" target="_blank" rel="noreferrer">
                        https://en.wikipedia.org/wiki/Physarum_polycephalum
                    </a>
                    <a className='aboutlink' href="https://www.reuters.com/article/us-france-zoo-blob/paris-zoo-unveils-the-blob-an-organism-with-no-brain-but-720-sexes-idUSKBN1WV2AD" target="_blank" rel="noreferrer">
                        https://www.reuters.com/article/us-france-zoo-blob/paris-zoo-unveils-the-blob-an-organism-with-no-brain-but-720-sexes-idUSKBN1WV2AD
                    </a>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What can I do with my blob ?</h5>
                    <p> - deposit/widthdraw ergs</p>
                    <p> - feed the blob</p>
                    <p> - engage fight (and cancel)</p>
                    <p> - engage sale (and cancel)</p>
                    <p> - fight</p>
                    <p> - sold (change owner)</p>
                    <p> - kill the blob</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is required to play ?</h5>
                    <p>Nothing, even without ERG address nor wallet you can play the "bot", and process manually the blob requests, the match making or the fight results.</p>
                    <p>To own a blob you need a compatible ergo wallet: </p>
                    <p>  Recommended setting: <strong>Nautilus on desktop Chrome browser</strong></p>
                    <p>This will allow you to run chained transactions to make the interaction with your blob faster.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How to play on desktop ?</h5>
                    <p>You need to setup your address in the dApp and uses Nautilus (recommended) or SAFEW wallet in your browser.</p>
                    <p>With current SAFEW (v0.6.6) version you won't be able to run chained transactions.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How to play on mobile ?</h5>
                    <p>You need to setup your address in the dApp and uses Ergo mobile wallet for signing transaction.</p>
                    <p>With current Ergo wallet (1.10.2213) version you won't be able to run chained transactions and will need to wait for the transactions to be mined for the next action..</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How the winner is found ?</h5>
                    <p>Depending the header id of the fight result transaction a winner is chosen by the smart contract.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is the winning reward ?</h5>
                    <p>A fight is for a bet amount, engaged by each blob.</p>
                    <p>The winner get 2 * bet amount - 2 * transaction fee.</p>
                    <p>The winner get {NUM_OATMEAL_TOKEN_WINNER} oatmeal, the loser {NUM_OATMEAL_TOKEN_LOSER} oatmeal, used to feed the blob and increase its attack level and defense level.</p>
                    <p>The amount of distributed oatmeal tokens is configurable and may change.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What are the fees ?</h5>
                    <p> - There is a fixed blob minting price, including a blob minting fee. (Blob price - blob mint fee - transaction fee) are credited to the blob after minting.</p>
                    <p>Current blob price: <strong>{formatERGAmount(BLOB_PRICE)} ERG</strong></p>
                    <p>Current blob mint fee: <strong>{formatERGAmount(BLOB_MINT_FEE)} ERG</strong></p>
                    <p> - The deposit, widthdraw and sell operations have a fee configured.</p>
                    <p>Current dApp fee: <strong>max({BLOB_EXCHANGE_FEE / 10} %, {formatERGAmount(MIN_NANOERG_BOX_VALUE)}) ERG</strong></p>
                    <p> - There is no dApp fee on the fights, the miner transaction fees are taken from the figth bets.</p>
                    <p> - Those fees are configurable and may be adjusted by the game owner.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Why the miner fee is so high ({formatERGAmount(TX_FEE)} ERG) ?</h5>
                    <p>Because we love the miners that allows ERG and that game to exist.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How the match making is done ?</h5>
                    <p>Once two blobs are waiting for a fight for a given bet, anyone can pick them and engage the fight, the transaction does not require to be signed.</p>
                    <p> - Using the match making screen you can pick two blobs waiting for a fight for the same bet and try to proceed the match making.</p>
                    <p> - A match maker bot is running and process the engage the fights if blobs are found in the right state.</p>
                    <p>There is no garantee the match making you run will be processed, as anyone can try a different match making concurrently, the miners will choose the transaction confirmed.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Why the winner changed ?</h5>
                    <p>Until the fight result transaction is not confirmed the winner may change.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <div className='d-flex flex-row align-items-center justify-content-center'>
                        <h5>What the </h5><div className='h-25'><WinPercent win_rate={0.532} /></div><h5> displayed in the fight ?</h5>
                    </div>
                    <p>This is an estimation of the winning chance of each blob, by simulating 1000000 fights in a row.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How are computed the Attack power and the defense power of my blob ?</h5>
                    <p>Attack power = 6 * Attack Level + 3 * Defense level + 2 * Number of game + 4 * Number of victories</p>
                    <p>Defense power = 5 * Defense level + 5 * Number of game</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is the rating of my blob ? <Rating initialValue={4} readonly={true} size={20} /></h5>
                    <p>The rating is computed from the average power: (Attack power + Defense power) / 2</p>
                    <p>Depending on the result you will get a rating from 0 to 5 stars the thresholds are:</p>
                    <p>From 0 to {RATING_RANGES[0]} : 0 stars</p>
                    {
                        RATING_RANGES.map((value, index) =>
                            <p>From {value} to {RATING_RANGES[index + 1]} : {index + 1} stars</p>
                        )
                    }
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>Is the game fair ?</h5>
                    <p>By playing games and feeding your blob with oatmeal you are able to increase its statistics and power.</p>
                    <p>This gives a better winning chance to the strong blobs.</p>
                    <p>However, the difference in power of two blobs is caped around 60%/40% winning ratio to avoid abuses.</p>
                </div>

            </div>

        )
    }
}