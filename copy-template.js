// copy-template.js
const fs = require('fs');
const path = require('path');

// Path to the template file in your package's directory
const templateFilePath = path.join(__dirname, 'translate-locale.config-template.js'); // Change 'template-file.txt' to your actual template file name
const destinationFilePath = "../../translate-locale.config.js"
// Check if the destination file already exists
if (!fs.existsSync(destinationFilePath)) {
    // Copy the template file to the user's project directory
    fs.copyFileSync(templateFilePath, destinationFilePath);
    console.log(`Config file copied to ${destinationFilePath}`);
} else {
    console.log(`Config file already exists. Skipping copy.`);
}