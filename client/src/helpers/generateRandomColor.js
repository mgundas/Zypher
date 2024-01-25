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

  // Ensure sufficient contrast with white (light text)
  const isLightColor = red * 0.299 + green * 0.587 + blue * 0.114 > 186;
  
  // Adjust the color if it's too light or too dark
  const factor = isLightColor ? 0.6 : 1;
  const adjustedRed = Math.min(255, Math.max(0, Math.round(red * factor)));
  const adjustedGreen = Math.min(255, Math.max(0, Math.round(green * factor)));
  const adjustedBlue = Math.min(255, Math.max(0, Math.round(blue * factor)));

  return rgbToHex(adjustedRed, adjustedGreen, adjustedBlue);
}

export function generateAltRandomColor(seed) {
  const getRandomValue = () => Math.floor(Math.random() * 256);

  // Generate random RGB components
  const red = getRandomValue();
  const green = getRandomValue();
  const blue = getRandomValue();

  // Ensure sufficient contrast with white (light text)
  const isLightColor = red * 0.299 + green * 0.587 + blue * 0.114 > 186;
  
  // Adjust the color if it's too light or too dark
  const factor = isLightColor ? 0.6 : 1;
  const adjustedRed = Math.min(255, Math.max(0, Math.round(red * factor)));
  const adjustedGreen = Math.min(255, Math.max(0, Math.round(green * factor)));
  const adjustedBlue = Math.min(255, Math.max(0, Math.round(blue * factor)));

  return rgbToHex(adjustedRed, adjustedGreen, adjustedBlue);
}