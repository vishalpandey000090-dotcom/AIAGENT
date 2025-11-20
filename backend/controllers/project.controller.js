import projectModel from '../models/project.model.js'
import * as projectService from '../services/project.service.js'
import { validationResult } from 'express-validator';
import userModel from '../models/user.model.js'

export const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    // Find user from token
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // User ID
    const userId = loggedInUser._id;

    // IMPORTANT CHANGE: users ARRAY pass karna hai
    const newProject = await projectService.createProject({
      name,
      users: [userId], // <-- FIXED (array required)
    });

    res.status(201).json(newProject);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};
