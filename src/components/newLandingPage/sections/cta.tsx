import { GradientButton } from "@/components/ui/buttons/gradientButton";
import Image from "next/image";
import Link from "next/link";

export function CTASection() {

    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="text-center flex flex-col gap-3">
                <h2 className="text-2xl sm:text-3xl md:text-5xl text-white max-w-[603px] mx-auto
                font-geist font-medium">
                    The Easiest Way to Become <i className="italic font-ibm-plex-serif">Consistent</i> on X
                </h2>
                <p className="text-[#F9FAFB] text-sm sm:text-lg max-w-[563px] mx-auto font-geist font-light">
                    Stay in your niche. Sound like yourself. Show up every day.
                </p>
                <p className="text-[#F7F9FCCC] text-sm sm:text-base max-w-[480px] mx-auto font-geist font-light">
                    HackrPost handles the writing, the scheduling, and the publishing, so you can focus on everything else.
                </p>
                <div>
                    <Link href="/pricing">
                        <GradientButton
                            className="w-[275px] h-[55px] mx-auto font-bold text-[16px] cursor-pointer"
                            buttonLabel="Start generating posts"
                        />
                    </Link>
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
