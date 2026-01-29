import Navbar from "@/components/modules/navbar";
import { PricingCard } from "@/components/ui/pricingCard";


export const metadata = {
    title: "Pricing - Get Pro for $39 in Your First Year",
    description: "Early access pricing for indie hackers. First 100 users get Pro for $39/year, then $19/month."
};

export default function PricingPage() {


    return (
        // pricing copy: (heading: Get your first year for $39, 
        // subheading: Only for the first 100 users. Then pricing switches to monthly. )

        <div className="bg-[#0F1419] h-full">
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
                <div className="flex flex-wrap justify-center gap-6 p-10">
                    {/* Basic plain */}
                    <PricingCard
                        title="Basic Plan"
                        currentPrice="$9/month"
                        features={[
                            "3 posts per day",
                            "Schedule 1 week ahead",
                        ]}
                    />
                    {/* pro plan */}
                    <PricingCard
                        // badgeText="100 slots left"
                        title="Pro Plan"
                        originalPrice="$19/month"
                        currentPrice="$39/year"
                        priceNote="First 100 users only"
                        features={["7 posts per day",
                            "Priority support",
                            "Long form content (280+ characters)",
                            "Schedule 2 weeks ahead"
                        ]}
                        ctaLabel="Get Pro for $39"
                        highlighted={true} />
                    {/* Hacker Plan */}
                    <PricingCard
                        // badgeText="no credit card required"
                        title="Hacker Plan"
                        // originalPrice="$199/year"
                        currentPrice="$39/month"
                        features={["20 posts per day",
                            // "Advanced analytics",
                            "Priority support",
                            "Long form content (280+ characters)",
                            "Schedule 4 weeks ahead",
                        ]}
                        ctaLabel="Get Hacker for $39" />

                </div>
            </div>
        </div>
    )


}
