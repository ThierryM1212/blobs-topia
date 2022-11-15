import React from 'react';
import { Rating } from 'react-simple-star-rating';
import { WinPercent } from '../components/WinPercent';
import { BLOBINATOR_DEFI_MODULO_WIN, BLOBINATOR_FEE, BLOBINATOR_MIN_VALUE, BLOB_EXCHANGE_FEE, BLOB_MINT_FEE, BLOB_PRICE, MIN_NANOERG_BOX_VALUE, NUM_OATMEAL_TOKEN_LOSER, NUM_OATMEAL_TOKEN_WINNER, RATING_RANGES, TX_FEE } from '../utils/constants';
import { formatERGAmount } from '../utils/utils';
import oatmealLogo from "../images/oatmeal.png";
import spicyOatmealLogo from "../images/spicy_oatmeal.png";
import BlobinatorImage from "../images/blobinator_sans_fond.png";

export default class AboutPage extends React.Component {

    render() {

        return (
            <div className='w-75 d-flex flex-column align-items-start m-2 p-2'>
                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is Blob's Topia ?</h5>
                    <p>Blob's Topia is a game on Ergo blockchain in which you can own blob fighters smart contracts.</p>
                    <p>Those blob fighters are owning an amount of ERG and can bet an amount for a fight.</p>
                    <p>PVP</p>
                    <p> - Once two blobs wait for the same bet, they can engage a fight.</p>
                    <p> - The winner get all the bets, minus the miner fees and the Blobinator fee.</p>
                    <p> - Both winner and loser get some Oatmeal <img src={oatmealLogo} alt="Oatmeal" width={24} /> tokens to be able to feed their blob.</p>
                    <p> - By feeding a blob you can increase their Attack or Defense level to make them stronger and increase your winning ratio.</p>
                    <p> - Both winner and loser get some Spicy Oatmeal <img src={spicyOatmealLogo} alt="Spicy Oatmeal" width={24} /> tokens to try to attract a Blobinator.</p>
                    <p>PVE</p>
                    <p> - A Blobinator is a kind of super blob fighter that can be invoked once enough fights occured.</p>
                    <p> - Any blobs can fight against a Blobinator if the player has earn enough Spicy Oatmeal <img src={spicyOatmealLogo} alt="Spicy Oatmeal" width={24} /> to attract the Blobinator.</p>
                    <p> - The Blobinator fight is "free" for the player that just needs to pay 2 transactions fees to try to get the amount in the Blobinator.</p>
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
                    <h5>What can I do with my blob ?</h5>
                    <p> - ready to fight (and cancel)</p>
                    <p><small>Set the Blob ready to fight for an amount of ERG (min 0.1).</small></p>
                    <p> - fight another blob</p>
                    <p><small>Engage the fight with a Blob waiting for the same amount.</small></p>
                    <p> - bait the Blobinator (and cancel)</p>
                    <p><small>Wait for a Blobinator and try to fight it.</small></p>
                    <p> - fight a Blobinator (if invoked)</p>
                    <p><small>Fight the Blobinator.</small></p>
                    <p> - engage sale (and cancel)</p>
                    <p><small>Set the Blob on sale for an amount of ERG (min 0.1).</small></p>
                    <p> - sell (change owner)</p>
                    <p><small>Sell the Blob to another player (address).</small></p>
                    <p> - deposit/widthdraw ergs</p>
                    <p><small>Add or remove ERGs from the Blob, minimum 0.1 ERG.</small></p>
                    <p> - feed the blob</p>
                    <p><small>Increase the attack and defense level of the Blob by feeding him with Oatmeal tokens earned as fight reward.</small></p>
                    <p> - choose a weapon</p>
                    <p><small>Choose a type of weapon for a Blob (Sword, Axe or Mace).</small></p>
                    <p> - upgrade the weapon</p>
                    <p><small>Upgrade the weapon of the Blob to the next level.</small></p>
                    <p> - change weapon</p>
                    <p><small>Change the kind of weapon for the Blob (restart at level 0).</small></p>
                    <p> - upgrade the armor</p>
                    <p><small>Upgrade the armor of the Blob to the next level.</small></p>
                    <p> - kill the blob</p>
                    <p><small>Destroy the Blob and returns the ERG content to the owner.</small></p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is required to play ?</h5>
                    <p>To own a blob you need a compatible ergo wallet: </p>
                    <p>  Recommended setting: <strong>Nautilus or SAFEW on desktop Chrome browser</strong></p>
                    <p>This will allow you to run chained transactions to make the interaction with your blob faster.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How to play on desktop ?</h5>
                    <p>You need to setup your address in the dApp and uses Nautilus or SAFEW wallet in your browser.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How to play on mobile ?</h5>
                    <p>You need to setup your address in the dApp and uses Ergo mobile wallet for signing transaction.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>How the winner is found ?</h5>
                    <p>Depending the header id of the fight result transaction a winner is chosen by the smart contract.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is the winning reward ?</h5>
                    <p>A fight is for a bet amount, engaged by each blob.</p>
                    <p>The winner get 2 * bet amount - 2 * transaction fee ({formatERGAmount(TX_FEE)}) - blobinator fee ({(BLOBINATOR_FEE / 10).toFixed(2)} %).</p>
                    <p>The winner get {NUM_OATMEAL_TOKEN_WINNER} Oatmeal <img src={oatmealLogo} alt="Oatmeal" width={24} />, the loser {NUM_OATMEAL_TOKEN_LOSER} Oatmeal <img src={oatmealLogo} alt="Oatmeal" width={24} />, used to feed the blob and increase its attack level and defense level.</p>
                    <p>Both winner and loser get 1 Spicy Oatmeal <img src={spicyOatmealLogo} alt="Spicy Oatmeal" width={24} /> to attract a Blobinator once available.</p>
                    <p>The amount of distributed Oatmeal <img src={oatmealLogo} alt="Oatmeal" width={24} /> tokens is configurable and may change.</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What is the Blobinator ? <img src={BlobinatorImage} alt="Spicy Oatmeal" width={100} /></h5>
                    <p>The Blobinator is a super blob that is created once enough ERG have been played between blobs.</p>
                    <p>To fight a Blobinator it needs to be bait with Spicy Oatmeal <img src={spicyOatmealLogo} alt="Spicy Oatmeal" width={24} />.</p>
                    <p>The blobs have a fixed winning ratio against the Blobinator but the cost of the fight is low and without risk.</p>
                    <p></p>
                    <p>For each fight, {(BLOBINATOR_FEE / 10).toFixed(2)} % of the fight amount goes to a blobinator fee.</p>
                    <p>The Blobinators are invoked automatically when enough blobinator fees are generated by the fights ({formatERGAmount(BLOBINATOR_MIN_VALUE)} ERG).</p>
                    <p>For each fight, each player get a Spicy Oatmeal <img src={spicyOatmealLogo} alt="Spicy Oatmeal" width={24} /> token, they are used to bait the Blobinator once it is available.</p>
                    <p>Two Spicy Oatmeal <img src={spicyOatmealLogo} alt="Spicy Oatmeal" width={24} /> are required to try to fight the Blobinator and get its content.</p>
                    <p>The cost for the player is 2 * {formatERGAmount(TX_FEE)} ERG, for a winning ratio of (1/{BLOBINATOR_DEFI_MODULO_WIN}).</p>
                </div>

                <div className='w-100 zoneabout d-flex flex-column align-items-start m-2 p-2'>
                    <h5>What are the fees ?</h5>
                    <p> - There is a fixed blob minting price, including a blob minting fee. (Blob price - blob mint fee - transaction fee) are credited to the blob after minting.</p>
                    <p>Current blob price: <strong>{formatERGAmount(BLOB_PRICE)} ERG</strong></p>
                    <p>Current blob mint fee: <strong>{formatERGAmount(BLOB_MINT_FEE)} ERG</strong></p>
                    <p> - The deposit, widthdraw and sell operations have a fee configured.</p>
                    <p>Current deposit, widthdraw or kill fee: <strong>max({BLOB_EXCHANGE_FEE / 10} %, {formatERGAmount(MIN_NANOERG_BOX_VALUE)}) ERG</strong></p>
                    <p>Current sell fee: <strong>max({2 * BLOB_EXCHANGE_FEE / 10} %, {formatERGAmount(MIN_NANOERG_BOX_VALUE)}) ERG</strong></p>
                    <p> - There is no dApp fee on the fights, the miner transaction fees are taken from the fight bets, the Blobinator fee is given to the player winning the blobinator fight.</p>
                    <p> - Those fees are configurable and may be adjusted by the game owner.</p>
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
                    <p>Attack power = 6 * Attack Level + 3 * Defense level + 2 * Number of game + 4 * Number of victories + Armor attack power + Weapon attack power</p>
                    <p>Defense power = 5 * Defense level + 5 * Number of game + Armor defense power + Weapon defense power</p>
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
                    <p>By playing games and feeding your blob with Oatmeal <img src={oatmealLogo} alt="Oatmeal" width={24} /> you are able to increase its statistics and power.</p>
                    <p>This gives a better winning chance to the strong blobs.</p>
                    <p>However, the difference in power of two blobs is caped around 60%/40% winning ratio to avoid abuses.</p>
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

            </div>

        )
    }
}