export interface Niche {
  name: string;
  focusAreas: string[];
}

export const FIXED_NICHES: Niche[] = [
  {
    name: "Content Marketing",
    focusAreas: [
      "Blog Writing",
      "Educational Content",
      "Storytelling & Personal Branding",
      "Content Repurposing",
      "Content Strategy & Planning",
      "Long-form Authority Content",
      "Content Distribution",
    ],
  },
  {
    name: "SEO",
    focusAreas: [
      "Keyword Research",
      "Search Intent Optimization",
      "On-Page SEO",
      "Content Optimization & Refreshing",
      "Programmatic SEO",
      "Link Building Strategies",
      "Technical SEO",
    ],
  },
  {
    name: "X / Twitter Growth",
    focusAreas: [
      "Tweet Writing (Hooks, formats)",
      "Thread Creation",
      "Audience Building Strategy",
      "Engagement & Virality Tactics",
      "Personal Brand Positioning",
      "Content Systems & Consistency",
      "Monetization via Twitter",
    ],
  },
  {
    name: "Reddit Marketing",
    focusAreas: [
      "Finding Target Subreddits",
      "Post Writing (Non-spam, native style)",
      "Comment Marketing Strategy",
      "Karma Building & Account Warmup",
      "Promotion Without Getting Banned",
      "Competitor & Audience Research",
      "Viral Post Frameworks",
    ],
  },
  {
    name: "Email Marketing",
    focusAreas: [
      "Newsletter Writing",
      "Email Sequences (Welcome, nurture)",
      "Sales Emails",
      "Subject Lines & Open Rate Optimization",
      "Email Personalization & Segmentation",
      "Retention & Re-engagement Emails",
      "Deliverability & Performance",
    ],
  },
  {
    name: "Lead Generation",
    focusAreas: [
      "Landing Pages",
      "Lead Magnets",
      "Funnel Design",
      "Conversion Copywriting",
      "Offer Creation & Positioning",
      "CRO (Conversion Rate Optimization)",
      "Form & CTA Optimization",
    ],
  },
  {
    name: "Sales / Outreach",
    focusAreas: [
      "Cold Email Outreach",
      "LinkedIn Outreach",
      "Follow-Up Sequences",
      "Offer Positioning",
      "Objection Handling",
      "Sales Messaging & Scripts",
      "Closing & Conversion Tactics",
    ],
  },
];
