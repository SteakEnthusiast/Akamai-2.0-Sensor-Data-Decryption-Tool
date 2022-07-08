"use strict"
/**
 * Removes the outer string obfuscation and returns plain-text sensor data
 * @param {String} data The Encrypted Sensor Data
 * @param {Integer} key The first obfuscation key, extracted from the sensor_data
 * @returns The decrypted sensor data.
 */
const decryptOuter = function (data, key) {
  let MZ,rZ;
  let decrypted = "";
  const chars =
    " !#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

  const charIndexArr = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, -1, 2, 3, 4, 5,
    -1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
    44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, -1, 58, 59, 60, 61,
    62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
    81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
  ];
  for (MZ = 0; MZ < data.length; ++MZ) {
    rZ = (key >> 8) & 65535;
    key *= 65793;
    key &= 4294967295;
    key += 4282663;
    key &= 8388607;

    const originalIndex = data.charCodeAt(MZ);
    let newIndex = charIndexArr[originalIndex];
    newIndex -= rZ % chars.length;
    newIndex = newIndex < 0 ? newIndex + chars.length : newIndex;
    decrypted += chars[newIndex];
  }
  return decrypted;
};

/**
 * Undo inner encryption (some sort of reordering function)
 * @param {String} data The Encrypted Sensor Data
 * @param {Integer} key The second obfuscation key, extracted from the sensor_data
 * @returns The reordered sensor data.
 */
const decryptInner = function (data, key) {
  let decrypted = data.split(",");
  let arr1 = new Array(decrypted.length);
  let arr2 = new Array(decrypted.length);
  let dV, RV, HV, JV;

  for (JV = 0; JV < decrypted.length; JV++) {
    dV = ((key >> 8) & 65535) % decrypted.length;
    key *= 65793;
    key &= 4294967295;
    key += 4282663;
    key &= 8388607;
    RV = ((key >> 8) & 65535) % decrypted.length;
    key *= 65793;
    key &= 4294967295;
    key += 4282663;
    key &= 8388607;
    HV = decrypted[dV];

    arr1[decrypted.length - 1 - JV] = dV;
    arr2[decrypted.length - 1 - JV] = RV;
  }

  for (let i = 0; i < decrypted.length; i++) {
    [decrypted[arr1[i]], decrypted[arr2[i]]] = [
      decrypted[arr2[i]],
      decrypted[arr1[i]],
    ];
  }
  return decrypted.join(",");
};
/**
 * During sensor-data generation, Akamai adds some ugly junk text in between each part of the sensor data.
 * This parses it, then removes all occurences of it for a clean sensor.
 * @param {String} payload
 * @returns The decrypted sensor data with the array splitter removed.
 */
const removeSplitter = function (payload) {
  const splitData = payload.split("2,");
  const splitterStr = splitData[1];
  return payload.replaceAll(splitterStr, "");
};

/**
 * Parses the obfuscation keys, prefixes, and
 * @param {String} payload
 * @returns The fully decrypted sensor data, JSON format.
 */
function decryptMain(payload) {
  //parse json
  payload = JSON.parse(payload);
  // extract keys
  const [key1, key2] = payload.sensor_data.toString().split(";").slice(1, 3);

  // Parse prefix
  let sensor_data = payload.sensor_data;

  // Prefix is added after obfuscation is completed
  // We should remove it before trying to reverse the obfuscation.
  let prefix = "";

  // Original Code for prefix prepending looks like this:
  // MV = "2;" + gV[0] + bZ + gV[1] + bZ + cZ + bZ + MV;

  const extra = /(\d+;\d+;\d+;[\d,]+;)/.exec(sensor_data)[0];
  if (extra) {
    prefix = /(\d+;\d+;\d+;[\d,]+;)/.exec(sensor_data)[0];
    sensor_data = sensor_data.substring(prefix.length);
  }

  // Obfuscated strings to plaintext
  sensor_data = decryptOuter(sensor_data, key1);

  // Some sort of reordering
  sensor_data = decryptInner(sensor_data, key2);

  sensor_data = removeSplitter(sensor_data);
  return `{"sensor_data":"${prefix + sensor_data}"}`;
}

module.exports = {
  decrypt: decryptMain,
};
