const {decrypt} = require("./deobfuscator.js")

/**
 * Get the encrypted sensor data from user input.
 * @returns The fully decrypted sensor data, JSON format.
 */
 function main() {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    readline.question(`Enter JSON Sensor Data: \n`, (sensorInput) => {
      let sensor = sensorInput;
      try {
        console.log("\nResult:\n" + decrypt(sensor));
      } catch {
        console.error(
          "Could not parse string. Please make sure you've entered sensor_data in JSON format."
        );
      }
  
      readline.close();
    });
  }
  
  main();