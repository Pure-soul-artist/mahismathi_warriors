import { useState } from "react";
import { signupUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, UserPlus, ArrowRight } from "lucide-react";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signupUser(email, password);
            // Auto redirect to login on success
            navigate("/login?registered=true");
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529074963764-98f45c47344b?q=80&w=2086&auto=format&fit=crop')" }}>
            {/* GLOBAL OVERLAY (READABILITY) */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md p-8 rounded-3xl backdrop-blur-3xl bg-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20"
            >
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4 text-sky-400">
                        <UserPlus size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-wider">Create Account</h2>
                    <p className="text-white/70 mt-2 text-sm">Join the Mahismathi Warriors Command Center</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 flex-1 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-light"
                                placeholder="Email address"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 flex-1 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-light"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full relative flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-xl transition-all disabled:opacity-50 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? "CREATING..." : "SIGN UP"}
                            {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </span>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-white/70">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
