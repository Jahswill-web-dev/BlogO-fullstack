import Navbar from "../modules/navbar";
import Pill from "../ui/pill";
import Footer from "./sections/footer";

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
            {/* My thoughts on the product, and this is for you section */}
            <div className="h-screen bg-[#F9F9F9]">

            </div>
            {/* Final CTA section */}
            <div className="h-screen bg-linear-to-b from-[#10060A] via-[#10060A] to-[#5C3FED]">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-5xl text-white max-w-[563px]">Start attracting users today! Not empty engagement. </h2>
                    <p className="text-[#F7F9FC] text-xl">
                        Stop wondering what to post.
                        Turn your SaaS into weeks of X content that attracts your saas users automatically.
                    </p>
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