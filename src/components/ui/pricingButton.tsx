import clsx from "clsx";

type SolidButtonProps = {
  label?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function SolidButton({
  label = "Select Plan",
  className,
  onClick,
  disabled = false,
}: SolidButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "bg-[#1F2933] text-white text-center px-5 py-2 font-medium rounded-md hover:cursor-pointer",
        "shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
        "hover:bg-[#263241] hover:shadow-[0_6px_16px_rgba(0,0,0,0.35)]",
        "transition-all duration-200",
        disabled && "opacity-60 cursor-not-allowed hover:bg-[#1F2933] hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {label}
    </button>
  );
}
