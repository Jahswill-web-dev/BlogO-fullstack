import Image from "next/image";

export function HowItWorksStep({
    number,
    title,
    description,
    imageSrc,
    imageAlt,
    reverse = false,
}: {
    number: string;
    title: string;
    description: React.ReactNode;
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
            <div className="md:w-1/2 p-4 text-center max-w-[556px]">
                <h3 className="italic font-medium font-ibm-plex-serif text-2xl">{number}</h3>
                <h3 className="text-2xl md:text-3xl font-medium font-ibm-plex-serif">{title}</h3>

                <div className="font-geist font-normal">{description}</div>
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
            <h2 className="text-3xl text-white text-center font-geist font-medium">
                Three <em className="italic font-ibm-plex-serif">Steps</em>. Then It Runs Itself.
            </h2>
            <div className="text-white flex flex-col gap-4 justify-around h-full">
                <HowItWorksStep
                    number="1"
                    title="Pick your niche"
                    description="Choose from 7 niches: X Growth, Email Marketing, SEO, Lead Generation, Reddit Marketing, Sales Outreach, or Content Marketing. HackrPost knows what works in each one."
                    imageSrc="/images/frame1.png"
                    imageAlt="Frame 1"
                />

                <HowItWorksStep
                    number="2"
                    title="We write your posts"
                    description="Every day, HackrPost generates fresh, niche specific posts written in a natural human tone. No editing required."
                    imageSrc="/images/frame2.png"
                    imageAlt="Frame 2"
                    reverse
                />

                <HowItWorksStep
                    number="3"
                    title="We publish for you"
                    description="Posts go live on your X account automatically, on your schedule. You stay visible. You stay consistent. You don't lift a finger."
                    imageSrc="/images/frame3.png"
                    imageAlt="Frame 3"
                />
            </div>
        </div>
    )
}
