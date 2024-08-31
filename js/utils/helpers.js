export const showToast = ($, toastId, toastMessage = "") => {
  var toastEl = $("#" + toastId);
  toastEl.find(".toast-body").text(toastMessage);

  var toast = new bootstrap.Toast(toastEl);
  toast.show();
};
