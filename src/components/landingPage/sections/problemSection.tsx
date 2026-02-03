import Image from "next/image";
import React from "react";

export function ProblemSection({
    title,
    listItems,
    imageSrc,
    imageAlt,
    reverse = false,
}: {
    title: React.ReactNode;
    listItems: string[];
    imageSrc: string;
    imageAlt: string;
    reverse?: boolean;
}) {
    return (
        <div
            className={`flex flex-col-reverse md:flex-row items-center ${reverse ? "md:flex-row-reverse" : ""
                }`}
        >
            {/* Text */}
            <div className="font-geist font-medium md:w-1/2 p-4 text-[#5A5A5A]">
                <h3 className="text-xl font-bold mb-4 bg-linear-to-r from-[#10060A] to-[#5C3FED] bg-clip-text text-transparent">
                    {title}
                </h3>

                <ul className="ml-5 list-disc pl-6  space-y-2">
                    {listItems.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>

            {/* Image */}
            <div className="md:w-1/2 p-4">
                <Image
                    alt={imageAlt}
                    src={imageSrc}
                    width={400}
                    height={300}
                />
            </div>
        </div>
    );
}


export function ProblemSectionWrapper() {
    return (
        <div className="h-full">
            <div className="text-white flex flex-col gap-4 justify-around h-full">
                <ProblemSection
                    title={
                        <>
                            Your Product Is <span className="italic font-ibm-plex-serif font-normal">
                                Unnoticed
                            </span> Because:
                        </>
                    }
                    listItems={[
                        "You don't know what to say",
                        "Writing tweets steals time from building",
                        "You post inconsistently, then disappear",
                        "When you do post, it doesn’t bring users",
                    ]}
                    imageSrc="/tweets.svg"
                    imageAlt="Frame 1"
                />

                <ProblemSection
                    title={
                        <>
                            Use A <span className="italic font-ibm-plex-serif font-normal">
                                Founder-First System
                            </span> That:
                        </>

                    }
                    listItems={[
                        "Understands your SaaS",
                        "Writes posts your target users care about",
                        "Schedules them directly to X",
                    ]}
                    imageSrc="/tweets2.svg"
                    imageAlt="Frame 2"
                    reverse
                />


            </div>
        </div>
    )
}