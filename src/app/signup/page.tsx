import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-6">

            {/* Container */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* LEFT SIDE */}
                <div className="relative rounded-3xl bg-gradient-to-t from-[#000000]  to-[#5c3fed] p-8 flex flex-col justify-end min-h-[500px] overflow-hidden">

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
                            Attract users
                            <br />
                            with{" "}
                            <span className="italic font-light font-ibm-plex-serif ">
                                consistency
                            </span>
                        </h1>
                    </div>

                </div>



                {/* RIGHT SIDE */}
                <div className="flex flex-col justify-in-between">

                    <h2 className="text-white text-3xl font-semibold mb-2 font-ibm-plex-serif font-normal">
                        Create Your Account
                    </h2>

                    <p className="text-gray-400 mb-8 font-ibm-plex-serif font-normal">
                        Start collaborating instantly.
                    </p>


                    {/* Google Button */}
                    <button className="group relative mb-4 rounded-md p-[1px] bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 cursor-pointer">

                        <div className="flex items-center justify-center gap-3 bg-[#0B0F19] rounded-md px-6 py-3 text-white hover:bg-transparent transition duration-300">

                            <FcGoogle size={20} />

                            <span>Sign Up With Google</span>

                        </div>

                    </button>


                    {/* X Button */}
                    <button className="group relative mb-6 rounded-md p-[1px] bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 cursor-pointer">

                        <div className="flex items-center justify-center gap-3 bg-[#0B0F19] rounded-md px-6 py-3 text-white hover:bg-transparent transition duration-300">

                            <FaXTwitter size={18} />

                            <span>Sign Up With X</span>

                        </div>

                    </button>


                    {/* Login link */}
                    <p className="text-gray-400 text-center">
                        Have an account?{" "}
                        <Link className="text-white hover:underline cursor-pointer"  href="/signin">
                            Log In
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}
