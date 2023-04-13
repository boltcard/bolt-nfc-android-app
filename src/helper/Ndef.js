var util = require('./util.js');

// decode text bytes from ndef record payload
// @returns a string
function decode(data) {
  var languageCodeLength = data[0] & 0x3f; // 6 LSBs
  // languageCode = data.slice(1, 1 + languageCodeLength),
  // utf16 = (data[0] & 0x80) !== 0; // assuming UTF-16BE

  // TODO need to deal with UTF in the future
  // console.log("lang " + languageCode + (utf16 ? " utf16" : " utf8"));

  return util.bytesToString(data.slice(languageCodeLength + 1));
}

// encode text payload
// @returns an array of bytes
function encode(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i);
    byteArray.push(charCode);
  }

  const utf8Array = stringToByteArray(str);
  console.log('utf', utf8Array.slice(0, 5));
  // const firstFiveByteArray = utf8Array.slice(0, 5);

  const firstFive = getFirstFive("google.com");
console.log('FIRST FIVE', firstFive); // Output: [209, 1, 11, 85, 4]

  return [...byteArray];
}

function getFirstFive(str) {
  const byteArray = stringToByteArray(str);
  return byteArray.slice(0, 5);
}

function stringToByteArray(str) {
  const utf8 = unescape(encodeURIComponent(str));
  const byteArray = [];
  for (let i = 0; i < utf8.length; i++) {
    const codePoint = utf8.charCodeAt(i);
    if (codePoint <= 0x7f) {
      byteArray.push(codePoint);
    } else {
      let start = i;
      while (codePoint >> 6 === 0x2) {
        i++;
        codePoint = utf8.charCodeAt(i);
      }
      const len = i - start + 1;
      const codeUnits = new Array(len);
      codeUnits[0] = ((1 << (8 - len)) - 1) << len | (codePoint >> (6 * (len - 1)));
      for (let j = 1; j < len; j++) {
        codeUnits[j] = 0x80 | (codePoint >> (6 * (len - j - 1)) & 0x3f);
      }
      byteArray.push.apply(byteArray, codeUnits);
    }
  }
  return byteArray;
}

module.exports = {
  encodeNdef: encode,
  decodeNdef: decode,
};