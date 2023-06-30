import {Platform} from 'react-native';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import {randomBytes} from 'crypto';
import crc from 'crc';

var CryptoJS = require('../utils/Cmac');
var AES = require('crypto-js/aes');

function hexToBytes(hex) {
  let bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
  let hex = [];
  for (let i = 0; i < bytes.length; i++) {
    let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join('');
}

function leftRotate(bytesArr, rotatebit = 1) {
  let first = bytesArr.shift();
  bytesArr.push(first);
  return bytesArr;
}

//Encrypted IV
function ivEncryption(ti, cmdCtr, sesAuthEncKey) {
  const ivData = AES.encrypt(
    CryptoJS.enc.Hex.parse('A55A' + ti + cmdCtr + '0000000000000000'),
    CryptoJS.enc.Hex.parse(sesAuthEncKey),
    {
      mode: CryptoJS.mode.ECB,
      // iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"),
      keySize: 128 / 8,
      padding: CryptoJS.pad.NoPadding,
    },
  );
  return ivData.ciphertext.toString(CryptoJS.enc.Hex);
}

function ivEncryptionResponse(ti, cmdCtr, sesAuthEncKey) {
  const ivData = AES.encrypt(
    CryptoJS.enc.Hex.parse('5AA5' + ti + cmdCtr + '0000000000000000'),
    CryptoJS.enc.Hex.parse(sesAuthEncKey),
    {
      mode: CryptoJS.mode.ECB,
      // iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"),
      keySize: 128 / 8,
      padding: CryptoJS.pad.NoPadding,
    },
  );
  return ivData.ciphertext.toString(CryptoJS.enc.Hex);
}

function padForEnc(data, byteLen) {
  console.log('padforenc', data, data.length, byteLen);
  var paddedData = data;
  if (data.length < byteLen * 2) {
    console.log('padforEnc22', byteLen * 2);
    paddedData += '80';
    paddedData = paddedData.padEnd(byteLen * 2, '00');
  }
  return paddedData;
}

function decToHexLsbFirst(dec, bytes) {
  //lsb first
  return dec
    .toString(16)
    .padStart(2, '0')
    .padEnd(bytes * 2, '0');
}

var Ntag424 = NfcManager;

Ntag424.sendAPDUCommand = async function (commandBytes) {
  const response =
    Platform.OS == 'ios'
      ? await NfcManager.sendCommandAPDUIOS(commandBytes)
      : await NfcManager.transceive(commandBytes);
  var newResponse = response;
  if (Platform.OS == 'android') {
    newResponse = {};
    newResponse.response = response.slice(0, -2);
    newResponse.sw1 = response.slice(-2, -1);
    newResponse.sw2 = response.slice(-1);
  }
  return newResponse;
};

Ntag424.AuthEv2First = async function (keyNo, pKey) {
  //iso select file before auth
  const isoSelectFileBytes = hexToBytes('00A4040007D276000085010100');
  const isoSelectRes = await Ntag424.sendAPDUCommand(isoSelectFileBytes);
  console.warn(
    'isoSelectRes: ',
    bytesToHex([isoSelectRes.sw1, isoSelectRes.sw2]),
  );

  const bytes = hexToBytes('9071000005' + keyNo + '0300000000');
  const Result = await Ntag424.sendAPDUCommand(bytes);
  console.warn('Result: ', bytesToHex([Result.sw1, Result.sw2]));
  const resultData = bytesToHex(Result.response);
  console.log('resultData', resultData);
  console.log('resultData', hexToBytes(resultData));
  //91AF is the successful code
  const resultCode = bytesToHex([Result.sw1, Result.sw2]);
  if (resultCode == '91af') {
    const key = CryptoJS.enc.Hex.parse(pKey);
    const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
    const aesEncryptOption = {
      padding: CryptoJS.pad.NoPadding,
      mode: CryptoJS.mode.CBC,
      iv: iv,
      keySize: 128 / 8,
    };
    const RndBDec = AES.decrypt(
      {ciphertext: CryptoJS.enc.Hex.parse(resultData)},
      key,
      aesEncryptOption,
    );
    const RndB = CryptoJS.enc.Hex.stringify(RndBDec);
    console.log('key', key, 'iv', iv);
    console.log('rndb', RndB);
    const RndABytes = randomBytes(16);
    const RndA = bytesToHex(RndABytes);
    console.log('rnda', bytesToHex(RndABytes));
    const RndBRotlBytes = leftRotate(hexToBytes(RndB));
    const RndBRotl = bytesToHex(RndBRotlBytes);
    console.log('RndBRotl', RndBRotlBytes, RndBRotl);

    const RndARndBRotl = RndA + RndBRotl;
    console.log('RndARndBRotl', RndARndBRotl);
    const RndARndBEncData = AES.encrypt(
      CryptoJS.enc.Hex.parse(RndARndBRotl),
      key,
      aesEncryptOption,
    );
    const RndARndBEnc = RndARndBEncData.ciphertext.toString(CryptoJS.enc.Hex);
    console.log('RndARndBEnc', RndARndBEnc);
    console.log('RndARndBEnc', hexToBytes(RndARndBEnc));

    const secondAuthBytes = hexToBytes('90AF000020' + RndARndBEnc + '00');
    console.log('90AF000020' + RndARndBEnc + '00');
    console.log('secondAuthBytes', secondAuthBytes);
    const secondAuthRes = await Ntag424.sendAPDUCommand(secondAuthBytes);
    console.warn(
      'Result: ',
      bytesToHex([secondAuthRes.sw1, secondAuthRes.sw2]),
    );
    //9100 is the successful code
    const secondAuthResultCode = bytesToHex([
      secondAuthRes.sw1,
      secondAuthRes.sw2,
    ]);
    if (secondAuthResultCode == '9100') {
      //auth successful
      const secondAuthResultData = bytesToHex(secondAuthRes.response);
      const secondAuthResultDataDec = AES.decrypt(
        {ciphertext: CryptoJS.enc.Hex.parse(secondAuthResultData)},
        key,
        aesEncryptOption,
      );
      const secondAuthResultDataDecStr = CryptoJS.enc.Hex.stringify(
        secondAuthResultDataDec,
      );
      console.log('secondAuthResultDataDec', secondAuthResultDataDecStr);

      const tiBytes = hexToBytes(secondAuthResultDataDecStr).slice(0, 4);
      const ti = bytesToHex(tiBytes);
      console.log('ti', ti);

      var WordArray = CryptoJS.lib.WordArray;
      const xor = CryptoJS.ext.xor(
        new WordArray.init(hexToBytes(RndA.slice(4, 16))),
        new WordArray.init(hexToBytes(RndB.slice(0, 12))),
      );
      let svPost = RndA.slice(0, 4);
      svPost += bytesToHex(xor.words);
      svPost += RndB.slice(12, 32) + RndA.slice(16, 32);
      //SV1 = A5h||5Ah||00h||01h||00h||80h||RndA[15..14]|| ( RndA[13..8] # RndB[15..10])||RndB[9..0]||RndA[7..0]
      let sv1 = 'A55A00010080';
      sv1 += svPost;
      const sesAuthEnc = CryptoJS.CMAC(key, CryptoJS.enc.Hex.parse(sv1));
      const sesAuthEncKey = sesAuthEnc.toString();

      //SV2 = 5Ah||A5h||00h||01h||00h||80h||RndA[15..14]|| ( RndA[13..8] # RndB[15..10])||RndB[9..0]||RndA[7..0]
      //# == XOR-operator

      console.log(RndA.slice(0, 4), RndA.slice(4, 16));
      let sv2 = '5AA500010080';
      sv2 += svPost;
      console.log('sv2', sv2);
      const sesAuthMac = CryptoJS.CMAC(key, CryptoJS.enc.Hex.parse(sv2));
      const sesAuthMacKey = sesAuthMac.toString();
      console.log('sesAuthMacKey', sesAuthMacKey);

      return Promise.resolve({sesAuthEncKey, sesAuthMacKey, ti});
    } else {
      //auth failed
      return Promise.reject('Auth Failed: ' + secondAuthResultCode);
    }
  } else {
    //auth failed
    return Promise.reject('Auth Failed: ' + resultCode);
  }
};

Ntag424.AuthEv2NonFirst = async (keyNo, pKey) => {
  const bytes = hexToBytes('9077000001' + keyNo + '00');
  const Result = await Ntag424.sendAPDUCommand(bytes);
  console.warn(
    'auth ev2 non first part 1 Result: ',
    bytesToHex([Result.sw1, Result.sw2]),
  );
  const resultData = bytesToHex(Result.response);
  console.log('resultData', resultData);
  console.log('resultData', hexToBytes(resultData));
  //91AF is the successful code
  const resultCode = bytesToHex([Result.sw1, Result.sw2]);
  if (resultCode == '91af') {
    const key = CryptoJS.enc.Hex.parse(pKey);
    const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
    const aesEncryptOption = {
      padding: CryptoJS.pad.NoPadding,
      mode: CryptoJS.mode.CBC,
      iv: iv,
      keySize: 128 / 8,
    };
    const RndBDec = AES.decrypt(
      {ciphertext: CryptoJS.enc.Hex.parse(resultData)},
      key,
      aesEncryptOption,
    );
    const RndB = CryptoJS.enc.Hex.stringify(RndBDec);
    console.log('key', key, 'iv', iv);
    console.log('rndb', RndB);
    const RndABytes = randomBytes(16);
    const RndA = bytesToHex(RndABytes);
    console.log('rnda', bytesToHex(RndABytes));
    const RndBRotlBytes = leftRotate(hexToBytes(RndB));
    const RndBRotl = bytesToHex(RndBRotlBytes);
    console.log('RndBRotl', RndBRotlBytes, RndBRotl);

    const RndARndBRotl = RndA + RndBRotl;
    console.log('RndARndBRotl', RndARndBRotl);
    const RndARndBEncData = AES.encrypt(
      CryptoJS.enc.Hex.parse(RndARndBRotl),
      key,
      aesEncryptOption,
    );
    const RndARndBEnc = RndARndBEncData.ciphertext.toString(CryptoJS.enc.Hex);
    console.log('RndARndBEnc', RndARndBEnc);
    console.log('RndARndBEnc', hexToBytes(RndARndBEnc));

    const secondAuthBytes = hexToBytes('90AF000020' + RndARndBEnc + '00');
    console.log('90AF000020' + RndARndBEnc + '00');
    console.log('secondAuthBytes', secondAuthBytes);
    const secondAuthRes = await Ntag424.sendAPDUCommand(secondAuthBytes);
    console.warn(
      'auth ev2 non first part 2 Result: ',
      bytesToHex([secondAuthRes.sw1, secondAuthRes.sw2]),
    );
    //9100 is the successful code
    const secondAuthResultCode = bytesToHex([
      secondAuthRes.sw1,
      secondAuthRes.sw2,
    ]);
    if (secondAuthResultCode == '9100') {
      //auth successful
      return Promise.resolve('Successful');
    } else {
      //auth failed
      return Promise.reject('Auth Failed: ' + secondAuthResultCode);
    }
  } else {
    //auth failed
    return Promise.reject('Auth Failed: ' + resultCode);
  }
};

Ntag424.changeFileSettings = async (
  sesAuthEncKey,
  sesAuthMacKey,
  ti,
  cmdCtrDec,
  piccOffset,
  macOffset,
) => {
  //File Option SDM and mirroring enabled, CommMode: plain
  var cmdData = '40';
  //Access rights (FileAR.ReadWrite: 0x0, FileAR.Change: 0x0, FileAR.Read: 0xE, FileAR.Write; 0x0)
  cmdData += '00E0';
  //UID mirror: 1
  //SDMReadCtr: 1
  //SDMReadCtrLimit: 0
  //SDMENCFileData: 0
  //ASCII Encoding mode: 1
  cmdData += 'C1';
  //sdm access rights
  //RFU: 0F
  //CtrRet: 0F
  //MetaRead: 01
  //FileRead: 02
  cmdData += 'FF12';
  //ENCPICCDataOffset
  cmdData += piccOffset.toString(16).padEnd(6, '0');
  //SDMMACOffset
  cmdData += macOffset.toString(16).padEnd(6, '0');
  //SDMMACInputOffset
  cmdData += macOffset.toString(16).padEnd(6, '0');

  const cmdDataPadd = padForEnc(cmdData, 16);

  console.log('cmdDataPadd', cmdDataPadd);
  const cmdCtr = decToHexLsbFirst(cmdCtrDec, 2);
  const iv = ivEncryption(ti, cmdCtr, sesAuthEncKey);
  const aesEncryptOption = {
    mode: CryptoJS.mode.CBC,
    iv: CryptoJS.enc.Hex.parse(iv),
    keySize: 128 / 8,
    padding: CryptoJS.pad.NoPadding,
  };

  const encKeyData = AES.encrypt(
    CryptoJS.enc.Hex.parse(cmdDataPadd),
    CryptoJS.enc.Hex.parse(sesAuthEncKey),
    aesEncryptOption,
  ).ciphertext.toString(CryptoJS.enc.Hex);

  const fileNo = '02';
  const commandMac = CryptoJS.CMAC(
    CryptoJS.enc.Hex.parse(sesAuthMacKey),
    CryptoJS.enc.Hex.parse('5F' + cmdCtr + ti + fileNo + encKeyData),
  );
  const commandMacHex = commandMac.toString();
  console.log(
    'changeFileSettings encKeyData',
    encKeyData,
    hexToBytes(encKeyData),
  );
  console.log('changeFileSettings commandmac', commandMacHex);

  const truncatedMacBytes = hexToBytes(commandMacHex).filter(function (
    element,
    index,
    array,
  ) {
    return (index + 1) % 2 === 0;
  });
  const truncatedMac = bytesToHex(truncatedMacBytes);
  console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
  const data = encKeyData + truncatedMac;
  console.log('data', data, data.length);
  const lc = (data.length / 2 + 1).toString(16);
  const changeFileSettingsHex =
    '905F0000' + lc + fileNo + encKeyData + truncatedMac + '00';
  console.log('changeFileSettingsHex', changeFileSettingsHex);

  const changeFileSettingsRes = await Ntag424.sendAPDUCommand(
    hexToBytes(changeFileSettingsHex),
  );
  const resCode = bytesToHex([
    changeFileSettingsRes.sw1,
    changeFileSettingsRes.sw2,
  ]);
  console.warn('changeFileSettingsRes Result: ', resCode);
  if (resCode == '9100') {
    return Promise.resolve('Successful');
  } else {
    return Promise.reject(resCode);
  }
};

Ntag424.resetFileSettings = async (
  sesAuthEncKey,
  sesAuthMacKey,
  ti,
  cmdCtrDec,
) => {
  //File Option SDM and mirroring enabled, CommMode: plain
  var cmdData = '40';
  //Access rights (FileAR.ReadWrite: 0xE, FileAR.Change: 0x0, FileAR.Read: 0xE, FileAR.Write; 0xE)
  cmdData += 'E0EE';

  //UID mirror: 0
  // SDMReadCtr: 0
  // SDMReadCtrLimit: 0
  // SDMENCFileData: 0
  // ASCII Encoding mode: 1
  cmdData += '01';
  //sdm access rights
  //RFU: 0F
  //CtrRet: 0F
  //MetaRead: 0F
  //FileRead: 0F
  cmdData += 'FFFF';
  //no picc offset and mac offset

  const cmdDataPadd = padForEnc(cmdData, 16);

  console.log('cmdDataPadd', cmdDataPadd);
  const cmdCtr = decToHexLsbFirst(cmdCtrDec, 2);
  const iv = ivEncryption(ti, cmdCtr, sesAuthEncKey);
  const aesEncryptOption = {
    mode: CryptoJS.mode.CBC,
    iv: CryptoJS.enc.Hex.parse(iv),
    keySize: 128 / 8,
    padding: CryptoJS.pad.NoPadding,
  };

  const encKeyData = AES.encrypt(
    CryptoJS.enc.Hex.parse(cmdDataPadd),
    CryptoJS.enc.Hex.parse(sesAuthEncKey),
    aesEncryptOption,
  ).ciphertext.toString(CryptoJS.enc.Hex);

  const fileNo = '02';
  const commandMac = CryptoJS.CMAC(
    CryptoJS.enc.Hex.parse(sesAuthMacKey),
    CryptoJS.enc.Hex.parse('5F' + cmdCtr + ti + fileNo + encKeyData),
  );
  const commandMacHex = commandMac.toString();
  console.log(
    'changeFileSettings encKeyData',
    encKeyData,
    hexToBytes(encKeyData),
  );
  console.log('changeFileSettings commandmac', commandMacHex);

  const truncatedMacBytes = hexToBytes(commandMacHex).filter(function (
    element,
    index,
    array,
  ) {
    return (index + 1) % 2 === 0;
  });
  const truncatedMac = bytesToHex(truncatedMacBytes);
  console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
  const data = encKeyData + truncatedMac;
  console.log('data', data, data.length);
  const lc = (data.length / 2 + 1).toString(16);
  const changeFileSettingsHex =
    '905F0000' + lc + fileNo + encKeyData + truncatedMac + '00';
  console.log('changeFileSettingsHex', changeFileSettingsHex);

  const changeFileSettingsRes = await Ntag424.sendAPDUCommand(
    hexToBytes(changeFileSettingsHex),
  );
  const resCode = bytesToHex([
    changeFileSettingsRes.sw1,
    changeFileSettingsRes.sw2,
  ]);
  console.warn('changeFileSettingsRes Result: ', resCode);
  if (resCode == '9100') {
    const message = [Ndef.uriRecord('')];
    const bytes = Ndef.encodeMessage(message);
    console.log('ndef bytes', bytes);
    await NfcManager.ndefHandler.writeNdefMessage(bytes);

    return Promise.resolve('Successful');
  } else {
    return Promise.reject(resCode);
  }
};

Ntag424.changeKey = async (
  sesAuthEncKey,
  sesAuthMacKey,
  ti,
  cmdCtrDec,
  keyNo,
  key,
  newKey,
  keyVersion,
) => {
  const cmdCtr = decToHexLsbFirst(cmdCtrDec, 2);
  console.log('cmdCtr', cmdCtr);
  const iv = ivEncryption(ti, cmdCtr, sesAuthEncKey);
  console.log('iv', iv);
  const aesEncryptOption = {
    mode: CryptoJS.mode.CBC,
    iv: CryptoJS.enc.Hex.parse(iv),
    keySize: 128 / 8,
    padding: CryptoJS.pad.NoPadding,
  };

  var keyData = '';
  const newKeyBytes = hexToBytes(newKey);
  if (keyNo == '00') {
    //if key 0 is to be changed
    //keyData = NewKey || KeyVer 17 byte
    // 0000000000000000000000000000
    // 0000000000000000000000000000
    keyData = padForEnc(newKey + keyVersion, 32); //32 byte
  } else {
    //if key 1 to 4 are to be changed
    //keyData = (NewKey XOR OldKey) || KeyVer || CRC32NK
    // crc32
    var WordArray = CryptoJS.lib.WordArray;

    const oldNewXorBytes = CryptoJS.ext.xor(
      new WordArray.init(hexToBytes(key)),
      new WordArray.init(newKeyBytes),
    ).words;
    const oldNewXor = bytesToHex(oldNewXorBytes);
    const crc32Reversed = crc.crcjam(newKeyBytes).toString(16);
    const crc32 = bytesToHex(hexToBytes(crc32Reversed).reverse());
    keyData = padForEnc(oldNewXor + keyVersion + crc32, 32); //32 bytes
  }
  console.log('changeKey keyData', keyData, hexToBytes(keyData));

  const encKeyData = AES.encrypt(
    CryptoJS.enc.Hex.parse(keyData),
    CryptoJS.enc.Hex.parse(sesAuthEncKey),
    aesEncryptOption,
  ).ciphertext.toString(CryptoJS.enc.Hex);

  const commandMac = CryptoJS.CMAC(
    CryptoJS.enc.Hex.parse(sesAuthMacKey),
    CryptoJS.enc.Hex.parse('C4' + cmdCtr + ti + keyNo + encKeyData),
  );
  const commandMacHex = commandMac.toString();
  console.log('changeKey encKeyData', encKeyData, hexToBytes(encKeyData));
  console.log('changeKey commandmac', commandMacHex);

  const truncatedMacBytes = hexToBytes(commandMacHex).filter(function (
    element,
    index,
    array,
  ) {
    return (index + 1) % 2 === 0;
  });
  const truncatedMac = bytesToHex(truncatedMacBytes);
  console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
  const data = encKeyData + truncatedMac;
  console.log('data', data, data.length);
  const lc = (data.length / 2 + 1).toString(16);
  const changeKeyHex =
    '90C40000' + lc + keyNo + encKeyData + truncatedMac + '00';
  console.log('changeKeyHex', changeKeyHex);

  const changeKeyRes = await Ntag424.sendAPDUCommand(hexToBytes(changeKeyHex));

  const resCode = bytesToHex([changeKeyRes.sw1, changeKeyRes.sw2]);
  console.warn('changeKeyRes Result: ', resCode);
  if (resCode == '9100') {
    return Promise.resolve('Successful');
  } else {
    return Promise.reject(resCode);
  }
};

Ntag424.getCardUid = async (sesAuthEncKey, sesAuthMacKey, ti, cmdCtrDec) => {
  var cmdCtr = decToHexLsbFirst(cmdCtrDec, 2);
  const commandMac = CryptoJS.CMAC(
    CryptoJS.enc.Hex.parse(sesAuthMacKey),
    CryptoJS.enc.Hex.parse('51' + cmdCtr + ti),
  );
  const commandMacHex = commandMac.toString();
  console.log('getCardUid commandmac', commandMacHex);

  const truncatedMacBytes = hexToBytes(commandMacHex).filter(function (
    element,
    index,
    array,
  ) {
    return (index + 1) % 2 === 0;
  });
  const truncatedMac = bytesToHex(truncatedMacBytes);
  console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));

  const getCardUidBytes = hexToBytes('9051000008' + truncatedMac + '00');
  const getCardUidRes = await Ntag424.sendAPDUCommand(getCardUidBytes);

  const responseAPDU = bytesToHex(getCardUidRes.response);
  const resCode = bytesToHex([getCardUidRes.sw1, getCardUidRes.sw2]);
  console.warn('getCardUidRes: ', resCode, responseAPDU);

  const resMacT = responseAPDU.slice(-16);
  console.log('mact', resMacT);
  cmdCtrDec += 1;
  cmdCtr = decToHexLsbFirst(cmdCtrDec, 2);
  console.log('cmdCtr', cmdCtr);

  const iv = ivEncryptionResponse(ti, cmdCtr, sesAuthEncKey);
  console.log('iv', iv);

  // console.log('test iv ', ivEncryption("2B4D963C014DC36F24F69A50A394F875"))
  const resDataEnc = responseAPDU.slice(0, -16);
  console.log('resDataEnc', resDataEnc)

  const resDataDec = AES.decrypt(
    {ciphertext: CryptoJS.enc.Hex.parse(resDataEnc)},
    CryptoJS.enc.Hex.parse(sesAuthEncKey),
    {
      padding: CryptoJS.pad.NoPadding,
      mode: CryptoJS.mode.CBC,
      iv: CryptoJS.enc.Hex.parse(iv),
      keySize: 128 / 8,
    },
  );
  console.log('resDataDec', resDataDec)

  const resData = CryptoJS.enc.Hex.stringify(resDataDec);

  console.log('resData', resData);
  const uid = resData.slice(0, 14);
  console.log('uid', uid);

  if (resCode == '9100') {
    return Promise.resolve(uid);
  } else {
    return Promise.reject(resCode);
  }
};

export default Ntag424;
