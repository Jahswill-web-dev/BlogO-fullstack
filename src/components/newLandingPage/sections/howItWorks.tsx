import Image from "next/image";

export function HowItWorksStep({
    number,
    title,
    lead,
    detail,
    imageSrc,
    imageAlt,
    reverse = false,
}: {
    number: string;
    title: string;
    lead: string;
    detail: string;
    imageSrc: string;
    imageAlt: string;
    reverse?: boolean;
}) {
    return (
        <div
            className={`flex flex-col-reverse md:flex-row items-center gap-8 ${
                reverse ? "md:flex-row-reverse" : ""
            }`}
        >
            {/* Text */}
            <div className="md:w-1/2 p-4 text-left max-w-[556px]">
                {/* Step badge + title row */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#5C3FED] text-white font-geist font-bold text-sm flex-shrink-0">
                        {number}
                    </span>
                    <h3 className="font-ibm-plex-serif font-semibold text-2xl sm:text-3xl text-white">
                        {title}
                    </h3>
                </div>

                {/* Lead line */}
                <p className="font-geist font-semibold text-white/90 text-base sm:text-lg mb-2">
                    {lead}
                </p>

                {/* Supporting detail */}
                <p className="font-geist font-light text-[#BABABA] text-sm sm:text-base leading-relaxed">
                    {detail}
                </p>
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
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl text-white text-center font-geist font-bold">
                3 steps. 30 seconds. 30 posts.
            </h2>

            {/* "Sounds human" badge */}
            <div className="flex justify-center mt-4 mb-14">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C3FED]/15 border border-[#5C3FED]/40 text-[#BABABA] font-geist text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#5C3FED] flex-shrink-0" />
                    And yes, it sounds human
                </span>
            </div>

            <div className="text-white flex flex-col gap-4 justify-around h-full">
                <HowItWorksStep
                    number="1"
                    title="Pick your niche"
                    lead="7 niches to choose from."
                    detail="X Growth, Email Marketing, SEO, Lead Generation, Reddit Marketing, Sales Outreach, or Content Marketing. HackrPost knows what works in each one."
                    imageSrc="/images/frame1.png"
                    imageAlt="Frame 1"
                />

                <HowItWorksStep
                    number="2"
                    title="We write your posts"
                    lead="Fresh posts, every day."
                    detail="HackrPost generates niche-specific content written in a natural human tone — no editing, no rewriting, no second-guessing."
                    imageSrc="/images/frame2.png"
                    imageAlt="Frame 2"
                    reverse
                />

                <HowItWorksStep
                    number="3"
                    title="We publish for you"
                    lead="Fully automatic publishing."
                    detail="Posts go live on your X account on your schedule. You stay visible, stay consistent, and don't lift a finger."
                    imageSrc="/images/frame3.png"
                    imageAlt="Frame 3"
                />
            </div>
        </div>
    )
}
