import React from 'react'
import {
  XIcon,
  LinkedinIcon,
  TwitterIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from 'lucide-react'
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
      name: 'LinkedIn',
      icon: LinkedinIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      name: 'Instagram',
      icon: InstagramIcon,
      color:
        'bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
    },
    {
      name: 'YouTube',
      icon: YoutubeIcon,
      color: 'bg-red-600 hover:bg-red-700',
    },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Platform
          </h2>
          <p className="text-gray-600">
            Select which social media platform you want to generate content for
          </p>
        </div>
        {/* Platform Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <button
                key={platform.name}
                onClick={() => onSelect(platform.name)}
                className={`${platform.color} text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-3`}
              >
                <Icon className="w-10 h-10" />
                <span className="font-semibold text-lg">{platform.name}</span>
              </button>
            )
          })}
        </div>
        {/* Cancel Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
