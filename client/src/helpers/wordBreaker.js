export function breakLongMessage(message, maxLineLength) {
  const lines = [];
  while (message.length > maxLineLength) {
    lines.push(message.substring(0, maxLineLength));
    message = message.substring(maxLineLength);
  }
  lines.push(message); // Add the remaining part or the last line
  return lines;
}
