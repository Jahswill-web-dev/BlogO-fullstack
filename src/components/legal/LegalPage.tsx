import Link from "next/link";
import Navbar from "@/components/modules/navbar";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#0F1419]">
      <div className="bg-linear-to-b from-[#5C3FED] to-[#10060A]">
        <Navbar mobileClassName="bg-[#5C3FED]" />
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="font-geist text-sm font-semibold uppercase tracking-[0.2em] text-[#F9F9F9]/80">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-ibm-plex-serif text-4xl text-[#F9F9F9] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 font-geist text-sm text-[#F9F9F9]/80">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="bg-[#F9F9F9] bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-size-[40px_40px]">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <div className="rounded-[14px] border border-[#1F2933]/10 bg-[linear-gradient(180.54deg,#E4DFFF_0.47%,#F9F9F9_99.54%)] p-8 shadow-[5px_5px_7.4px_0px_#1E103538] sm:p-10">
            <div className="space-y-4 font-geist text-base leading-8 text-[#10060A]">
              {intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 space-y-8">
              {sections.map((section, index) => (
                <section
                  key={section.title}
                  className="rounded-[10px] border border-[#1F2933]/10 bg-[#F9F9F9]/80 p-6"
                >
                  <h2 className="bg-linear-to-r from-[#10060A] to-[#5C3FED] bg-clip-text font-geist text-2xl font-semibold text-transparent">
                    {index + 1}. {section.title}
                  </h2>

                  {section.paragraphs && (
                    <div className="mt-4 space-y-4 font-geist text-base leading-8 text-[#10060A]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {section.items && (
                    <ul className="mt-4 space-y-3 pl-5 font-geist text-base leading-8 text-[#10060A] list-disc">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#060507]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 font-geist text-sm text-[#F9F9F9]/80 sm:flex-row sm:items-center sm:justify-between">
          <p>HackrPost legal information.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="transition-opacity hover:opacity-80">
              Home
            </Link>
            <Link href="/privacy" className="transition-opacity hover:opacity-80">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-opacity hover:opacity-80">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
