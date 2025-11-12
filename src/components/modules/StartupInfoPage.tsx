import React, { useState } from 'react'
import { RocketIcon, SparklesIcon, XIcon } from 'lucide-react'
import { SocialMediaModal } from './SocialMediaModal'
export function StartupInfoPage() {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    productDescription: '',
    targetAudience: [] as string[],
    mainProblems: '',
    keyBenefits: '',
  })
  const [audienceInput, setAudienceInput] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleAudienceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Check if space was pressed and there's text before it
    if (value.endsWith(' ') && value.trim()) {
      const newTag = value.trim()
      if (newTag && !formData.targetAudience.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          targetAudience: [...prev.targetAudience, newTag],
        }))
      }
      setAudienceInput('')
    } else {
      setAudienceInput(value)
    }
  }
  const handleAudienceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && audienceInput.trim()) {
      e.preventDefault()
      const newTag = audienceInput.trim()
      if (newTag && !formData.targetAudience.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          targetAudience: [...prev.targetAudience, newTag],
        }))
      }
      setAudienceInput('')
    } else if (
      e.key === 'Backspace' &&
      !audienceInput &&
      formData.targetAudience.length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        targetAudience: prev.targetAudience.slice(0, -1),
      }))
    }
  }
  const removeAudienceTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((tag) => tag !== tagToRemove),
    }))
  }
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }
  const handlePlatformSelect = (platform: string) => {
    console.log('Selected platform:', platform)
    console.log('Form data:', formData)
    setIsModalOpen(false)
    // Add your generation logic here with the selected platform
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <RocketIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Tell Us About Your Startup
          </h1>
          <p className="text-lg text-gray-600">
            Share your vision and we'll help bring it to life
          </p>
        </div>
        {/* Form */}
        <form
          onSubmit={handleGenerate}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your startup name"
            />
          </div>
          {/* Industry */}
          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Select Industry *
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          {/* Product Description */}
          <div>
            <label
              htmlFor="productDescription"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Product Description *
            </label>
            <textarea
              id="productDescription"
              name="productDescription"
              value={formData.productDescription}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe what your product does"
            />
          </div>
          {/* Target Audience */}
          <div>
            <label
              htmlFor="targetAudience"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Target Audience *
            </label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all min-h-12 flex flex-wrap items-center gap-2">
              {formData.targetAudience.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeAudienceTag(tag)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
                className="flex-1 min-w-[120px] outline-none"
                placeholder={
                  formData.targetAudience.length === 0
                    ? 'Type and press space to add (e.g., founders, investors)'
                    : ''
                }
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Press space or enter to add each audience type
            </p>
          </div>
          {/* Main Problems Solved */}
          <div>
            <label
              htmlFor="mainProblems"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Main Problem(s) Solved *
            </label>
            <textarea
              id="mainProblems"
              name="mainProblems"
              value={formData.mainProblems}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="What problems does your product solve?"
            />
          </div>
          {/* Key Benefits / Features */}
          <div>
            <label
              htmlFor="keyBenefits"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Key Benefits / Features *
            </label>
            <textarea
              id="keyBenefits"
              name="keyBenefits"
              value={formData.keyBenefits}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="What are the key benefits or features?"
            />
          </div>
          {/* Generate Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <SparklesIcon className="w-6 h-6" />
              <span>Generate</span>
            </button>
          </div>
        </form>
        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          All fields are required to generate your personalized content
        </p>
      </div>
      <SocialMediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handlePlatformSelect}
      />
    </div>
  )
}
