import clsx from "clsx";

type GradientBorderButtonProps = {
    buttonLabel?: string;
    className?: string;        // outer wrapper
    innerClassName?: string;   // inner button
    onClick?: () => void;
    disabled?: boolean;
};

export function GradientBorderButton({
    buttonLabel = "GradientBorderButton",
    className,
    innerClassName,
    onClick,
    disabled = false,
}: GradientBorderButtonProps) {
    return (

        < div className={clsx(
            `
            bg-linear-to-r from-[#E36A3A] via-[#B44BD6] to-[#5C3FED]
            p-0.5
            rounded-[4px]
            max-w-[181px]
            shadow-[5px_5px_7.4px_0px_#1E103538]
            `, className, disabled && "opacity-60")} >
            {/* Inner Button */}
            < div
                onClick={!disabled ? onClick : undefined}
                className={clsx("bg-[#0F1419] text-white text-center px-4 py-2 font-medium hover:bg-[#151B22] transition rounded-[2px]", innerClassName, disabled ? "cursor-not-allowed" : "hover:cursor-pointer")} >
                {buttonLabel || "GradientBorderButton"}
            </div >

        </div >
    )
}