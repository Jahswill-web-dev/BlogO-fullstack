export function ValueTable() {
    const rows = [
        {
            feature: "Human sounding output",
            benefit: "You won't look fake or damage your brand",
        },
        {
            feature: "Niche specific content",
            benefit: "It actually fits your audience",
        },
        {
            feature: "Auto scheduling",
            benefit: "You never have to think about posting again",
        },
    ]

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 sm:py-28">
            <table className="w-full border-collapse font-geist">
                <thead>
                    <tr>
                        <th className="font-bold text-[#10060A] text-lg border-b-2 border-[#1F2933] pb-3 text-left pr-8">
                            What HackrPost does
                        </th>
                        <th className="font-bold text-[#10060A] text-lg border-b-2 border-[#1F2933] pb-3 text-left">
                            What that means for you
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className={index % 2 === 1 ? "bg-[#5C3FED]/5" : ""}>
                            <td className="py-5 pr-8 text-[#10060A] font-medium text-base sm:text-lg border-b border-[#1F2933]/20">
                                {row.feature}
                            </td>
                            <td className="py-5 text-[#5A5A5A] text-base sm:text-lg border-b border-[#1F2933]/20">
                                {row.benefit}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
