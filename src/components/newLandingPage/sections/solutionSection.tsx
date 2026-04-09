function SolutionItem({
    number,
    title,
    body,
    highlight = false,
}: {
    number: string;
    title: string;
    body: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`flex flex-col md:flex-row gap-6 items-start mb-16 ${
                highlight
                    ? "border-l-2 border-[#5C3FED] pl-6 bg-[#5C3FED]/5 rounded-r-xl py-6 pr-4"
                    : ""
            }`}
        >
            <span className="font-ibm-plex-serif italic text-[80px] sm:text-[120px] leading-none text-[#5C3FED] opacity-80 w-24 flex-shrink-0">
                {number}
            </span>
            <div className="flex flex-col gap-3 pt-4">
                {highlight && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C3FED]/20 border border-[#5C3FED]/40 text-[#5C3FED] text-xs font-geist font-medium w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5C3FED]" />
                        Why it matters
                    </span>
                )}
                <h3
                    className={`font-ibm-plex-serif font-medium text-2xl sm:text-3xl ${
                        highlight ? "text-[#5C3FED]" : "text-white"
                    }`}
                >
                    {title}
                </h3>
                <p className="font-geist font-light text-[#BABABA] text-base sm:text-lg leading-relaxed">
                    {body}
                </p>
            </div>
        </div>
    )
}

export function SolutionSection() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
            <h2 className="font-geist font-medium text-3xl sm:text-4xl md:text-5xl text-white text-center mb-16">
                A Posting System Built Around Three Things
            </h2>
            <SolutionItem
                number="1"
                title="It has to sound human."
                body="Not pretty good for AI. Actually human. The kind of post someone reads and follows you for."
            />
            <SolutionItem
                number="2"
                title="It has to fit your niche."
                body="Generic content attracts no one. Every post HackrPost writes is built around your specific niche: the language, angles, and hooks your audience actually responds to. That's exactly why it sounds real."
                highlight
            />
            <SolutionItem
                number="3"
                title="It has to run without you."
                body="Great content only works if you show up every day. HackrPost schedules and publishes your posts automatically, so you stay consistent even when life gets in the way."
            />
        </div>
    )
}
