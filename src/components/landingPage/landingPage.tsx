import { HowItWorks } from "./sections/howItWorks";
import Navbar from "../modules/navbar";
import { CTASection } from "./sections/cta";
import Footer from "./sections/footer";
import WhoItsForSection from "./sections/whoItsForSection";
import { ProblemSectionWrapper } from "./sections/problemSection";
import { Hero } from "./sections/hero";
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="">
            {/* Navbar and Hero section */}
            <div className="h-auto bg-linear-to-b from-[#5C3FED] to-[#10060A]">
                <Navbar mobileClassName="bg-[#5C3FED]" />
                {/* Hero section */}
                <Hero />
            </div>

            {/* Second/Problem section */}
            <div className="
                h-auto bg-[#F9F9F9]
                bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
                bg-size-[40px_40px]
                ">
                <div className="max-w-7xl mx-auto px-6 pb-10">
                    <ProblemSectionWrapper />
                </div>
            </div>
            {/* How it works section */}
            <div id="features" className="h-auto bg-[#08060A]
                bg-[linear-gradient(to_right,#BABABA1C_1px,transparent_1px),linear-gradient(to_bottom,#BABABA1C_1px,transparent_1px)]
                bg-size-[40px_40px]">
                <div className="max-w-7xl mx-auto h-full px-2 py-10">
                    <HowItWorks />
                </div>
            </div>

            {/*  Co-founder thoughts on the product */}
            <div
                id="about"
                className="h-auto bg-[linear-gradient(180.54deg,#E4DFFF_0.47%,#F9F9F9_99.54%)]"
            >
                <div className="max-w-7xl mx-auto h-full ">
                    {/* <h2 className="text-slate-900 text-2xl font-semibold">
                        What Saas Founders should post on X (icon here)
                    </h2> */}
                    
                    <div className="max-w-2xl space-y-6 text-gray-800 p-20 mx-auto">
                        <div className="flex items-center gap-2">
                        <Image
                            src="https://pbs.twimg.com/profile_images/2016873619414982656/HsT3Sm3x_400x400.jpg"
                            alt="Jahswill Profile picture"
                            className="w-16 h-16 rounded-full"
                            width={100}
                            height={100}
                        />
                    <p>Hello hacker 👋 — I'm Jahswill the co-founder of HackrPost.</p>
                    </div>
                <p>
                    Most founders post generic advice, random updates, or trend-driven takes.
                </p>
                <p>
                    That attracts everyone.<br />
                    And <em className="italic">everyone</em> rarely becomes users.
                </p>
                <p>
                    Most tools double down on this.<br />
                    They help you post more.<br />
                    They don't help you post <strong>with intention</strong>.
                </p>

                <p>
                    So we built <strong>HackrPost</strong> for three simple reasons:
                </p>

                <ul className="list-disc space-y-2">
                    <li>
                            Help indie hackers create <strong>relevant, niche content</strong> around the problem they solve
                    </li>
                    <li>
                         Position them as an <strong>expert in one clear problem space</strong>, not everything
                    </li>
                    <li>
                         Make it easier to attract the <em className="italic">right people</em> — and sell to them later

                    </li>
                </ul>

                    <p>
                        Because when your content speaks directly to people who already <strong>care</strong> about the problem you solve,<br />
                        trust builds faster.
                    </p>

                    <p>
                        And with trust, you can sell more.
                    </p>

                    <p>
                        We're building <strong>HackrPost</strong> in public and using it ourselves.
                    </p>

                    <p className="font-medium">
                        No hype.<br />
                        No vanity metrics.
                    </p>

                    <p>
                        Just focused growth, with the right people.
                    </p>

                    <p className="font-semibold">
                        Let’s ship!!! 🚀
                    </p>
                    </div>

                    
                </div>
            </div>


            {/* Who Its for section */}
            <div className=" 
                h-auto bg-[#F9F9F9]
                bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
                bg-size-[40px_40px]
                ">
                <div className="max-w-7xl mx-auto h-full px-2">
                    <WhoItsForSection />
                </div>
            </div>

            {/* Final CTA section */}
            <div className="h-auto bg-linear-to-b from-[#10060A] via-[#10060A] to-[#5C3FED]
            pt-20">
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-2">
                    <CTASection />
                </div>
            </div>
            {/* Footer */}
            <div className="bg-[#060507] py-5">
                <div className="max-w-7xl mx-auto px-6">
                    <Footer />
                </div>
            </div>
        </div>
    )
}