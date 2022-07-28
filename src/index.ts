import * as readline from "readline";
import { Decryptor } from "./Decryptor.js";
function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.question(`Enter JSON Sensor Data: \n`, (rawSensor: string) => {
    try {
      const decryptedSensor: Decryptor = new Decryptor(rawSensor);
      console.log(
        "Deobfuscated Sensor:\n",
        decryptedSensor.deobfuscated_sensor_data
      );
    } catch (e) {
      console.error(e);
    }
    rl.close();
  });
}

main();
