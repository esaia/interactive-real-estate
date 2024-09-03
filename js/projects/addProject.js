import { createProject, getProjects } from "../utils/requests.js";
import { displayProjects } from "./getProjects.js";

jQuery(document).ready(function ($) {
  const image = $(".project-thumbnail");
  const form = $("#create-project-form");
  let project_image = "";

  const resetForm = () => {
    setTimeout(() => {
      form[0].reset();
      image.addClass("hidden");
    }, 300);
  };

  form.on("submit", function (event) {
    event.preventDefault();
    const title = $("#project_title").val();

    if (!project_image) return;

    createProject($, title, project_image)
      .done((response) => {
        if (response.success) {
          resetForm();
          $(".close-modal").click();

          getProjects($)
            .done((response) => {
              if (response.success && response.data) {
                console.log("runned");

                displayProjects($, response.data);
              } else {
                console.log("No projects found.");
              }
            })
            .fail((error) => {
              console.error("Error:", error);
            });
        }
      })
      .fail((error) => {
        console.error("Error:", error);
      });
  });

  $(document).on("click", function (e) {
    if ($(e.target).hasClass("modal")) {
      resetForm();
    }
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

      image.removeClass("hidden");

      image.attr("src", selection.url).show();
    });

    mediaFrame.open();
  });
});
