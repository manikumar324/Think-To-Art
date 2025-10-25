import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("login"); // "login" or "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // loading state

  const { axios, token, setToken } = useAppContext();

  // Navigate to home if token exists (after login)
  useEffect(() => {
    if (token) {
      navigate("/"); // redirect to home
    }
  }, [token, navigate]);

  const url = state === "login" ? "/api/user/login" : "/api/user/register";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loading
    try {
      const response = await axios.post(url, { name, email, password });

      if (response.status === 200 || response.status === 201) {
        if (state === "login") {
          // Login: store token and navigate
          toast.success(response.data.message || "Login successful!");
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          console.log("User LoggedIn Successfully!")
          console.log("Token :-",response.data.token)
        } else if (state === "register") {
          // Register: switch to login form
          toast.success("Registered successfully! Please login.");
          setState("login");       // show login form
          setName("");             // clear inputs
          setEmail("");
          setPassword("");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
      console.error("Error Occurred:", error.message);
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
    >
      <p className="text-2xl font-medium m-auto">
        <span className="text-purple-700">User</span>{" "}
        {state === "login" ? "Login" : "Sign Up"}
      </p>

      {state === "register" && (
        <div className="w-full">
          <p>Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Name"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
            type="text"
            required
          />
        </div>
      )}

      <div className="w-full">
        <p>Email</p>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
          type="email"
          required
        />
      </div>

      <div className="w-full">
        <p>Password</p>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
          type="password"
          required
        />
      </div>

      {state === "register" ? (
        <p className="text-sm">
          Already have an account?{" "}
          <span
            onClick={() => setState("login")}
            className="text-purple-700 cursor-pointer"
          >
            Click here
          </span>
        </p>
      ) : (
        <p>
          Create an account?{" "}
          <span
            onClick={() => setState("register")}
            className="text-purple-700 cursor-pointer"
          >
            Click here
          </span>
        </p>
      )}

     <button
  type="submit"
  disabled={loading}
  className={`bg-purple-500 hover:bg-purple-600 transition-all text-white w-full py-2 rounded-md flex justify-center items-center ${
    loading ? "opacity-70 cursor-not-allowed" : ""
  }`}
>
  {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : state === "register" ? (
    "Create Account"
  ) : (
    "Login"
  )}
</button>

    </form>
  );
};

export default Login;
