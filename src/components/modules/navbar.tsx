"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    // Animation variants for mobile menu
    const menuVariants = {
        closed: { height: 0, opacity: 0, transition: { duration: 0.3 } },
        open: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
    };
    //hamburger icon rotation
    const hamburgerVariants = {
        closed: { rotate: 0 },
        open: { rotate: 90 },
    };
    return (
        <nav className="w-full bg-[#08060] border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="HackrPost Logo"
                        width={100}
                        height={100}
                        className="w-[118px] h-[21px]"
                        priority
                    />
                </Link>


                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-gray-300">
                    <Link href="#about" className="hover:text-white">About</Link>
                    <Link href="#features" className="hover:text-white">Features</Link>
                    <Link href="#pricing" className="hover:text-white">Pricing</Link>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* Desktop CTA */}
                    <Link
                        href="/pricing"
                        className="hidden md:inline-flex bg-[#0F1419] text-white px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition"
                    >
                        Get Early Access
                    </Link>

                    {/* Mobile Menu Button */}
                    <motion.button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white text-2xl"
                        aria-label="Toggle menu"
                        animate={isOpen ? "open" : "closed"}
                        variants={hamburgerVariants}
                    >
                        ☰
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="mobileMenu"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        className="md:hidden overflow-hidden bg-[#0F1419] border-t border-white/10 px-4 space-y-4 text-gray-300
                        flex flex-col pb-5 gap-2 pt-3"
                    >
                        <Link href="#about" onClick={() => setIsOpen(false)}>About</Link>
                        <Link href="#features" onClick={() => setIsOpen(false)}>Features</Link>
                        <Link href="#pricing" onClick={() => setIsOpen(false)}>Pricing</Link>

                        <Link
                            href="/pricing"
                            className="block text-center bg-[#0F1419] text-white py-2 rounded-md font-medium mt-4"
                        >
                            Get Early Access
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
