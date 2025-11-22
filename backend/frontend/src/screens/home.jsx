import React, { useContext } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from '../config/axios';

const Home = () => {
  const { user } = useContext(UserContext);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setProjectName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) return;

    console.log("Creating project:", projectName);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, user not logged in");
        return;
      }

      const res = await axiosInstance.post(
        '/projects/create',
        { name: projectName },
        {
          headers: {
            Authorization: `Bearer ${token}`,   // 🔥 IMPORTANT
          }
        }
      );

      console.log("Project created:", res.data);
    } catch (error) {
      console.error("Error creating project:", error);
    }

    closeModal();
  };

  return (
    <main className="p-4">
      <div className="projects flex items-center gap-4">
        <button
          onClick={openModal}
          className="project p-4 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition flex items-center gap-2"
        >
          New Project
          <i className="ri-link"></i>
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
              aria-label="Close modal"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">Create Project</h2>

            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                Project Name
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2 w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter project name"
                  required
                />
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
