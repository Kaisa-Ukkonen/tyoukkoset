"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kirjautuminen epäonnistui");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Palvelinvirhe – yritä uudelleen");
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-6 rounded-lg border border-yellow-700 w-full max-w-sm shadow-xl"
      >
        <h1 className="text-xl mb-4 text-yellow-400 text-center">
          Admin login
        </h1>

        <input
          className="w-full mb-3 p-2 bg-black border border-gray-700 rounded"
          placeholder="Käyttäjätunnus"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-3 p-2 bg-black border border-gray-700 rounded"
          placeholder="Salasana"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-400 text-sm mb-2 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-yellow-600 hover:bg-yellow-500 py-2 rounded"
        >
          Kirjaudu
        </button>
      </form>
    </div>
  );
}
