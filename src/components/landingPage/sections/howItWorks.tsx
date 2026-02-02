import Image from "next/image";

export function HowItWorksStep({
    title,
    description,
    imageSrc,
    imageAlt,
    reverse = false,
}: {
    title: string;
    description: string;
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
            <div className="md:w-1/2 p-4 text-center">
                <h3 className="text-xl font-bold">{title}</h3>
                <p>{description}</p>
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


export function HowItWorks() {
    return (
        <div className="h-full">
            <h2 className="text-3xl text-white text-center">How It Works</h2>
            <div className="text-white flex flex-col gap-4 justify-around h-full">
                <HowItWorksStep
                    title="Tell us about your SaaS"
                    description="Answer a few simple questions so we understand what you’re building, who it’s for, and the problem it solves."
                    imageSrc="/images/frame1.png"
                    imageAlt="Frame 1"
                />

                <HowItWorksStep
                    title="We generate targeted X content"
                    description="We create weeks of posts designed to attract your target users, all written in a natural, indie-hacker tone — not generic AI tweets."
                    imageSrc="/images/frame2.png"
                    imageAlt="Frame 2"
                />

                <HowItWorksStep
                    title="We publish it for you"
                    description="We schedule and publish your content for you, so you can focus on building your SaaS."
                    imageSrc="/images/frame3.png"
                    imageAlt="Frame 3"
                />
            </div>
        </div>
    )
}