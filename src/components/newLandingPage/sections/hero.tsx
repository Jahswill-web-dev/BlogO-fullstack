import { GradientButton } from "@/components/ui/buttons/gradientButton";
import Pill from "@/components/ui/pill";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-8 h-full">
            <div className="font-ibm-plex-serif font-medium flex gap-3 justify-center flex-wrap">
                <Pill text="Not a generator. A posting system." />
            </div>
            <div className="mt-10 flex flex-col gap-10 items-center h-full">
                {/* Text and button */}
                <div className="text-white flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <h1 className="text-[28px] sm:text-4xl md:text-5xl font-ibm-plex-serif font-normal max-w-3xl">
                            Stay <em className="italic">Consistent</em> on X Without Writing Every Day
                        </h1>

                        <p className="mt-5 text-lg sm:text-xl font-geist font-light text-[#F9FAFB] max-w-[600px]">
                            Generate niche specific posts that sound human and schedule them instantly. No blank pages. No AI slop. No falling off.
                        </p>
                    </div>
                    {/* Gradient Button */}
                    <Link href="/pricing">
                        <GradientButton buttonLabel="Start generating posts" />
                    </Link>
                </div>
                {/* Image */}
                <div>
                    <Image
                        alt="Hero image"
                        src="/images/hero_frame.png"
                        width={400}
                        height={300}
                        className="mb-auto w-[500px] h-[300px]"
                    />
                </div>
            </div>
        </div>
    )
}
