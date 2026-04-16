"use client";

import { motion } from "framer-motion";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white">
            <div className="w-full max-w-md space-y-8">
                {/* Logo & Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-2"
                >
                    <h1 className="text-4xl font-black tracking-tight text-gray-900">
                        SHEVA<span className="text-primary">OS</span>
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Créez votre compte professionnel
                    </p>
                </motion.div>

                {/* Card Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-100 border border-orange-50"
                >
                    <SignupForm />
                </motion.div>

                {/* Footer info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm text-gray-400 font-medium"
                >
                    Propulsé par Sheva OS • COD Excellence
                </motion.p>
            </div>
        </main>
    );
}
