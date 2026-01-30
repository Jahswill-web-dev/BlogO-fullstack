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
            <div>

            </div>
            {/* Final CTA section */}
            <div>

            </div>
            {/* Footer */}
            <div>
                <Footer />
            </div>
        </div>
    )
}