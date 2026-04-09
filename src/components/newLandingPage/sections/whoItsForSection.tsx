import Image from "next/image";

export default function WhoItsForSection() {
    return (
        <div className="h-full flex flex-col justify-around py-10">
            {/* Who its for section */}
            <div className="flex items-center mb-5">
                {/* text */}
                <div className="md:w-1/2">
                    <h2 className="bg-linear-to-r from-[#10060A] to-[#5C3FED] bg-clip-text text-transparent
                    text-2xl sm:text-4xl mb-4 font-medium font-geist">
                        This <i className="italic font-ibm-plex-serif">is</i> for you if:
                    </h2>
                    <ul className="flex flex-col gap-2 text-xl sm:text-2xl ml-5 list-disc pl-6 space-y-2">
                        <li>You want to grow on X but don't want to write every day</li>
                        <li>You've tried AI tools and hated how the output sounded</li>
                        <li>You're focused on a niche and want to become the go-to voice in it</li>
                        <li>You want consistency without it taking over your schedule</li>
                    </ul>
                </div>
                {/* Image */}
                <div className="w-1/2 md:block hidden">
                    <Image
                        src="/check.svg"
                        width={600}
                        height={600}
                        className="w-[408] h-[408] ml-auto"
                        alt="Who Its For Image"
                    />
                </div>
            </div>
            {/* Who its not for section */}
            <div className="flex items-center">
                {/* text */}
                <div className="md:w-1/2">
                    <h2 className="
                    bg-linear-to-r from-[#10060A] to-[#5C3FED] bg-clip-text text-transparent
                    text-2xl sm:text-4xl mb-4 font-medium font-geist">
                        This <i className="italic font-ibm-plex-serif">is not</i> for you if:
                    </h2>
                    <ul className="flex flex-col gap-2 text-xl sm:text-2xl ml-5 list-disc pl-6 space-y-2">
                        <li>You enjoy writing every post manually</li>
                        <li>You're fine with content that sounds like AI wrote it</li>
                        <li>You're chasing viral threads with no long-term strategy</li>
                    </ul>
                </div>
                {/* Image */}
                <div className="w-1/2 hidden md:block">
                    <Image
                        src="/x.svg"
                        width={600}
                        height={600}
                        className="w-[408] h-[408] ml-auto"
                        alt="Who Its For Image"
                    />
                </div>
            </div>
        </div>
    )
}
