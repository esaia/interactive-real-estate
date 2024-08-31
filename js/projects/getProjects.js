import { showToast } from "../utils/helpers.js";
import { getProjects } from "../utils/requests.js";

export const displayProjects = ($, projects) => {
  const container = $("#projectsContainer");

  container.empty();

  projects.forEach((project) => {
    const card = $(`
            <div class="col">
                <div class="card h-100">
                    <img src="${
                      project.project_image ? project.project_image : ""
                    }" class="card-img-top" alt="${project.title}">
                    <div class="card-body">
                        <h5 class="card-title">${project.title}</h5>
                    </div>
                </div>
            </div>
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
