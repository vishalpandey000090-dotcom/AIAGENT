import projectModel from '../models/project.model.js';


export const createProject = async ({ name, userId, user, users } = {}) => {
    if (!name) {
        throw new Error('Name is required')
    }
    const uid = userId || user || (Array.isArray(users) && users[0]);
    if (!uid)
        throw new Error('User is required')

let project;
try {
    project = await projectModel.create({
        name,
        users: [uid]
    });
} catch (err) {
    // Mongo duplicate key error
    if (err && err.code === 11000) {
        throw new Error('Project name already exists');
    }
    throw err;
}

     return project;

}


