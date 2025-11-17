'use client'

import {
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";



interface SocialMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (platform: string) => void
}

export function SocialMediaModal({
  isOpen,
  onClose,
  onSelect,
}: SocialMediaModalProps) {
  if (!isOpen) return null

  const platforms = [
  {
    name: "LinkedIn",
    icon: FaLinkedin,
    color: "text-blue-600 hover:bg-blue-50",
  },
  {
    name: "Twitter",
    icon: FaTwitter,
    color: "text-sky-500 hover:bg-sky-50",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    color: "text-blue-700 hover:bg-blue-50",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    color: "text-pink-600 hover:bg-pink-50",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    color: "text-red-600 hover:bg-red-50",
  },
];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          {/* <X className="w-5 h-5" /> */}
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Choose Platform
          </h2>
          <p className="text-sm text-gray-500">
            Select a social media platform
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-3 gap-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <button
                key={platform.name}
                onClick={() => onSelect(platform.name)}
                className={`${platform.color} bg-white border border-gray-200 p-4 rounded-lg transition-all duration-150 hover:border-gray-300 flex flex-col items-center justify-center space-y-2`}
              >
                <Icon className="w-4 h-4 cursor-pointer" />
                <span className="font-medium text-xs text-gray-700">
                  {platform.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}