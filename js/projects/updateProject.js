import { showToast } from "../utils/helpers.js";
import { getProjects, updateProject } from "../utils/requests.js";

jQuery(document).ready(function ($) {
  const url = window.location.href;
  const urlObj = new URL(url);
  const projectNumber = +urlObj.searchParams.get("project");
  const svgElement = $("#svgCanvas");

  getProjects($, projectNumber).done((res) => {
    const svgString = res.data.svg.replace(/\\"/g, '"');
    const tempDiv = $("<div>").html(svgString);
    const newSvgContent = tempDiv.find("svg").children();
    $(svgElement).empty().append(newSvgContent);
  });

  const shrinkSidebar = () => {
    let isSidebarShrinked = false;
    const shapeSidebar = $("#shapes-sidebar");
    const shrinkIcon = $(".shrink-icon");
    shrinkIcon.on("click", () => {
      isSidebarShrinked = !isSidebarShrinked;
      if (isSidebarShrinked) {
        shapeSidebar.css("transform", "translate(100%)");
        shrinkIcon.find("span").css("rotate", "180deg");
      } else {
        shapeSidebar.css("transform", "translate(0px)");
        shrinkIcon.find("span").css("rotate", "0deg");
      }
    });
  };

  shrinkSidebar();

  $("#updateProject").on("click", () => {
    const svgString = svgElement.prop("outerHTML");

    updateProject($, projectNumber, { svg: svgString })
      .done((res) => {
        showToast($, true, "Project updated");
      })
      .fail((err) => {
        showToast($, true, "Project update failed");
      });
  });
});
