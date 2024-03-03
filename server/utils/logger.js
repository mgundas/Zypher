const fs = require('fs').promises;
const path = require('path');

const getColor = (fg) => {
  let fgc = '\x1b[37m'
  switch (fg.trim().toLowerCase()) {
    case 'black':
      fgc = '\x1b[30m'
      break;
    case 'red':
      fgc = '\x1b[31m'
      break;
    case 'green':
      fgc = '\x1b[32m'
      break;
    case 'yellow':
      fgc = '\x1b[33m'
      break;
    case 'blue':
      fgc = '\x1b[34m'
      break;
    case 'magenta':
      fgc = '\x1b[35m'
      break;
    case 'cyan':
      fgc = '\x1b[36m'
      break;
    case 'magenta':
      fgc = '\x1b[45m'
      break;
    case 'white':
      fgc = '\x1b[37m'
      break;
  }
  return `${fgc}`
}

const destinationPath = path.join(__dirname, '..', 'logs/');

async function ensureDirectoryExists(directory) {
  try {
    await fs.access(directory);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Directory doesn't exist, create it
      await fs.mkdir(directory, { recursive: true });
    } else {
      // Handle other errors
      throw error;
    }
  }
}

ensureDirectoryExists(destinationPath);

 // EJueog8ItUIaZSBP
 
async function logger(log, color = "white") {
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10); // Get YYYY-MM-DD format

    const logFileName = `log_${formattedDate}.txt`;
    const logFilePath = path.join(__dirname, "..", 'logs', logFileName); // Adjust the directory as needed

    const logMessage = `${currentDate.toISOString()} - ${log}\n`;

    // Check if the log file for the current date already exists
    const fileExists = await fs.access(logFilePath).then(() => true).catch(() => false);

    // If the file exists, append to it; otherwise, create a new one
    if (fileExists) {
      await fs.appendFile(logFilePath, logMessage);
    } else {
      await fs.writeFile(logFilePath, logMessage);
    }
    console.log(getColor(color), log, getColor("white"));
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

module.exports = logger