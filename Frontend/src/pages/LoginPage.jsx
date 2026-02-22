import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const { axios, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // STEP 1 → Sign up first screen
      if (currState === "Sign up" && !isDataSubmitted) {
        setIsDataSubmitted(true);
        setLoading(false);
        return;
      }

      // =============================
      // REGISTER
      // =============================
      if (currState === "Sign up") {
        const { data } = await axios.post("/api/users/register", {
          fullName,
          email,
          password,
          bio,
        });

        if (data.success) {
          login(data.token);
          toast.success("Account created successfully 🎉");
          navigate("/");
        }
      }

      // =============================
      // LOGIN
      // =============================
      if (currState === "Login") {
        const { data } = await axios.post("/api/users/login", {
          email,
          password,
        });

        if (data.success) {
          login(data.token);
          toast.success("Login successful 🚀");
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* Left Logo */}
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />

      {/* Form */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg backdrop-blur-md w-[350px]"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="back"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {/* FULL NAME */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full Name"
            required
          />
        )}

        {/* EMAIL + PASSWORD */}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}

        {/* BIO (STEP 2 REGISTER) */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide a short bio..."
            required
          ></textarea>
        )}

        <button
          type="submit"
          disabled={loading}
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:opacity-90 transition"
        >
          {loading
            ? "Please wait..."
            : currState === "Sign up"
            ? isDataSubmitted
              ? "Create Account"
              : "Continue"
            : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" required />
          <p>Agree To The Terms of use & privacy policy.</p>
        </div>

        {/* Switch */}
        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-400 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-300">
              Don’t have an account?{" "}
              <span
                onClick={() => setCurrState("Sign up")}
                className="font-medium text-violet-400 cursor-pointer"
              >
                Create one
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
