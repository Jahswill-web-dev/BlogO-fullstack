import { Geist, IBM_Plex_Serif, Kumbh_Sans } from "next/font/google";

export const geist = Geist({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-geist",
});

export const ibmPlexSerif = IBM_Plex_Serif({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-ibm-plex-serif",
});


export const kumbhSans = Kumbh_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-kumbh-sans",
});
