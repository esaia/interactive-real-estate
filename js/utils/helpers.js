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

export const generateUniqueId = (length = 14) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uniqueId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters[randomIndex];
  }
  return uniqueId;
};
