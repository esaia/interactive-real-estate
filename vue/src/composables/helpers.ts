export const generateUniqueId = (length = 14) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uniqueId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters[randomIndex];
  }
  return "ui" + uniqueId;
};

export const transformSvgString = (svgString: string) => {
  // Remove backslashes and unescape characters
  let transformedSvg = svgString
    .replace(/\\/g, "") // Remove backslashes
    .replace(/&amp;/g, "&") // Unescape HTML entities
    .replace(/(\s)([a-zA-Z0-9-]+)=""/g, '$1$2=""'); // Fix empty attributes if any

  // Ensure the SVG element is properly formatted
  // transformedSvg = transformedSvg
  //   .replace(/<svg[^>]*>/, (match) =>
  //     match.replace(/class="[^"]*"/, 'class="canvas-svg absolute left-0 top-0 cursor-crosshair"')
  //   )
  //   .replace(/&lt;/g, "<") // Unescape <
  //   .replace(/&gt;/g, ">") // Unescape >
  //   .replace(/&quot;/g, '"'); // Unescape "

  return transformedSvg;
};

export const resetCanvasAfterSave = (svgRef: HTMLDivElement) => {
  const { CIRCLE_RADIUS, PATH_COLOR } = constants;

  const imgElement = svgRef?.parentElement?.querySelector("img");
  const svg = svgRef.querySelector("svg");

  if (imgElement) {
    imgElement.style.transform = "scale(1)";
  }

  if (svg) {
    svg.style.transform = "scale(1)";

    const g = svgRef.querySelectorAll("g");

    g.forEach((gtag) => {
      if (!gtag.getAttribute("id")) {
        gtag.remove();
      }
    });

    const circles = svg.querySelectorAll("circle");
    circles.forEach((circle) => {
      circle.setAttribute("fill", "#00000000");
      circle.setAttribute("r", CIRCLE_RADIUS.toString());
    });

    const paths = svg.querySelectorAll("path");
    paths.forEach((path) => {
      path.setAttribute("fill", PATH_COLOR);
    });
  }
};
