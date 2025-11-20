import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
    unique: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

// Correct Model
const Project = mongoose.model("project", projectSchema);

// **YAHI EXPORT KARNA HAI**
export default Project;
