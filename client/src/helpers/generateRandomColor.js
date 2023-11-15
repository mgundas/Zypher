// Hash function to convert a string into a numeric value
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function rgbToHex(red, green, blue) {
  const toHex = (value) => {
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hexRed = toHex(red);
  const hexGreen = toHex(green);
  const hexBlue = toHex(blue);

  return `#${hexRed}${hexGreen}${hexBlue}`;
}

// Generate a random HEX color based on a seed
export function generateRandomColor(seed) {
  const numericValue = hashCode(seed);

  // Use the numeric value to determine RGB components
  const red = (numericValue & 0xff0000) >> 16;
  const green = (numericValue & 0x00ff00) >> 8;
  const blue = numericValue & 0x0000ff;

  return rgbToHex(red, green, blue);
}
