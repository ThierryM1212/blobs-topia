import Swal from 'sweetalert2/src/sweetalert2.js';
import withReactContent from 'sweetalert2-react-content';
import BlobWaitAnim from '../components/BlobWaitAnim';
import { encodeContract } from '../ergo-related/serializer';


export function waitingAlert(title) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
        title: <p>{title}</p>,
        html: <BlobWaitAnim />,
        allowOutsideClick: false,
        showConfirmButton: false,
    });
    return MySwal;
}

export function closeAlert(alert) {
    alert.close();
}

export function errorAlert(title, msg) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
        title: <p>{title}</p>,
        icon: 'error',
        text: msg,
        allowOutsideClick: false,
    });
    return MySwal;
}

export function displayTransaction(txId) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
        title: <p>Transaction sent succesfully</p>,
        allowOutsideClick: true,
        icon: 'success',
        showCloseButton: true,
        html: `<p>The transaction will be visible in few seconds: <a href="https://explorer.ergoplatform.com/en/transactions/${txId}" target="_blank" > ${txId} </a></p>`,
    });
    return MySwal;
}

export function displayErgoPayTransaction(txId, reducedTx) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
        title: <p>Sign the transaction using ergo mobile wallet</p>,
        allowOutsideClick: true,
        icon: 'success',
        showConfirmButton: true,
        html: `<p>Send the transaction to wallet: <a href="ergopay:${reducedTx}" target="_blank" > Sign ${txId} with ErgoPay </a></p>`,
    },
    function(){ 
        window.location.reload();
    });
    return MySwal;
}

export function copySuccess() {
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Copy OK',
        showConfirmButton: false,
        timer: 1000
    })
}

export function promptErgAmount(mode) {
    return new Promise(function (resolve, reject) {
        Swal.fire({
            title: "ERG amount to " + mode,
            html: `<div><input type="text" id="ergAmount" class="swal2-input" placeholder="ERG amount"></div>`,
            confirmButtonText: mode,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const ergAmount = Swal.getPopup().querySelector('#ergAmount').value;
                if (!parseFloat(ergAmount) || parseFloat(ergAmount) < 0.1) {
                    Swal.showValidationMessage(`The ERG amount is invalid (needs to be >= 0.1 ERG)`);
                }
                return { ergAmount: parseFloat(ergAmount) };
            }
        }).then((result) => {
            if (result.value) {
                resolve(result.value.ergAmount);
            } else {
                reject();
            }
        });
    });
}

export function promptFeedAmount() {
    return new Promise(function (resolve, reject) {
        Swal.fire({
            title: "Feed",
            html: `<div><input type="text" id="defAmount" class="swal2-input" placeholder="Defense point"></div>
            <div><input type="text" id="attAmount" class="swal2-input" placeholder="Attack point"></div>`,
            confirmButtonText: "Feed",
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const defAmount = parseInt(Swal.getPopup().querySelector('#defAmount').value) || 0;
                const attAmount = parseInt(Swal.getPopup().querySelector('#attAmount').value) || 0;
                if (defAmount === 0 && attAmount === 0) {
                    Swal.showValidationMessage(`Invalid amount of Oatmeal tokens`);
                }
                //console.log("promptFeedAmount", defAmount, attAmount)
                return {
                    defAmount: defAmount,
                    attAmount: attAmount,
                };
            }
        }).then((result) => {
            if (result.value) {
                resolve([result.value.defAmount, result.value.attAmount]);
            } else {
                reject();
            }
        });
    });
}


export function promptErgAddr() {
    return new Promise(function (resolve, reject) {
        Swal.fire({
            title: "Set ERG address",
            html: `<div><input type="text" id="ergAddress" class="swal2-input" placeholder="ERG address"></div>`,
            focusConfirm: false,
            showCancelButton: true,
            showConfirmButton: true,
            preConfirm: async () => {
                const ergAddress = Swal.getPopup().querySelector('#ergAddress').value;
                try {
                    await encodeContract(ergAddress)
                } catch (e) {
                    Swal.showValidationMessage(`The ERG address is invalid`);
                }
                return { ergAddress: ergAddress };
            }
        }).then((result) => {
            if (result.value) {
                resolve(result.value.ergAddress);
            } else {
                reject();
            }
        });
    });
}
