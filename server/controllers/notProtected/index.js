const Changelog = require("../../Models/Changelog");

const handleChangelog = async (req, res) => {
   try {
      // Fetch the changelog in the descending order. (From newest to oldest)
      const log = await Changelog.find().sort({ commitCode: -1 });
      // Take only first 10
      const last10Logs = log.slice(0, 10);

      return res.status(200).json({
         success: true,
         changelog: last10Logs,
         // If the total number of logs are less than 10 then set the more value to 0
         // Otherwise set the value to the remaining number of logs
         more: log.length - 10 < 0 ? 0 : log.length - 10,
      });
   } catch (error) {
      console.log("Something went wrong", error.message);
   }
}

module.exports = {
   handleChangelog
}
