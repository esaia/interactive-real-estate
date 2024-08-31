export const getProjects = ($) => {
  return $.ajax({
    url: irePlugin.ajax_url,
    method: "POST",
    data: {
      action: "get_project",
      nonce: irePlugin.nonce,
    },
  });
};

export const createProject = ($, title, project_image) => {
  return $.ajax({
    url: irePlugin.ajax_url,
    method: "POST",
    data: {
      action: "create_project",
      nonce: irePlugin.nonce,
      title,
      project_image,
      svg: "",
    },
  });
};
