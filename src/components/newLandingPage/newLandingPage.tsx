import { HowItWorks } from "./sections/howItWorks";
import Navbar from "../modules/navbar";
import { CTASection } from "./sections/cta";
import Footer from "./sections/footer";
import WhoItsForSection from "./sections/whoItsForSection";
import { ProblemSectionWrapper } from "./sections/problemSection";
import { Hero } from "./sections/hero";
import { ContrastBlock } from "./sections/contrastBlock";
import { SolutionSection } from "./sections/solutionSection";
import { ValueTable } from "./sections/valueTable";
import { IdentityShift } from "./sections/identityShift";
import { ContrastCopy } from "./sections/contrastCopy";
import Image from "next/image";

export default function NewLandingPage() {
    return (
        <div className="">
            {/* 1 — Navbar and Hero */}
            <div className="h-auto bg-linear-to-b from-[#5C3FED] to-[#10060A]">
                <Navbar mobileClassName="bg-[#5C3FED]" />
                <Hero />
            </div>

            {/* 2 — Contrast Block */}
            <div className="h-auto bg-[#08060A]
                bg-[linear-gradient(to_right,#BABABA1C_1px,transparent_1px),linear-gradient(to_bottom,#BABABA1C_1px,transparent_1px)]
                bg-size-[40px_40px]">
                <div className="max-w-7xl mx-auto px-6">
                    <ContrastBlock />
                </div>
            </div>

            {/* 3 — Problem Section */}
            <div className="h-auto bg-[#F9F9F9]
                bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
                bg-size-[40px_40px]">
                <div className="max-w-7xl mx-auto px-6 pb-10">
                    <ProblemSectionWrapper />
                </div>
            </div>

            {/* 4 — Solution Section */}
            <div className="h-auto bg-[#08060A]
                bg-[linear-gradient(to_right,#BABABA1C_1px,transparent_1px),linear-gradient(to_bottom,#BABABA1C_1px,transparent_1px)]
                bg-size-[40px_40px]">
                <div className="max-w-7xl mx-auto px-2">
                    <SolutionSection />
                </div>
            </div>

            {/* 5 — Value Table */}
            <div className="h-auto bg-[#F9F9F9]
                bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
                bg-size-[40px_40px]">
                <div className="max-w-7xl mx-auto px-6">
                    <ValueTable />
                </div>
            </div>

            {/* 6 — How It Works */}
            <div id="features" className="h-auto bg-[#08060A]
                bg-[linear-gradient(to_right,#BABABA1C_1px,transparent_1px),linear-gradient(to_bottom,#BABABA1C_1px,transparent_1px)]
                bg-size-[40px_40px]">
                <div className="max-w-7xl mx-auto h-full px-2 py-10">
                    <HowItWorks />
                </div>
            </div>

            {/* 7 — Identity Shift */}
            <div
                id="about"
                className="h-auto bg-[linear-gradient(180.54deg,#E4DFFF_0.47%,#F9F9F9_99.54%)]"
            >
                <div className="max-w-7xl mx-auto h-full">
                    <IdentityShift />
                </div>
            </div>

            {/* 8 — Contrast Copy */}
            <div className="h-auto bg-[#10060A]">
                <div className="max-w-7xl mx-auto px-6">
                    <ContrastCopy />
                </div>
            </div>

            {/* 9 — Who It's For */}
            <div className="h-auto bg-[#F9F9F9]
                bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
                bg-size-[40px_40px]">
                <div className="max-w-7xl mx-auto h-full px-2">
                    <WhoItsForSection />
                </div>
            </div>

            {/* 10 — Founder Note */}
            <div className="h-auto bg-[linear-gradient(180.54deg,#E4DFFF_0.47%,#F9F9F9_99.54%)]">
                <div className="max-w-7xl mx-auto h-full">
                    <div className="max-w-2xl space-y-6 text-gray-800 p-20 mx-auto">
                        <div className="flex items-center gap-2">
                            <Image
                                src="https://pbs.twimg.com/profile_images/2016873619414982656/HsT3Sm3x_400x400.jpg"
                                alt="Jahswill Profile picture"
                                className="w-16 h-16 rounded-full"
                                width={100}
                                height={100}
                            />
                            <p>Hello 👋 I'm Jahswill, co-founder of HackrPost.</p>
                        </div>
                        <p>
                            Most AI content tools have the same problem: the output sounds like AI content.
                            And people on X have seen enough of it to recognize it instantly.
                            When they do, they keep scrolling.
                        </p>
                        <p>
                            We didn't build another generator.
                        </p>
                        <p>
                            We built a posting system, one that writes in your niche, sounds like a real person,
                            and publishes automatically so you never fall off.
                        </p>
                        <p>
                            Consistent posting in a focused niche, with content that sounds human: that's what
                            actually builds an audience on X. HackrPost makes that possible without it
                            consuming your day.
                        </p>
                        <p>
                            We're building this in public and using it ourselves. No hype. Just a system that works.
                        </p>
                        <p className="font-semibold">
                            Let's ship. 🚀
                        </p>
                    </div>
                </div>
            </div>

            {/* 11 — Final CTA */}
            <div className="h-auto bg-linear-to-b from-[#10060A] via-[#10060A] to-[#5C3FED] pt-20">
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-2">
                    <CTASection />
                </div>
            </div>

            {/* 12 — Footer */}
            <div className="bg-[#060507] py-5">
                <div className="max-w-7xl mx-auto px-6">
                    <Footer />
                </div>
            </div>
        </div>
    )
}
