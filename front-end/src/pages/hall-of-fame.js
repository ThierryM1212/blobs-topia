import React from 'react';
import BlobItem from '../components/BlobItem';
import { filterBlobList, getBlobPowers, getBlobVictories } from '../utils/utils';
import { BLOB_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getUnspentBoxesForAddressUpdated } from '../ergo-related/explorer';
import { waitingAlert } from '../utils/Alerts';



export default class HallOfFamePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobListByVictories: [],
            blobListByAttPower: [],
            blobListByDefPower: [],
        };
        this.fetchBlobs = this.fetchBlobs.bind(this);
    }

    async componentDidMount() {
        var alert = waitingAlert("Loading the blob list...");
        await this.fetchBlobs();
        alert.close();
    }

    async fetchBlobs() {
        const blobBoxes = await getUnspentBoxesForAddressUpdated(BLOB_SCRIPT_ADDRESS);
        const filteredBlobBoxes = filterBlobList(blobBoxes);
        //console.log("fetchBlobs blobBoxes", blobBoxes)
        const blobListByVictories = filteredBlobBoxes.sort(function (a, b) {
            return getBlobVictories(b.additionalRegisters.R5.renderedValue) - getBlobVictories(a.additionalRegisters.R5.renderedValue);
        }).slice(0, 10);
        const blobListByAttPower = filteredBlobBoxes.sort(function (a, b) {
            return getBlobPowers(b.additionalRegisters.R5.renderedValue)[0] - getBlobPowers(a.additionalRegisters.R5.renderedValue)[0]
        }).slice(0, 10);
        const blobListByDefPower = filteredBlobBoxes.sort(function (a, b) {
            return getBlobPowers(b.additionalRegisters.R5.renderedValue)[1] - getBlobPowers(a.additionalRegisters.R5.renderedValue)[1]
        }).slice(0, 10);

        //console.log("blobList sorted trimmed", blobListByVictories);
        this.setState({
            blobListByVictories: blobListByVictories,
            blobListByAttPower: blobListByAttPower,
            blobListByDefPower: blobListByDefPower,
        })
    }

    render() {

        return (
            <div className="w-75 d-flex flex-column align-items-center m-2 p-2">
                <h2>
                    Hall of fame
                </h2>
                <br />
                <h4>
                    Top blobs by number of victories
                </h4>
                <div className="d-flex flex-wrap">
                    {this.state.blobListByVictories.map((item, index) => (
                        <div className='d-flex flex-column align-items-center' key={item.boxId}>
                            <h2>#{index + 1}</h2>
                            <BlobItem
                                blobBoxJSON={item}
                                updateList={this.fetchBlobs}
                                disableActions={true}
                                showStatus={false}
                                showOwner={true}
                            />
                        </div>
                    ))}
                </div>
                <br />
                <h4>
                    Top blobs by Attack power
                </h4>
                <div className="d-flex flex-wrap">
                    {this.state.blobListByAttPower.map((item, index) => (
                        <div className='d-flex flex-column align-items-center' key={item.boxId}>
                        <h2>#{index + 1}</h2>
                        <BlobItem
                            blobBoxJSON={item}
                            updateList={this.fetchBlobs}
                            disableActions={true}
                            showStatus={false}
                            showOwner={true}
                        />
                        </div>
                    ))}
                </div>
                <br />
                <h4>
                    Top blobs by Def power
                </h4>
                <div className="d-flex flex-wrap">
                    {this.state.blobListByDefPower.map((item, index) => (
                        <div className='d-flex flex-column align-items-center' key={item.boxId}>
                        <h2>#{index + 1}</h2>
                        <BlobItem
                            blobBoxJSON={item}
                            updateList={this.fetchBlobs}
                            disableActions={true}
                            showStatus={false}
                            showOwner={true}
                        />
                        </div>
                    ))}
                </div>
                <br />
            </div>
        )
    }
}