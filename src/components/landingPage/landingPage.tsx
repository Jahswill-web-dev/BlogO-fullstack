import Navbar from "../modules/navbar";
import Pill from "../ui/pill";
import { CTASection } from "./sections/cta";
import Footer from "./sections/footer";
import WhoItsForSection from "./sections/whoItsForSection";

export default function LandingPage() {
    return (
        <div className="">
            {/* Navbar and Hero section */}
            <div className="h-screen bg-linear-to-b from-[#5C3FED] via-[#5C3FED] to-[#10060A]">
                <Navbar />
                {/* Hero section */}
                <div className="max-w-7xl mx-auto px-6 pt-8">
                    <div className="flex gap-3 justify-center flex-wrap">
                        <Pill text="No trend-chasing." />
                        <Pill text="No generic AI tweets" />
                        <Pill text="No empty engagement" />
                    </div>
                </div>
            </div>
            {/* Second section */}
            <div>

            </div>
            {/* How it works section */}
            <div>

            </div>
            {/* CEO and Co-founders thoughts on the product */}
            <div>
                <div>
                    <h2>What Saas Founders should post on X(icon here)</h2>
                </div>
            </div>
            {/* Who Its for section */}
            <div className=" 
                h-screen bg-[#F9F9F9]
                bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
                bg-size-[40px_40px]
                ">
                <div className="max-w-7xl mx-auto h-full px-2">
                    <WhoItsForSection />
                </div>
            </div>
            {/* Final CTA section */}
            <div className="h-screen bg-linear-to-b from-[#10060A] via-[#10060A] to-[#5C3FED]
            pt-20">
                <div className="max-w-7xl mx-auto h-full">
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