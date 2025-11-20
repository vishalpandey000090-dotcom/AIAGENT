import projectModel from "../models/project.model.js";

export const createProject = async ({ name, user }) => {
  if (!name || !user) {
    throw new Error("User is required");
  }

  const project = await projectModel.create({
    name,
    user,
  });

  return project;
};
