import clsx from "clsx";
import { GradientBorderButton } from "./gradientBorderButton";
import { SolidButton } from "./pricingButton";

type PricingCardProps = {
    badgeText?: string;
    title: string;
    originalPrice?: string;
    currentPrice: string;
    priceNote?: string;
    features: string[];
    ctaLabel?: string;
    highlighted?: boolean;
};

export function PricingCard({
    badgeText = "No credit card required",
    title,
    originalPrice,
    currentPrice,
    priceNote,
    features,
    ctaLabel = "Select Plan",
    highlighted = false,
}: PricingCardProps) {
    return (
        <div
            className={clsx(
                "bg-[#0F1419] border border-[#1F2933] rounded-xl p-6 flex flex-col min-w-[300px] max-w-[300px] mx-auto md:mx-0",
                "h-[403px] ",
                highlighted
                    ? "bg-[linear-gradient(90deg,#5C3FED_0%,#5C3FED_35%,#B44BD6_65%,#E36A3A_100%)] text-white border border-[#1F2933]"
                    : "bg-linear-to-b from-[#171819] to-[#212224] text-green",
            )}
        >
            {/* Badge */}

            {/* <div className="mb-4">
                <span className="inline-block text-xs text-gray-300 bg-white/5 px-3 py-1 rounded-full">
                    {badgeText}
                </span>
            </div> */}

            {/* Title */}
            <h3 className="text-white text-2xl font-semibold mb-2">
                {title}
            </h3>

            {/* Pricing */}
            <div className="flex flex-col items-baseline gap-2 mb-4">
                <div className="flex">
                    {originalPrice && (
                        <span className="text-gray-200 line-through text-sm font-bold">
                            {originalPrice}
                        </span>
                    )}
                    <span className="text-white text-2xl font-bold">
                        {currentPrice}
                    </span>
                </div>

                {priceNote && (
                    <div className="text-gray-50 text-[14px] mb-2">
                        {priceNote}
                    </div>
                )}
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-3 mb-6">
                {features.map((feature, idx) => (
                    <li key={idx} className={clsx("text-gray-300 text-sm flex items-start gap-2",
                        highlighted && "text-white",
                        )}>
                        <span className="text-green-400 mt-1">✓</span>
                        {feature}
                    </li>
                ))}
            </ul>

            {/* CTA */}
            {highlighted ? (
                <GradientBorderButton
                    buttonLabel={ctaLabel}
                    className="w-full mx-auto"
                    innerClassName="w-full"
                />
            ) : (
                <SolidButton
                    label={ctaLabel || "Select Plan"}
                    className="w-full mx-auto max-w-[181px]"
                />
            )}
        </div>
    );
}
