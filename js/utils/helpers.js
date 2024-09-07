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
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // First character options
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"; // Remaining characters
  let result = "";

  // Ensure the first character is always a letter
  const firstCharIndex = Math.floor(Math.random() * letters.length);
  result += letters[firstCharIndex];

  // Generate the remaining characters
  for (let i = 1; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};
