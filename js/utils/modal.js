jQuery(document).ready(function ($) {
  const closeModal = (modal) => {
    modal.removeClass("opacity-100").addClass("opacity-0");

    setTimeout(() => {
      modal.addClass("hidden");
    }, 500);
  };

  // Open modal
  $(document).on("click", "[data-modal-target]", function () {
    var modalId = $(this).data("modal-target");

    const modal = $("#" + modalId);

    modal.removeClass("hidden");

    setTimeout(() => {
      modal.removeClass("opacity-0").addClass("opacity-100");
    }, 0);
  });

  // Close modal
  $(document).on("click", ".close-modal", function () {
    let modal = $(this).closest(".modal");

    closeModal(modal);
  });

  $(document).on("click", function (e) {
    if ($(e.target).hasClass("modal")) {
      closeModal($(e.target));
    }
  });
});
