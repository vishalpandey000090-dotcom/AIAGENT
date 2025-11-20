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

    // Find user using decoded token email
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Correct: user ID
    const user = loggedInUser._id;

    // Correct variable passed to service
    const newProject = await projectService.createProject({ name, user });

    res.status(201).json(newProject);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};
