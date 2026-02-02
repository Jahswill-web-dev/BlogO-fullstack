import { GradientButton } from "@/components/ui/buttons/gradientButton";
import Pill from "@/components/ui/pill";
import Image from "next/image";

export function Hero() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-8 h-full">
            <div className="flex gap-3 justify-center flex-wrap">
                <Pill text="No trend-chasing." />
                <Pill text="No generic AI tweets" />
                <Pill text="No empty engagement" />
            </div>
            <div className="mt-10 flex flex-col gap-10 items-center h-full">
                {/* Text and button */}
                <div className="text-white flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <div className="text-3xl sm:text-4xl md:text-5xl flex items-center justify-center">
                            <h1><i>Attract</i> Saas Users On</h1>
                            <Image alt="X icon" src="/xicon.svg" width={100} height={100} className="w-[70px] h-[70px] md:w-[100px] md:h-[100px]"/>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl">Without Writing a Single Tweet</h1>
                        <p className="text-[#F9FAFB] mt-5 font-semibold text-lg sm:text-xl">
                            HackrPost is for indie SaaS founders who want users  without spending hours on content
                        </p>
                    </div>

                    <GradientButton buttonLabel="Get Early Access" />
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
