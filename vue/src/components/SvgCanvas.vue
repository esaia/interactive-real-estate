<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useProjectStore } from "../stores/useProject";
import { generateUniqueId } from "../composables/helpers";
const projectStore = useProjectStore();

const CIRCLE_RADIUS = 4;
const HOVER_CIRCLE_RADIUS = 12;

const PATH_COLOR = "#87cefa86";
const SELECTED_PATH_COLOR = "red";
const NON_SELECTED_PATH_COLOR = "#87cefa22";
const CIRCLE_COLOR = "black";

// Refs for DOM elements
const svgCanvas = ref(null);

// Reactive state
const points = ref([]);
const shapeClosed = ref(false);
const currentPath = ref(null);
const group = ref(null);
const firstCircle = ref(null);
const circleTarget = ref(null);
const updateMode = ref(false);
const draggedCircle = ref(null);
const isDragging = ref(false);
let zoomLevel = ref(1);
let lastCursorX = ref(0);
let lastCursorY = ref(0);

// Setup functions
const throttle = (fn, delay) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
};

const getSVGCoordinates = (event, svgElement) => {
  const svgPoint = svgElement.createSVGPoint();
  svgPoint.x = event.clientX;
  svgPoint.y = event.clientY;
  const svgMatrix = svgElement.getScreenCTM().inverse();
  const svgCoords = svgPoint.matrixTransform(svgMatrix);
  return { x: svgCoords.x, y: svgCoords.y };
};

// Event handlers
const onCanvasClick = (event) => {
  if (shapeClosed.value || updateMode.value) return;
  const svg = svgCanvas.value.querySelector("svg");
  const svgRect = svg.getBoundingClientRect();
  const x = event.clientX - svgRect.left;
  const y = event.clientY - svgRect.top;
  const viewBox = svg.viewBox.baseVal;
  const svgX = (x / svgRect.width) * viewBox.width;
  const svgY = (y / svgRect.height) * viewBox.height;

  if (points.value.length > 2 && isCloseToFirstPoint(svgX, svgY, points.value[0])) {
    firstCircle.value.setAttribute("fill", "black");
    firstCircle.value.setAttribute("r", CIRCLE_RADIUS);

    closeShape();
    return;
  }

  if (points.value.length === 0) {
    group.value = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(group.value);

    currentPath.value = document.createElementNS("http://www.w3.org/2000/svg", "path");
    currentPath.value.setAttribute("fill", PATH_COLOR);
    currentPath.value.setAttribute("stroke", "black");
    currentPath.value.setAttribute("stroke-width", "1");
    group.value.appendChild(currentPath.value);

    firstCircle.value = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    firstCircle.value.setAttribute("cx", svgX);
    firstCircle.value.setAttribute("cy", svgY);
    firstCircle.value.setAttribute("r", CIRCLE_RADIUS);
    firstCircle.value.setAttribute("class", "first-circle");
    group.value.appendChild(firstCircle.value);
  } else if (!isCloseToFirstPoint(svgX, svgY, points.value[0])) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", svgX);
    circle.setAttribute("cy", svgY);
    circle.setAttribute("r", CIRCLE_RADIUS);
    circle.setAttribute("fill", CIRCLE_COLOR);
    group.value.appendChild(circle);
  }

  points.value.push({ x: svgX, y: svgY });
};

const circleMouseMove = (event) => {
  if (event.target.nodeName === "circle" && event.target.parentNode.isSameNode(group.value)) {
    circleTarget.value = event.target;

    animateRadius(circleTarget.value, HOVER_CIRCLE_RADIUS, "#cb4335");
  } else {
    if (circleTarget.value) {
      animateRadius(circleTarget.value, CIRCLE_RADIUS);
    }
  }
};

const onCanvasMouseMove = throttle((event) => {
  setCursorValues(event);

  if (updateMode.value) {
    circleMouseMove(event);
  }
  if (shapeClosed.value || points.value.length === 0) return;

  const { x, y } = getSVGCoordinates(event, svgCanvas.value.querySelector("svg"));

  if (updateMode.value && draggedCircle.value) {
    draggedCircle.value.setAttribute("cx", x || 0);
    draggedCircle.value.setAttribute("cy", y || 0);
    updatePath();
  }

  let pathData = `M ${points.value[0].x} ${points.value[0].y}`;
  for (let i = 1; i < points.value.length; i++) {
    pathData += ` L ${points.value[i].x} ${points.value[i].y}`;
  }
  pathData += ` L ${x} ${y}`;
  currentPath.value.setAttribute("d", pathData);

  if (points.value.length > 1 && isCloseToFirstPoint(x, y, points.value[0])) {
    animateRadius(firstCircle.value, HOVER_CIRCLE_RADIUS, "orange");
  } else {
    animateRadius(firstCircle.value, CIRCLE_RADIUS, "red");
  }
}, 10);

