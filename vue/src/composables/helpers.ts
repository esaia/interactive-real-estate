export const generateUniqueId = (length = 14) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uniqueId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters[randomIndex];
  }
  return uniqueId;
};

export const transformSvgString = (svgString: string) => {
  // Remove backslashes and unescape characters
  let transformedSvg = svgString
    .replace(/\\/g, "") // Remove backslashes
    .replace(/&amp;/g, "&") // Unescape HTML entities
    .replace(/(\s)([a-zA-Z0-9-]+)=""/g, '$1$2=""'); // Fix empty attributes if any

  // Ensure the SVG element is properly formatted
  transformedSvg = transformedSvg
    .replace(/<svg[^>]*>/, (match) =>
      match.replace(/class="[^"]*"/, 'class="canvas-svg absolute left-0 top-0 cursor-crosshair"')
    )
    .replace(/&lt;/g, "<") // Unescape <
    .replace(/&gt;/g, ">") // Unescape >
    .replace(/&quot;/g, '"'); // Unescape "

  return transformedSvg;
};
