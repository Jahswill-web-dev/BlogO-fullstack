import Navbar from "@/components/modules/navbar";


export const metadata = {
  title: "Pricing - Get Pro for $39 in Your First Year",
  description: "Early access pricing for indie hackers. First 100 users get Pro for $39/year, then $19/month."
};

export default function PricingPage() {


    return (
        // pricing copy: (heading: Get your first year for $39, 
        // subheading: Only for the first 100 users. Then pricing switches to monthly. )

        <div className="bg-[#0F1419] h-screen">
            {/* background Image */}
            {/* // Nav */}
            <Navbar />
            {/* // Main Pricing Section */}
            <div>
                {/* Heading and subheading text */}
                <div className="text-center text-white text-4xl font-bold mb-4">
                  Get your first year of Pro for $39
                </div>
                <p className="text-center text-gray-300 mb-3">
                    Only for the first 100 users. Then pricing switches to $19 monthly.
                </p>
                <p className="text-center text-gray-300 mb-8 text-sm italic">
                    Buy Now to secure your spot! Launching on Feb 25th.
                </p>
                {/* Cards section */}
                <div>

                </div>
            </div>
        </div>
    )


}
