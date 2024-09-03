import { polygon_data } from "../canvas/connectCanvasToData.js";
import { showToast } from "../utils/helpers.js";
import { getProjects, updateProject } from "../utils/requests.js";

jQuery(document).ready(function ($) {
  const url = window.location.href;
  const urlObj = new URL(url);
  const projectNumber = +urlObj.searchParams.get("project");
  const svgElement = $("#svgCanvas");

  let currentProject;

  getProjects($, projectNumber).done((res) => {
    if (!res.success) return;
    currentProject = res.data;

    const svgString = res.data.svg.replace(/\\"/g, '"');
    const tempDiv = $("<div>").html(svgString);
    const newSvgContent = tempDiv.find("svg").children();
    $(svgElement).empty().append(newSvgContent);

    console.log();

    const sidebarTemplate = Object.values(currentProject.polygon_data).map(
      (item) => {
        return `
            <div class="flex items-center justify-between w-full p-3 cursor-pointer hover:bg-white transition-all duration-200">
                <p>shape #1</p>
                <div class="flex items-center">
                    <div class="group  flex items-center justify-center hover:bg-primary transition-all duration-200 border  border-r-0 border-gray-200 first:rounded-l-sm last:rounded-r-sm last:border-r">
                        <span class="dashicons dashicons-trash cursor-pointer text-gray-800 group-hover:text-white text-[10px] w-fit p-1 h-fit transition-all duration-200"></span>
                    </div>
                </div>
            </div>
      `;
      }
    );

    console.log(sidebarTemplate);

    $("#shapes-sidebar").find(".shapes-sidebar-items").append(`
            <div class="flex items-center justify-between w-full p-3 cursor-pointer hover:bg-white transition-all duration-200">
                <p>shape #1</p>
                <div class="flex items-center">
                    <div class="group  flex items-center justify-center hover:bg-primary transition-all duration-200 border  border-r-0 border-gray-200 first:rounded-l-sm last:rounded-r-sm last:border-r">
                        <span class="dashicons dashicons-trash cursor-pointer text-gray-800 group-hover:text-white text-[10px] w-fit p-1 h-fit transition-all duration-200"></span>
                    </div>
                </div>
            </div>
      `);
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
    const title = $("#project_title").val();

    const updatedPolygonData = {
      ...polygon_data,
      ...currentProject?.polygon_data,
    };
    console.log(currentProject);

    updateProject($, projectNumber, {
      svg: svgString,
      title,
      polygon_data: updatedPolygonData,
    })
      .done((res) => {
        showToast($, true, "Project updated");
      })
      .fail((err) => {
        showToast($, true, "Project update failed");
      });
  });
});
