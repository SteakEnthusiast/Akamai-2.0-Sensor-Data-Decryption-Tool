import * as readline from "readline";
import { Decryptor } from "./Decryptor.js";
import * as fs from 'fs';
function main() {
    try {
      var user_file = '../sensordatas.txt';
      var r = readline.createInterface({
          input : fs.createReadStream(user_file)
      });
      r.on('line', function (text) {
          const decryptedSensor = new Decryptor(text)
          console.log("Deobfuscated Sensor:\n", decryptedSensor.deobfuscated_sensor_data);
      });
    } catch (e) {
      console.error(e);
    }
}

main();
