import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <div className="w-full">
            <div>
                <div className="flex flex-row justify-between">
                    {/* texts.. */}
                    <div className="flex flex-col gap-2">
                        <p>No trend-chasing. </p>
                        <p>No empty engagement. </p>
                        <p>No generic AI tweets. </p>
                    </div>
                    {/* Nav Links */}
                    <div className="flex flex-col gap-2">
                        <Link href="#about">About</Link>
                        <Link href="#features">Features</Link>
                        <Link href="/pricing">Pricing</Link>
                    </div>

                </div>
                {/* Logo */}
                <div>
                    <Image src="/public/large_logo.svg" alt="Logo" width={100} height={100} />
                </div>
            </div>


        </div>
    )
}