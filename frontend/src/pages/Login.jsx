import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    login(data);
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form className="bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4">Login</h2>
        <input className="border p-2 w-full mb-3" placeholder="Email"
          onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full mb-3" type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white w-full p-2">Login</button>
      </form>
    </div>
  );
}