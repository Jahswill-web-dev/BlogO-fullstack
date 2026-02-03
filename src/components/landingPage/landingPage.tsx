import { HowItWorks } from "./sections/howItWorks";
import Navbar from "../modules/navbar";
import { CTASection } from "./sections/cta";
import Footer from "./sections/footer";
import WhoItsForSection from "./sections/whoItsForSection";
import { ProblemSectionWrapper } from "./sections/problemSection";
import { Hero } from "./sections/hero";

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

            {/* CEO and Co-founders thoughts on the product */}
            <div id="about" className="h-[60vh]">
                <div className="max-w-7xl mx-auto px-2">
                    <h2>What Saas Founders should post on X(icon here)</h2>
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