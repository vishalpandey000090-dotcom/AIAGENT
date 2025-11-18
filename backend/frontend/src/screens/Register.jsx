import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");   
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("🟢 SUBMIT CLICKED"); // 🟢 ADDED
    console.log("🟢 Sending data:", { email, password }); // 🟢 ADDED

    try {
      const res = await axios.post("/users/register", {
        email,
        password,
      });

      console.log("🟢 Backend Response:", res.data); // 🟢 ADDED

      navigate("/");
    } catch (err) {
      console.log("🟢 Backend Error:", err.response?.data); // 🟢 ADDED
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      console.log("🟢 Finally Block Triggered"); // 🟢 ADDED
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

        {error && (
          <p className="mb-4 text-red-400 bg-red-900/40 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              onChange={(e) => {
                console.log("🟢 Email changed:", e.target.value); // 🟢 ADDED
                setEmail(e.target.value);
              }}
              type="email"
              id="email"
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              onChange={(e) => {
                console.log("🟢 Password changed:", e.target.value); // 🟢 ADDED
                setPassword(e.target.value);
              }}
              type="password"
              id="password"
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-2 rounded transition duration-200 ${
              loading 
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
