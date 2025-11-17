"use client";

import React, { useState } from "react";
import { RocketIcon, SparklesIcon, XIcon, ArrowRightIcon } from "lucide-react";
import { SocialMediaModal } from "@/components/modules/SocialMediaModal";
import { useRouter } from "next/navigation";

export default function StartupInfoPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    productDescription: "",
    targetAudience: [] as string[],
    mainProblems: "",
    keyBenefits: "",
  });

  const [audienceInput, setAudienceInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAudienceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(" ") && value.trim()) {
      const newTag = value.trim();
      if (newTag && !formData.targetAudience.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          targetAudience: [...prev.targetAudience, newTag],
        }));
      }
      setAudienceInput("");
    } else {
      setAudienceInput(value);
    }
  };

  const handleAudienceKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && audienceInput.trim()) {
      e.preventDefault();
      const newTag = audienceInput.trim();
      if (newTag && !formData.targetAudience.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          targetAudience: [...prev.targetAudience, newTag],
        }));
      }
      setAudienceInput("");
    } else if (
      e.key === "Backspace" &&
      !audienceInput &&
      formData.targetAudience.length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        targetAudience: prev.targetAudience.slice(0, -1),
      }));
    }
  };

  const removeAudienceTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(
        (tag) => tag !== tagToRemove
      ),
    }));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handlePlatformSelect = (platform: string) => {
    console.log("Selected platform:", platform);
    console.log("Form data:", formData);
    setIsModalOpen(false);

    router.push("/posts");
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <RocketIcon className="w-5 h-5 text-gray-900" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Tell us about your startup
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Share your vision and we'll help create your content
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* NAME */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border-b border-gray-200 
              focus:border-gray-900 transition-colors outline-none text-sm"
              placeholder="Enter your startup name"
            />
          </div>

          {/* INDUSTRY */}
          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border-b border-gray-200 
              focus:border-gray-900 transition-colors outline-none text-sm bg-white"
            >
              <option value="">Select an industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="ecommerce">E-commerce</option>
              <option value="saas">SaaS</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* PRODUCT DESCRIPTION */}
          <div>
            <label
              htmlFor="productDescription"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Product Description
            </label>
            <textarea
              id="productDescription"
              name="productDescription"
              value={formData.productDescription}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border-b border-gray-200 
              focus:border-gray-900 transition-colors outline-none resize-none text-sm"
              placeholder="Describe what your product does"
            />
          </div>

          {/* TARGET AUDIENCE */}
          <div>
            <label
              htmlFor="targetAudience"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Target Audience
            </label>

            <div className="w-full px-3 py-2 border-b border-gray-200 focus-within:border-gray-900 
            transition-colors min-h-10 flex flex-wrap items-center gap-2">
              {formData.targetAudience.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeAudienceTag(tag)}
                    className="hover:bg-gray-200 rounded p-0.5 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                id="targetAudience"
                value={audienceInput}
                onChange={handleAudienceInput}
                onKeyDown={handleAudienceKeyDown}
                className="flex-1 min-w-[120px] outline-none text-sm"
                placeholder={
                  formData.targetAudience.length === 0
                    ? "Type and press space to add"
                    : ""
                }
              />
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Press space or enter to add each audience type
            </p>
          </div>

          {/* MAIN PROBLEMS */}
          <div>
            <label
              htmlFor="mainProblems"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Main Problems Solved
            </label>
            <textarea
              id="mainProblems"
              name="mainProblems"
              value={formData.mainProblems}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border-b border-gray-200 
              focus:border-gray-900 transition-colors outline-none resize-none text-sm"
              placeholder="What problems does your product solve?"
            />
          </div>

          {/* KEY BENEFITS */}
          <div>
            <label
              htmlFor="keyBenefits"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Key Benefits & Features
            </label>
            <textarea
              id="keyBenefits"
              name="keyBenefits"
              value={formData.keyBenefits}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border-b border-gray-200 
              focus:border-gray-900 transition-colors outline-none resize-none text-sm"
              placeholder="What are the key benefits or features?"
            />
          </div>

          {/* BUTTON */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2.5 px-4 rounded 
              text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Generate Content</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <SocialMediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handlePlatformSelect}
      />
    </div>
  );
}
