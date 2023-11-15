export const convertTime = (timestamp) => {
  // Get the current date and time
  var currentDate = new Date(timestamp);

  // Get the hour (0-23)
  var hours = currentDate.getHours();

  // Get the minutes (0-59)
  var minutes = currentDate.getMinutes();

  // Convert hours to AM/PM format
  var ampm = hours >= 12 ? "PM" : "AM";

  // Adjust hours for AM/PM format
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12' in AM/PM format

  // Display the result
  return hours + ":" + (minutes < 10 ? "0" : "") + minutes + ampm;
};
