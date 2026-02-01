import Image from "next/image";

export default function WhoItsForSection() {
    return (
        <div className="h-full flex flex-col justify-around">
            {/* Who its for section */}
            <div className="flex items-center">
                {/* text */}
                <div className="w-1/2">
                    <h2 className="text-4xl">This is for you if:</h2>
                    <ul className="ml-5 list-disc list-inside space-y-2 text-[29px]">
                        <li>You want users without spending hours on content</li>
                        <li>You care more about attracting users than farming engagement</li>
                        <li>You want consistent visibility without thinking about X every day</li>
                    </ul>
                </div>
                {/* Image */}
                <div className="w-1/2">
                    <Image
                        src="/check.svg"
                        width={600}
                        height={600}
                        className="w-[408] h-[408] ml-auto"
                        alt="Who Its For Image"
                    />
                </div>
                <div>

                </div>
            </div>
            {/* Who its not for section */}
            <div className="flex flex-row-reverse items-center">
                {/* text */}
                <div className="w-1/2">
                    <h2 className="text-4xl">This is for you if:</h2>
                    <ul className="ml-5 list-disc list-inside space-y-2 text-[29px]">
                        <li>You want users without spending hours on content</li>
                        <li>You care more about attracting users than farming engagement</li>
                        <li>You want consistent visibility without thinking about X every day</li>
                    </ul>
                </div>
                {/* Image */}
                <div className="w-1/2">
                    <Image
                        src="/x.svg"
                        width={600}
                        height={600}
                        className="w-[408] h-[408] mr-auto"
                        alt="Who Its For Image"
                    />
                </div>
            </div>
        </div>
    )
}