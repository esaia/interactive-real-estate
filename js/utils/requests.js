export const getProjects = ($, projectId) => {
  return $.ajax({
    url: irePlugin.ajax_url,
    method: "POST",
    data: {
      action: "get_projects",
      nonce: irePlugin.nonce,
      projectId,
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

export const updateProject = ($, projectId, params) => {
  return $.ajax({
    url: irePlugin.ajax_url,
    method: "POST",
    data: {
      action: "update_project",
      nonce: irePlugin.nonce,
      projectId,
      ...params,
    },
  });
};
