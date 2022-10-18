import * as readline from "readline";
import { Decryptor } from "./Decryptor.js";
import * as fs from 'fs';
function main() {
    try {
      var user_file = '../input_output_files/input_sensordatas.txt';
      var r = readline.createInterface({
          input : fs.createReadStream(user_file)
      });
      fs.truncate('../input_output_files/output_decryptedsensordata.txt', 0, err =>{if(err){return console.log(err)}})
      r.on('line', function (text) {
          const decryptedSensor = new Decryptor(text)
          console.log("Deobfuscated Sensor:\n", decryptedSensor.deobfuscated_sensor_data);
          fs.appendFile('../input_output_files/output_decryptedsensordata.txt',decryptedSensor.deobfuscated_sensor_data + "\n",err => {if(err){return console.log(err)}
          })
      });
    } catch (e) {
      console.error(e);
    }
}

main();
