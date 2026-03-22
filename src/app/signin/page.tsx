"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-6">

            {/* Container */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* LEFT SIDE */}
                <div className="relative rounded-3xl bg-gradient-to-t from-[#000000] to-[#5c3fed] p-8 flex flex-col justify-end min-h-[500px] overflow-hidden">

                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30 blur-2xl rounded-3xl"></div>

                    {/* X Logo Image */}
                    <div className="relative z-10 mb-2">
                        <Image
                            src="/images/x-logo.png"
                            alt="X Logo"
                            width={350}
                            height={350}
                            className="drop-shadow-2xl"
                            priority
                        />
                    </div>

                    {/* Text */}
                    <div className="relative z-10">
                        <h1 className="text-white text-4xl font-semibold leading-tight font-ibm-plex-serif font-normal">
                            Welcome Back!
                        </h1>
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col justify-center">

                    <h2 className="text-white text-3xl font-semibold mb-2 font-ibm-plex-serif font-normal">
                        Log In
                    </h2>

                    <p className="text-gray-400 mb-8 font-ibm-plex-serif font-normal">
                        Start collaborating instantly.
                    </p>

                    {/* Google Button */}
                    <button
                        onClick={() => { window.location.href = `${API}/auth/google`; }}
                        className="group relative mb-4 rounded-[4px] p-0.5 bg-linear-to-r from-[#E36A3A] via-[#B44BD6] to-[#5C3FED] shadow-[5px_5px_7.4px_0px_#1E103538] cursor-pointer w-full"
                    >
                        <div className="flex items-center justify-center gap-3 bg-[#0F1419] rounded-[2px] px-6 py-3 text-white font-medium hover:bg-[#151B22] hover:cursor-pointer transition">
                            <FcGoogle size={20} />
                            <span>Log In With Google</span>
                        </div>
                    </button>

                    {/* X Button */}
                    <button
                        onClick={() => { window.location.href = `${API}/auth/x`; }}
                        className="group relative mb-6 rounded-[4px] p-0.5 bg-linear-to-r from-[#E36A3A] via-[#B44BD6] to-[#5C3FED] shadow-[5px_5px_7.4px_0px_#1E103538] cursor-pointer w-full"
                    >
                        <div className="flex items-center justify-center gap-3 bg-[#0F1419] rounded-[2px] px-6 py-3 text-white font-medium hover:bg-[#151B22] hover:cursor-pointer transition">
                            <FaXTwitter size={18} />
                            <span>Log In With X</span>
                        </div>
                    </button>

                    {/* Sign up link */}
                    <p className="text-gray-400 text-center">
                        Don&apos;t have an account?{" "}
                        <Link className="text-white hover:underline cursor-pointer" href="/signup">
                            Sign Up
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}
