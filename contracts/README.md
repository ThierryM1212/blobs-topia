# Contracts for Blob's Topia

## Compile contracts
### Install
Copy ErgoScriptCompiler-assembly-0.1.jar in this directory

### Usage
python compile.py <script_file> <symbol_file>

Output:
$ python compile.py Oatmeal_Buy_Request.es symbols.json

export const OATMEAL_BUY_REQUEST_SCRIPT="10100400040a04000e2009ef6c93c6fe2534d6b840c8524a173fea2b7cb1bb0c1c1f0f739dc310e6d10b0406040204020580897a08cd0358ca7a890f5c237eca72e0d7f8290e808b089690504a0c47805cf489767ea53e0404040404000e2025ea05523dc54837ea5e255a82359da4f1969bda95cabaed5b064f14752d1901040404000100d804d601e4c6a70408d602b2db6501fe730000d603e4c672020611d604b27203730100eb027201d1ed938cb2db630872027302000173039591b1a57304d802d605b2a5730500d6069d9999c1a7b2720373060073077204edededed93c27205d0730892c172059c7206720493c2b2a5730900d07201938cb2db6308b2a5730a00730b0001730c938cb2db6308b2a5730d00730e00027206730f";
export const OATMEAL_BUY_REQUEST_SCRIPT_HASH="72053900782468957e8e2222f888ba638279c8ae2d9866b10d69bfca563b9a56";
export const OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS="4cirad89aeuZ9YcH9ad945FBXxb7HpM6WW3HqmW5kigLhiuj6C6N5qohcqVC2fmRK9QwXtD99eaLaFgqNzdctiuno2DcwYmywAxTCU5LevY66eJgUa4GXVhwJuo4MgvfMi4Vk2mYwVSBxMPKeYyc8twm9Q9QZBGifesrGQNZjXCQYtJUYqFzooDDRLEYQXHggEdZ9K6vGfKXS3xsi2sQfZatuy2xg7WF2a6FN3MEmLatRhNcfBEqUjW82WccBVZLL9QiqsFavPLN9oq4hb5WSNUFRAqCKyLm1UDpU7tQbAUFR5GeWoHpTizkbZHvnovjWfgGJ4awxTJ3kvFb78najwe7SnihEnsmvh76yqZrqByvHDg1DizjFzXji5t4rJxETpSJBvgfYXtdN";

### Generates the script constants file
$ python compile.py all symbols.json > script_constants.js
