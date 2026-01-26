import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const Signup = () => {
  const API = import.meta.env.VITE_BACKEND_URL;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState(""); // State for PIN
  const [step, setStep] = useState(1); // Step 1: Info, Step 2: PIN

  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  }

  const formsubmission = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API}/api/users/register`,
        { name, email, password, pin }
      );

      if (response.status === 200) {
        navigate("/signin");
      }
    } catch (err) {
      console.error("Registration failed", err);
      // Optional: Add UI error handling here
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Create Account
        </h2>
        <p className="text-sm text-center text-gray-600 mt-2">
          {step === 1 ? "Sign up for PayU" : "Set your Security PIN"}
        </p>

        {step === 1 && (
          <form onSubmit={handleNext} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Next
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={formsubmission} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Set 4-Digit PIN
              </label>
              <input
                type="text"
                maxLength="4"
                pattern="\d{4}"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,4}$/.test(val)) setPin(val);
                }}
                placeholder="0000"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-center tracking-widest text-2xl"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">This PIN will be used for transactions.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
