import { showToast } from "../utils/helpers.js";
import { createProject, getProjects } from "../utils/requests.js";
import { displayProjects } from "./getProjects.js";

jQuery(document).ready(function ($) {
  const image = $(".project-thumbnail");
  const form = $("#create-project-form");
  let project_image = "";

  const resetForm = () => {
    form[0].reset();
    image.addClass("d-none");
  };

  form.on("submit", function (event) {
    event.preventDefault();
    const title = $("#project_title").val();

    createProject($, title, project_image)
      .done((response) => {
        if (response.success) {
          $('[aria-label="Close"]').click();
          showToast($, "successToast", "Project added successfully");
          resetForm();

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
        }
      })
      .fail((error) => {
        console.error("Error:", error);
        showToast($, "errorToast", "something went wrong");
      });
  });

  $("#create-project-modal").on("hidden.bs.modal", function (e) {
    resetForm();
  });

  $("#open-media-library").on("click", function (e) {
    e.preventDefault();

    var mediaFrame = wp.media({
      title: "Select File",
      button: {
        text: "Use this file",
      },
      multiple: false,
    });

    mediaFrame.on("select", function () {
      const selection = mediaFrame.state().get("selection").first().toJSON();
      project_image = selection;

      image.removeClass("d-none");

      image.attr("src", selection.url).show();
    });

    mediaFrame.open();
  });
});
