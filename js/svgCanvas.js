jQuery(document).ready(function ($) {
  const $svgCanvas = $("#svgCanvas");

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
  $svgCanvas.on("click", onCanvasClick);
  $svgCanvas.on("mousemove", throttle(onCanvasMouseMove, 10)); // Throttle mousemove events
  $(document).on("keydown", onEscKeyDown); // Add keydown event listener for Esc key
  $svgCanvas.on("contextmenu", onPathContextMenu); // Add contextmenu listener

  // Handle canvas click to create shapes
  function onCanvasClick(event) {
    if (shapeClosed || updateMode) return;

    let circles = $("#svgCanvas").find("circle");
    circles.css("cursor", "pointer");

    // Get the SVG element and its bounding box
    const svg = $svgCanvas[0];
    const svgRect = svg.getBoundingClientRect();

    // Calculate mouse click position relative to SVG element
    const x = event.clientX - svgRect.left;
    const y = event.clientY - svgRect.top;

    // Calculate SVG viewBox scaling
    const viewBox = svg.viewBox.baseVal;
    const svgWidth = viewBox.width;
    const svgHeight = viewBox.height;

    // Convert click position to SVG coordinate space
    const svgX = (x / svgRect.width) * svgWidth;
    const svgY = (y / svgRect.height) * svgHeight;

    if (points.length > 2 && isCloseToFirstPoint(svgX, svgY, points[0])) {
      closeShape();

      return;
    }

    if (points.length === 0) {
      // Create a group <g> element to hold the shape and its circles
      group = $(document.createElementNS("http://www.w3.org/2000/svg", "g"));
      $svgCanvas.append(group);

      // Initialize the path first and add it to the group
      currentPath = $(
        document.createElementNS("http://www.w3.org/2000/svg", "path")
      );
      currentPath.attr({
        fill: "#87cefa86",
        stroke: "black",
        "stroke-width": "1",
      });
      group.append(currentPath);

      // Create the first circle with special styling and add it to the group
      firstCircle = $(
        document.createElementNS("http://www.w3.org/2000/svg", "circle")
      );
      firstCircle.attr({
        cx: svgX,
        cy: svgY,
        r: 3,
        class: "first-circle",
      });
      group.append(firstCircle);
    } else if (!isCloseToFirstPoint(svgX, svgY, points[0])) {
      // Create additional circles and add them to the same group, but only if not closing the shape
      const circle = $(
        document.createElementNS("http://www.w3.org/2000/svg", "circle")
      );
      circle.attr({
        cx: svgX,
        cy: svgY,
        r: 3,
        fill: "black",
      });
      group.append(circle);
    }

    points.push({ x: svgX, y: svgY });
  }
  // Function to convert mouse position to SVG coordinates
  function getSVGCoordinates(event, svgElement) {
    // Create a point object to use for coordinate conversion
    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    // Convert the client coordinates to SVG coordinates
    const svgMatrix = svgElement.getScreenCTM().inverse();
    const svgCoords = svgPoint.matrixTransform(svgMatrix);

    return { x: svgCoords.x, y: svgCoords.y };
  }

  // Handle canvas mouse move to update path
  function onCanvasMouseMove(event) {
    if (shapeClosed || points.length === 0) return;

    // Get SVG coordinates
    const { x, y } = getSVGCoordinates(event, $svgCanvas[0]);

    if (updateMode && draggedCircle) {
      // Update the position of the dragged circle and update the path
      $(draggedCircle).attr({ cx: x, cy: y });
      // updatePath();
      return;
    }

    // Update the path data in real-time
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }
    pathData += ` L ${x} ${y}`;
    currentPath.attr("d", pathData);

    // Only apply hover effects if there is more than one circle
    if (points.length > 1 && isCloseToFirstPoint(x, y, points[0])) {
      firstCircle.addClass("hovering");
      animateRadius(firstCircle, 6, "orange"); // Increase radius on hover
    } else {
      firstCircle.removeClass("hovering");
      animateRadius(firstCircle, 3, "red"); // Reset radius when not hovering
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
  function animateRadius($element, targetRadius, color) {
    const currentRadius = parseFloat($element.attr("r"));
    const step = (targetRadius - currentRadius) / 5; // Adjust for smoother/slower transition
    let currentStep = 0;

    // Set initial color before starting animation
    $element.attr("fill", color);

    function animateStep() {
      currentStep++;
      const newRadius = currentRadius + step * currentStep;
      $element.attr("r", newRadius);

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
    let pathData = currentPath.attr("d");
    pathData += " Z";
    currentPath.attr("d", pathData);

    group.attr("el-id", "123");

    // start create path by circles

    const circles = group.find("circle");

    if (circles.length < 2) {
      console.error("Not enough circles to generate a path.");
    }
    pathData = `M ${$(circles[0]).attr("cx")} ${$(circles[0]).attr("cy")}`;

    for (let i = 1; i < circles.length; i++) {
      const cx = $(circles[i]).attr("cx");
      const cy = $(circles[i]).attr("cy");
      pathData += ` L ${cx} ${cy}`;
    }

    pathData += " Z";

    group.find("path").attr({
      d: pathData,
    });

    // end

    // Make all circles transparent
    group.find("circle").each(function () {
      $(this).attr("fill", "#00000000"); // Set to transparent
    });

    // Reset the first circle's radius and color
    firstCircle.attr("r", 3); // Reset to original radius
    firstCircle.attr("fill", "#00000000"); // Set to transparent

    // Remove event listeners to stop the current shape creation
    $svgCanvas.off("click", onCanvasClick);
    $svgCanvas.off("mousemove", onCanvasMouseMove);

    // Reset for the next shape
    resetShape();
  }

  // Handle right-click (context menu) on path to toggle circle visibility
  function onPathContextMenu(event) {
    event.preventDefault(); // Prevent the default context menu from appearing

    if (firstCircle) return;

    group = $(event.target).parent(); // Get the group of the clicked path
    const $circles = $("#svgCanvas g circle");
    const $paths = $("#svgCanvas g path");

    if (
      (updateMode && group.prop("tagName") !== "g") ||
      (!updateMode && group.prop("tagName") !== "g")
    ) {
      updateMode = false;
    } else {
      updateMode = true;
    }

    $circles.each(function () {
      if ($(this).parent().is(group)) {
        $(this).attr("fill", updateMode ? "black" : "#00000000");
      } else {
        $(this).attr("fill", "#00000000");
      }
    });

    $paths.each(function () {
      const $parentGroup = $(this).parent();
      if ($parentGroup.is(group) && updateMode) {
        $(this).attr("fill", "red");
        $parentGroup.appendTo($parentGroup.parent());
      } else {
        $(this).attr("fill", updateMode ? "#87cefa22" : "#87cefa86");
      }
    });

    // Add event listeners to enable dragging circles in update mode
    if (updateMode) {
      $svgCanvas.on("mousedown", onCircleMouseDown);
      $svgCanvas.on("mouseup", onCircleMouseUp);
      $svgCanvas.on("mousemove", onCircleMouseMoveWhileDragging);
    }
  }

  // Handle mouse down event on a circle to start dragging
  function onCircleMouseDown(event) {
    if (!updateMode || $(event.target).prop("tagName") !== "circle") return;

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

    // Convert mouse position to SVG coordinates
    const { x, y } = getSVGCoordinates(event, $svgCanvas[0]);

    // Update the position of the dragged circle
    $(draggedCircle).attr({ cx: x, cy: y });

    // Update the path based on the new positions of circles
    updatePath();
    event.preventDefault(); // Prevent default behavior
  }

  // Update the path based on the current positions of circles
  function updatePath() {
    if (!group) return;

    const $circles = group.find("circle");
    if ($circles.length === 0) return;

    let pathData = `M ${$circles.first().attr("cx")} ${$circles
      .first()
      .attr("cy")}`;
    $circles.each(function (index) {
      if (index > 0) {
        pathData += ` L ${$(this).attr("cx")} ${$(this).attr("cy")}`;
      }
    });
    pathData += " Z"; // Close the path

    currentPath = group.find("path");

    currentPath.attr("d", pathData);
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
    $svgCanvas.on("click", onCanvasClick);
    $svgCanvas.on("mousemove", throttle(onCanvasMouseMove, 10)); // Reapply throttling
  }

  function onEscKeyDown(event) {
    if (event.key === "Escape" && points.length > 0 && !shapeClosed) {
      if (group) {
        group.remove();
      }
      resetShape();
    }
  }

  // ZOOMING
  let zoomLevel = 1;
  let lastCursorX = 0;
  let lastCursorY = 0;

  // Capture the cursor position when pressing zoom commands
  $(document).on("mousemove", function (e) {
    lastCursorX = e.pageX;
    lastCursorY = e.pageY;
  });

  $(document).keydown(function (e) {
    if (e.metaKey) {
      if (e.key === "j") {
        e.preventDefault();
        zoomLevel += 0.4;

        applyZoom(lastCursorX, lastCursorY);
      } else if (e.key === "k") {
        resetZoom();
      }

      // else if (e.key === "k") {
      //   e.preventDefault();
      //   zoomLevel = Math.max(0.1, zoomLevel - 0.4);
      //   applyZoom(lastCursorX, lastCursorY);
      // }
    }
  });

  function applyZoom(cursorX, cursorY) {
    let $container = $(".canvas-container");
    let containerOffset = $container.offset();

    let containerWidth = $container.width();
    let containerHeight = $container.innerHeight();

    if (containerWidth === 0 || containerHeight === 0) {
      console.error("Container dimensions are zero. Attempting to retry...");
      return;
    }

    if (cursorX !== undefined && cursorY !== undefined) {
      // Calculate the relative position within the container
      let relativeX = cursorX - containerOffset.left;
      let relativeY = cursorY - containerOffset.top;

      console.log(relativeX, relativeY);

      // Calculate transform-origin based on current zoom level
      let transformOriginX = (relativeX / containerWidth) * 100;
      let transformOriginY = (relativeY / containerHeight) * 100;

      $(".canvas-container img, .canvas-container svg").css({
        transform: `scale(${zoomLevel})`,
        "transform-origin": `${transformOriginX}% ${transformOriginY}%`,
      });
    } else {
      // Center the zoom if no cursor position is provided
      $(".canvas-container img, .canvas-container svg").css({
        transform: `scale(${zoomLevel})`,
        "transform-origin": `center center`,
      });
    }
  }

  function resetZoom() {
    zoomLevel = 1; // Reset zoom level to default
    $(".canvas-container img, .canvas-container svg").css({
      transform: "scale(1)", // Reset transform scale
      "transform-origin": "center center", // Reset transform origin
    });
  }
});
