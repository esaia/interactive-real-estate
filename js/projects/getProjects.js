import { getProjects } from "../utils/requests.js";

export const displayProjects = ($, projects) => {
  const container = $("#projectsContainer");

  container.empty();

  projects.forEach((project) => {
    const card = $(`
       <a href="${irePlugin.plugin_url}&project=${project.id}"  class="block">

          <div class="border border-gray-100 shadow-md rounded-sm cursor-pointer group">

              <div class="w-full relative pt-[60%] overflow-hidden">
                  <img src=" ${
                    project.project_image ? project.project_image : ""
                  }" class="w-full h-full absolute left-0 top-0 object-cover group-hover:scale-110 transition-all" alt="${
      project.title
    }">
              </div>

              <div class="p-2">
                  <h5 class="font-bold">${project.title}</h5>
              </div>
          </div>
         </a>

`);

    container.append(card);
  });
};

jQuery(document).ready(function ($) {
  getProjects($)
    .done((response) => {
      if (response.success && response.data) {
        displayProjects($, response.data);
      } else {
        console.log("No projects found.");
      }
    })
    .fail((error) => {
      console.error("Error:", error);
      showToast($, "errorToast", "something went wrong");
    });
});
