import clsx from "clsx";

type GradientButtonProps = {
    buttonLabel?: string;
    className?: string;
};

export function GradientButton({
    buttonLabel = "GradientButton",
    className,
}: GradientButtonProps) {
    return (
        <button
            className={clsx(
                `
        bg-[linear-gradient(109.69deg,#E36A3A_11.2%,#B44BD6_49.66%,#5C3FED_88.12%)]
        text-white
        px-4 py-2 font-medium rounded-[4px]
        shadow-[5px_5px_7.4px_0px_#1E103538]
        transition
        hover:opacity-90
        active:scale-[0.98]
        hover:shadow-[7px_7px_10px_0px_#1E103560]
        `,
                className
            )}
        >
            {buttonLabel}
        </button>
    );
}