const onPathContextMenu = (event) => {
  event.preventDefault();
  circleTarget.value = null;

  if (firstCircle.value) return;

  group.value = event.target.parentNode;

  const circles = svgCanvas.value.querySelectorAll("g circle");
  const paths = svgCanvas.value.querySelectorAll("g path");

  updateMode.value = !updateMode.value && event.target.nodeName === "path" ? true : false;

  circles.forEach((circle) => {
    if (updateMode.value) {
      circle.style.cursor = "pointer";
    } else {
      circle.style.cursor = "default";
    }

    if (circle.parentNode.isSameNode(group.value)) {
      circle.setAttribute("fill", updateMode.value ? CIRCLE_COLOR : "#00000000");
    } else {
      circle.setAttribute("fill", "#00000000");
    }
  });

  paths.forEach((path) => {
    const parentGroup = path.parentNode;
    if (parentGroup.isSameNode(group.value) && updateMode.value) {
      path.setAttribute("fill", SELECTED_PATH_COLOR);

      currentPath.value = path;

      // parentGroup.appendChild(parentGroup.parentNode);
    } else {
      path.setAttribute("fill", updateMode.value ? NON_SELECTED_PATH_COLOR : PATH_COLOR);
    }
  });

  if (updateMode.value) {
    svgCanvas.value.addEventListener("mousedown", onCircleMouseDown);
    svgCanvas.value.addEventListener("mouseup", onCircleMouseUp);
    svgCanvas.value.addEventListener("mousemove", onCircleMouseMoveWhileDragging);
  }
};

const onCircleMouseDown = (event) => {
  if (!updateMode.value || event.target.tagName !== "circle") return;

  const parentG = event.target.parentNode;

  if (!parentG.isSameNode(currentPath.value.parentNode)) return;

  draggedCircle.value = event.target;
  isDragging.value = true;
  event.preventDefault();
};

const onCircleMouseUp = (event) => {
  if (!updateMode.value) return;

  draggedCircle.value = null;
  isDragging.value = false;
  event.preventDefault();
};

const onCircleMouseMoveWhileDragging = (event) => {
  if (!updateMode.value || !isDragging.value || !draggedCircle.value) return;

  const { x, y } = getSVGCoordinates(event, svgCanvas.value.querySelector("svg"));

  draggedCircle.value.setAttribute("cx", x);
  draggedCircle.value.setAttribute("cy", y);
  updatePath();
  event.preventDefault();
};

const updatePath = () => {
  if (!group.value) return;

  const circles = group.value.querySelectorAll("circle");
  if (circles.length === 0) return;

  let pathData = `M ${circles[0].getAttribute("cx")} ${circles[0].getAttribute("cy")}`;
  circles.forEach((circle, index) => {
    if (index > 0) {
      pathData += ` L ${circle.getAttribute("cx")} ${circle.getAttribute("cy")}`;
    }
  });
  pathData += " Z";

  currentPath.value.setAttribute("d", pathData);
};

const isCloseToFirstPoint = (x, y, firstPoint) => {
  const dx = x - firstPoint.x;
  const dy = y - firstPoint.y;
  return Math.sqrt(dx * dx + dy * dy) < 10;
};

const closeShape = () => {
  shapeClosed.value = true;

  let pathData = currentPath.value.getAttribute("d");
  pathData += " Z";
  currentPath.value.setAttribute("d", pathData);

  const circles = group.value.querySelectorAll("circle");
  if (circles.length < 2) {
    console.error("Not enough circles to generate a path.");
  }
  pathData = `M ${circles[0].getAttribute("cx")} ${circles[0].getAttribute("cy")}`;
  circles.forEach((circle, index) => {
    if (index > 0) {
      pathData += ` L ${circle.getAttribute("cx")} ${circle.getAttribute("cy")}`;
    }
  });

  pathData += " Z";
  currentPath.value.setAttribute("d", pathData);

  circles.forEach((circle) => {
    circle.setAttribute("fill", "#00000000");
  });

  svgCanvas.value.removeEventListener("click", onCanvasClick);
  svgCanvas.value.removeEventListener("mousemove", onCanvasMouseMove);

  const generatedKey = generateUniqueId();
  group.value.setAttribute("el-id", generatedKey);

  projectStore.addPoligonData(generatedKey);

  resetShape();
};

