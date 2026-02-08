import { GradientButton } from "@/components/ui/buttons/gradientButton";
import Image from "next/image";

export function CTASection() {

    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="text-center flex flex-col gap-3">
                <h2 className="text-2xl sm:text-3xl md:text-5xl text-white max-w-[603px] mx-auto
                font-geist font-medium">
                    Start <i className="italic font-ibm-plex-serif">attracting</i> users today! Not empty engagement.
                </h2>
                <p className="text-[#F7F9FC] text-sm sm:text-xl max-w-[563px] mx-auto font-geist font-light">
                    Stop posting to everyone. Start posting to people who care.
                </p>
                <div>
                    <GradientButton
                        className="w-[275px] h-[55px] mx-auto font-bold text-[16px] cursor-pointer"
                        buttonLabel="Start attracting users today!"
                    />
                    <p className="text-[#F7F9FCCC] text-sm mt-2">
                        Built for founders who want users.
                    </p>
                </div>

            </div>
            {/* Image */}
            <div className="mt-auto px-3">
                <Image
                    src="/images/dashboard_preview.png"
                    alt="Dashboard Preview"
                    width={1200}
                    height={600}
                    className="mx-auto w-2xl h-auto"
                />
            </div>
        </div>
    )
}