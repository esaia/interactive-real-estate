const svgCanvas = document.getElementById("svgCanvas");
let points = [];
let shapeClosed = false;
let currentPath;
let group;
let firstCircle;
let lastClickedGroup; // Track the last clicked group for circle visibility
let updateMode = false;
let draggedCircle = null; // Track the currently dragged circle
let isDragging = false; // Track dragging status

// Event listeners
svgCanvas.addEventListener("click", onCanvasClick);
svgCanvas.addEventListener("mousemove", throttle(onCanvasMouseMove, 10)); // Throttle mousemove events
document.addEventListener("keydown", onEscKeyDown); // Add keydown event listener for Esc key
svgCanvas.addEventListener("contextmenu", onPathContextMenu); // Add contextmenu listener

// Handle canvas click to create shapes
function onCanvasClick(event) {
  if (shapeClosed || updateMode) return;

  const rect = svgCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (points.length === 0) {
    // Create a group <g> element to hold the shape and its circles
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgCanvas.appendChild(group);

    // Initialize the path first and add it to the group
    currentPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    currentPath.setAttribute("fill", "#87cefa86");
    currentPath.setAttribute("stroke", "black");
    currentPath.setAttribute("stroke-width", "2");
    group.appendChild(currentPath);

    // Create the first circle with special styling and add it to the group
    firstCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    firstCircle.setAttribute("cx", x);
    firstCircle.setAttribute("cy", y);
    firstCircle.setAttribute("r", 5);
    firstCircle.setAttribute("class", "first-circle");
    group.appendChild(firstCircle);
  } else if (!isCloseToFirstPoint(x, y, points[0])) {
    // Create additional circles and add them to the same group, but only if not closing the shape
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 5);
    circle.setAttribute("fill", "black");
    group.appendChild(circle);
  }

  points.push({ x, y });

  if (points.length > 2 && isCloseToFirstPoint(x, y, points[0])) {
    closeShape();
  }
}

// Handle canvas mouse move to update path
function onCanvasMouseMove(event) {
  if (shapeClosed || points.length === 0) return;

  const rect = svgCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (updateMode && draggedCircle) {
    // Update the position of the dragged circle and update the path
    draggedCircle.setAttribute("cx", x);
    draggedCircle.setAttribute("cy", y);
    updatePath();
    return;
  }

  // Update the path data in real-time
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }
  pathData += ` L ${x} ${y}`;
  currentPath.setAttribute("d", pathData);

  // Only apply hover effects if there is more than one circle
  if (points.length > 1 && isCloseToFirstPoint(x, y, points[0])) {
    firstCircle.classList.add("hovering");
    animateRadius(firstCircle, 7, "orange"); // Increase radius on hover
  } else {
    firstCircle.classList.remove("hovering");
    animateRadius(firstCircle, 5, "red"); // Reset radius when not hovering
  }
}

// Throttle function to limit the rate of function execution
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
}

// Animate circle radius and color
function animateRadius(element, targetRadius, color) {
  const currentRadius = parseFloat(element.getAttribute("r"));
  const step = (targetRadius - currentRadius) / 5; // Adjust for smoother/slower transition
  let currentStep = 0;

  // Set initial color before starting animation
  element.setAttribute("fill", color);

  function animateStep() {
    currentStep++;
    const newRadius = currentRadius + step * currentStep;
    element.setAttribute("r", newRadius);

    if (currentStep < 5) {
      requestAnimationFrame(animateStep);
    }
  }

  animateStep();
}

// Close the shape by connecting the last point to the first point
function closeShape() {
  shapeClosed = true;

  // Close the path by connecting it back to the starting point
  let pathData = currentPath.getAttribute("d");
  pathData += " Z";
  currentPath.setAttribute("d", pathData);

  group.setAttribute("el-id", "123");

  // Make all circles transparent
  const circles = group.querySelectorAll("circle");
  circles.forEach((circle) => {
    circle.setAttribute("fill", "#00000000"); // Set to transparent
  });

  // Reset the first circle's radius and color
  firstCircle.setAttribute("r", 5); // Reset to original radius
  firstCircle.setAttribute("fill", "#00000000"); // Set to transparent

  // Remove event listeners to stop the current shape creation
  svgCanvas.removeEventListener("click", onCanvasClick);
  svgCanvas.removeEventListener("mousemove", onCanvasMouseMove);

  // Reset for the next shape
  resetShape();
}

