import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | HackrPost",
  description: "Privacy Policy for HackrPost.",
};

const sections = [
  {
    title: "Information We Collect",
    paragraphs: ["We collect the following information when you use HackrPost:"],
    items: [
      "Email address and password (hashed, never stored in plain text)",
      "Billing information, processed securely through our payment provider",
      "Your selected niche and posting preferences",
      "Posts generated and published through our system",
      "Basic usage data such as pages visited, IP address, browser type, and timestamps",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: ["We use your information only to operate and improve the service:"],
    items: [
      "To create and manage your account",
      "To generate and publish niche-specific posts to your X account",
      "To process payments and manage your subscription",
      "To send transactional emails (receipts, password resets, service updates)",
      "To monitor performance and fix bugs",
      "We do not sell, rent, or share your personal data with advertisers or third parties for marketing purposes.",
    ],
  },
  {
    title: "X (Twitter) Integration",
    paragraphs: [
      "HackrPost connects to your X account via OAuth to publish posts on your behalf. We request only the permissions needed to post on your behalf. We do not access your direct messages, follower lists, or private data. You can revoke our access at any time from your X account settings under \"Connected Apps.\"",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "We use a small number of trusted third-party services to operate HackrPost, including a payment processor, email provider, hosting infrastructure, and AI content generation providers. Each receives only the data necessary for their specific function.",
    ],
  },
  {
    title: "Data Retention",
    paragraphs: [
      "We retain your data for as long as your account is active. When you delete your account, your personal data is deleted within 30 days, except where retention is required by law. Billing records are kept for the legally required period (typically 7 years).",
    ],
  },
  {
    title: "Your Rights",
    paragraphs: [
      "You have the right to access, correct, delete, or export your personal data at any time. To make a request, contact us at the email below. We will respond within 30 days.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use HTTPS encryption for all data in transit, hash passwords using industry-standard algorithms, and restrict access to production systems to authorized team members only. No method of storage or transmission is 100% secure, but we take reasonable measures to protect your data.",
    ],
  },
  {
    title: "Cookies",
    paragraphs: [
      "We use only essential cookies required to keep you logged in and remember your preferences. We do not use advertising or tracking cookies.",
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "HackrPost is not intended for users under the age of 13. We do not knowingly collect data from children. If you believe we have done so, please contact us and we will delete it promptly.",
    ],
  },
  {
    title: "Changes to This Policy",
    paragraphs: [
      "We may update this policy from time to time. We will notify you of material changes by email and update the date at the top of this page. Continued use of the service after changes are posted constitutes acceptance of the revised policy.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Your data, handled with care."
      lastUpdated="April 14, 2026"
      intro={[
        "HackrPost (\"we\", \"us\", or \"our\") operates the HackrPost platform at hackrpost.com.",
        "This Privacy Policy explains how we collect, use, and protect your information when you use our service. By using HackrPost, you agree to the practices described here.",
      ]}
      sections={[...sections]}
    />
  );
}