const resetShape = () => {
  points.value = [];
  shapeClosed.value = false;
  group.value = null;
  currentPath.value = null;
  firstCircle.value = null;

  svgCanvas.value.addEventListener("click", onCanvasClick);
  svgCanvas.value.addEventListener("mousemove", throttle(onCanvasMouseMove, 10));
};

const animateRadius = (element, targetRadius, color = "black") => {
  const currentRadius = parseFloat(element.getAttribute("r"));
  const step = (targetRadius - currentRadius) / 5;
  let currentStep = 0;

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
};

// Event listeners for zoom
const setCursorValues = (event) => {
  lastCursorX.value = event.pageX;
  lastCursorY.value = event.pageY;
};

const onDocumentKeydown = (event) => {
  if (event.key === "Escape" && points.value.length > 0 && !shapeClosed.value) {
    if (group.value) {
      group.value.remove();
    }
    resetShape();
  }

  if (event.metaKey) {
    if (event.key === "j") {
      event.preventDefault();
      zoomLevel.value += 0.4;
      applyZoom(lastCursorX.value, lastCursorY.value);
    } else if (event.key === "k") {
      resetZoom();
    }
  }
};

const applyZoom = (cursorX, cursorY) => {
  const container = document.querySelector(".canvas-container");
  const containerOffset = container.getBoundingClientRect();
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  if (containerWidth === 0 || containerHeight === 0) {
    console.error("Container dimensions are zero.");
    return;
  }

  let transformOriginX = ((cursorX - containerOffset.left) / containerWidth) * 100;
  let transformOriginY = ((cursorY - containerOffset.top) / containerHeight) * 100;

  container.querySelector("img").style.transform = `scale(${zoomLevel.value})`;
  container.querySelector("img").style.transformOrigin = `${transformOriginX}% ${transformOriginY}%`;

  container.querySelector("svg").style.transform = `scale(${zoomLevel.value})`;
  container.querySelector("svg").style.transformOrigin = `${transformOriginX}% ${transformOriginY}%`;
};

const resetZoom = () => {
  zoomLevel.value = 1;
  const container = document.querySelector(".canvas-container");
  container.querySelector("img").style.transform = "scale(1)";
  container.querySelector("svg").style.transform = "scale(1)";
  container.querySelector("img").style.transformOrigin = "center center";
  container.querySelector("svg").style.transformOrigin = "center center";
};

onMounted(() => {
  projectStore.svgRef = svgCanvas.value;
  svgCanvas.value.addEventListener("click", onCanvasClick);
  svgCanvas.value.addEventListener("mousemove", throttle(onCanvasMouseMove, 10));
  svgCanvas.value.addEventListener("contextmenu", onPathContextMenu);
  document.addEventListener("keydown", onDocumentKeydown);
});

onBeforeUnmount(() => {
  svgCanvas.value.removeEventListener("click", onCanvasClick);
  svgCanvas.value.removeEventListener("mousemove", throttle(onCanvasMouseMove, 10));
  svgCanvas.value.removeEventListener("contextmenu", onPathContextMenu);
  document.removeEventListener("keydown", onDocumentKeydown);
});
</script>

<template>
  <div
    v-if="!projectStore.svg"
    ref="svgCanvas"
    class="canvas-svg absolute left-0 top-0 h-full w-full cursor-crosshair [&_.first-circle]:cursor-pointer"
  >
    <svg ref="svgCanvas" viewBox="0 0 1720 860"></svg>
  </div>

  <div
    v-else
    v-html="projectStore.svg"
    ref="svgCanvas"
    :key="projectStore.svg"
    class="canvas-svg absolute left-0 top-0 h-full w-full cursor-crosshair [&_.first-circle]:cursor-pointer"
  ></div>
</template>