// Handle right-click (context menu) on path to toggle circle visibility
function onPathContextMenu(event) {
  event.preventDefault(); // Prevent the default context menu from appearing

  const clickedGroup = event.target.parentNode; // Get the group of the clicked path
  const circles = document.querySelectorAll("g circle");
  const paths = document.querySelectorAll("g path");

  if (
    (updateMode && clickedGroup.tagName !== "g") ||
    (!updateMode && clickedGroup.tagName !== "g")
  ) {
    updateMode = false;
  } else {
    updateMode = true;
  }

  console.log(updateMode);

  circles.forEach((circle) => {
    if (circle.parentNode === clickedGroup) {
      if (!updateMode) {
        circle.setAttribute("fill", "#00000000");
      } else {
        circle.setAttribute("fill", "black");
      }
    } else {
      circle.setAttribute("fill", "#00000000");
    }
  });

  paths.forEach((path) => {
    if (path.parentNode === clickedGroup && updateMode) {
      path.setAttribute("fill", "red");
    } else {
      if (updateMode) {
        path.setAttribute("fill", "#87cefa22");
      } else {
        path.setAttribute("fill", "#87cefa86");
      }
    }
  });

  // Optionally track the last clicked group for reference
  lastClickedGroup = clickedGroup;

  // Add event listeners to enable dragging circles in update mode
  if (updateMode) {
    group = clickedGroup;
    svgCanvas.addEventListener("mousedown", onCircleMouseDown);
    svgCanvas.addEventListener("mouseup", onCircleMouseUp);
    svgCanvas.addEventListener("mousemove", onCircleMouseMoveWhileDragging);
  }
}

// Handle mouse down event on a circle to start dragging
function onCircleMouseDown(event) {
  if (!updateMode || event.target.tagName !== "circle") return;

  draggedCircle = event.target; // Track the currently dragged circle
  isDragging = true;
  event.preventDefault(); // Prevent default behavior
}

// Handle mouse up event to stop dragging
function onCircleMouseUp(event) {
  if (!updateMode) return;

  draggedCircle = null; // Stop tracking the dragged circle
  isDragging = false;
  event.preventDefault(); // Prevent default behavior
}

// Handle mouse move event to update the position of the dragged circle
function onCircleMouseMoveWhileDragging(event) {
  if (!updateMode || !isDragging || !draggedCircle) return;

  const rect = svgCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Update the position of the dragged circle
  draggedCircle.setAttribute("cx", x);
  draggedCircle.setAttribute("cy", y);

  // Update the path based on the new positions of circles
  updatePath();
  event.preventDefault(); // Prevent default behavior
}

// Update the path based on the current positions of circles
function updatePath() {
  if (!group) return;

  const circles = group.querySelectorAll("circle");
  if (circles.length === 0) return;

  let pathData = `M ${circles[0].getAttribute("cx")} ${circles[0].getAttribute(
    "cy"
  )}`;
  for (let i = 1; i < circles.length; i++) {
    pathData += ` L ${circles[i].getAttribute("cx")} ${circles[i].getAttribute(
      "cy"
    )}`;
  }
  pathData += " Z"; // Close the path

  currentPath = group.querySelector("path");

  currentPath.setAttribute("d", pathData);
}

// Check if a point is close to the first point
function isCloseToFirstPoint(x, y, firstPoint) {
  const dx = x - firstPoint.x;
  const dy = y - firstPoint.y;
  return Math.sqrt(dx * dx + dy * dy) < 10;
}

// Reset shape and re-enable event listeners
function resetShape() {
  points = [];
  shapeClosed = false;
  group = null;
  currentPath = null;
  firstCircle = null;

  // Re-enable event listeners for the next shape
  svgCanvas.addEventListener("click", onCanvasClick);
  svgCanvas.addEventListener("mousemove", throttle(onCanvasMouseMove, 10)); // Reapply throttling
}

function onEscKeyDown(event) {
  if (event.key === "Escape" && points.length > 0 && !shapeClosed) {
    if (group) {
      svgCanvas.removeChild(group);
    }
    resetShape();
  }
}

const button = document.querySelector("button");

button.addEventListener("click", () => {
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    view: window,
    button: 2, // Right mouse button
  });

  const findPath = svgCanvas
    .querySelector('[el-id="123"]')
    .querySelector("path");

  const canvas = svgCanvas.querySelector('[el-id="123"]');

  if (updateMode) {
    canvas.dispatchEvent(event);
  }
});
