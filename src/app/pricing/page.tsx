import Navbar from "@/components/modules/navbar";
import { PricingPageContent } from "./PricingPageContent";

export const metadata = {
    title: "Pricing - Start Your 7-day Free Trial",
    description: "No credit card required. Choose the plan that fits your posting goals."
};

export default function PricingPage() {
    return (
        <div className="bg-[#0F1419] h-full">
            <Navbar />
            <div className="pt-10">
                {/* Heading and subheading text */}
                <div className="text-center text-white text-4xl font-bold mb-2">
                    Start Your 7-day Free Trial
                </div>
                <p className="text-center text-gray-300 mb-6">
                    No credit card required
                </p>
                {/* First 50 users scarcity banner */}
                <div className="flex justify-center mb-2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E36A3A]/15 border border-[#E36A3A]/50 text-[#E36A3A] font-geist text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#E36A3A] animate-pulse flex-shrink-0" />
                        Discounted pricing for the first 50 users only
                    </span>
                </div>
                {/* Cards section */}
                <PricingPageContent />
            </div>
        </div>
    );
}
