

export default function Pill({ text }: { text: string }) {
    return (
        <span className="inline-flex items-center px-4 py-2 rounded-full border border-[#88888AD9]  bg-[#BABABA2E]
        backdrop-blur-md text-xs md:text-sm font-medium text-[#F9FAFB] 
   
   ">
            {text}
        </span>
    );
}
