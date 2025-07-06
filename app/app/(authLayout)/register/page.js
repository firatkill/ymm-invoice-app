"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const session = useSession();
  if (session.status == "authenticated") redirect("/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess("Registration successful! You can now log in.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 font-sans">
      <div className="bg-white rounded-2xl shadow-lg p-9 w-96 max-w-full">
        <h2 className="text-center mb-6 font-bold text-2xl tracking-wide">
          Register
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
            {loading ? "Registering..." : "Register"}
          </button>
          {error && (
            <div className="text-red-600 mt-4 text-center font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 mt-4 text-center font-medium">
              {success}
            </div>
          )}
        </form>
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-indigo-600 hover:underline font-medium text-base"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
