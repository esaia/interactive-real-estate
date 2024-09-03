export const showToast = ($, isSuccess, msg) => {
  const $toastContainer = $("#toast-container");
  const $successToast = $("#successToast");
  const $errorToast = $("#errorToast");

  $successToast.hide();
  $errorToast.hide();

  $successToast.find(".toastText").text(msg);

  if (isSuccess) {
    $successToast.fadeIn();
  } else {
    $errorToast.fadeIn();
  }

  // Fade out the toast after 5 seconds
  setTimeout(() => {
    $successToast.fadeOut();
    $errorToast.fadeOut();
  }, 3000);
};
