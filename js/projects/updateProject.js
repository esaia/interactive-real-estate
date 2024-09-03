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

  $("#updateProject").on("click", () => {
    const svgString = svgElement.prop("outerHTML");

    updateProject($, projectNumber, { svg: svgString })
      .done((res) => {
        // console.log("res", res);
      })
      .fail((err) => {
        // console.error("error", err);
      });
  });
});
