"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError(res.error);
    } else {
      // Optionally redirect or show success
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 font-sans">
      <div className="bg-white rounded-2xl shadow-lg p-9 w-96 max-w-full">
        <h2 className="text-center mb-6 font-bold text-2xl tracking-wide">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-5 px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-base text-white transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <div className="text-red-600 mt-4 text-center font-medium">
              {error}
            </div>
          )}
        </form>
        <div className="text-center mt-6">
          <Link
            href="/register"
            className="text-indigo-600 hover:underline font-medium text-base"
          >
            or, Register
          </Link>
        </div>
      </div>
    </div>
  );
}
