import React, { useEffect, useState, useRef } from 'react'
import {
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaRegEdit,
  FaTimes,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import {
  IoSend,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoChevronDown,
} from 'react-icons/io5'

interface Post {
  id: string
  content: string
  platform: string
  status: 'draft' | 'scheduled' | 'posted'
  scheduledDate?: Date
}

interface PostCardProps {
  post: Post
  onSchedule: (postId: string) => void
  onPostNow: (postId: string) => void
  onUnschedule?: (postId: string) => void
}

export function PostCard({
  post,
  onSchedule,
  onPostNow,
  onUnschedule,
}: PostCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getPlatformIcon = () => {
    switch (post.platform.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin className="w-3.5 h-3.5" />
      case 'twitter':
      case 'x':
        return <FaXTwitter className="w-3.5 h-3.5" />
      case 'facebook':
        return <FaFacebook className="w-3.5 h-3.5" />
      case 'instagram':
        return <FaInstagram className="w-3.5 h-3.5" />
      case 'youtube':
        return <FaYoutube className="w-3.5 h-3.5" />
      default:
        return <IoSend className="w-3.5 h-3.5" />
    }
  }

  const getPlatformColor = () => {
    switch (post.platform.toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-600 text-white'
      case 'twitter':
      case 'x':
        return 'bg-black text-white'
      case 'facebook':
        return 'bg-blue-700 text-white'
      case 'instagram':
        return 'bg-gradient-to-br from-purple-600 to-pink-500 text-white'
      case 'youtube':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusBadge = () => {
    switch (post.status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
            Draft
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
            <IoTimeOutline className="w-3 h-3" />
            Scheduled
          </span>
        )
      case 'posted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">
            <IoCheckmarkCircle className="w-3 h-3" />
            Posted
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`${getPlatformColor()} px-2 py-1 rounded flex items-center gap-1.5 text-xs font-medium`}
        >
          {getPlatformIcon()}
          {post.platform}
        </div>
        {getStatusBadge()}
      </div>

      {/* Content */}
      <div className="flex-1 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Scheduled Date */}
      {post.scheduledDate && (
        <div className="mb-3 text-xs text-gray-500 flex items-center gap-1.5">
          <IoTimeOutline className="w-3.5 h-3.5" />
          <span>
            {post.scheduledDate.toLocaleDateString()} at{' '}
            {post.scheduledDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )}

      {/* Draft → Publish Dropdown */}
      {post.status === 'draft' && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <IoSend className="w-3.5 h-3.5" />
            Publish
            <IoChevronDown className="w-3.5 h-3.5" />
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full mb-1 w-full bg-white rounded border border-gray-200 shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  onSchedule(post.id)
                  setIsDropdownOpen(false)
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm text-gray-700"
              >
                <IoTimeOutline className="w-3.5 h-3.5" />
                Schedule
              </button>

              <button
                onClick={() => {
                  onPostNow(post.id)
                  setIsDropdownOpen(false)
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm text-gray-700 border-t border-gray-100"
              >
                <IoSend className="w-3.5 h-3.5" />
                Post Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scheduled State */}
      {post.status === 'scheduled' && (
        <div className="flex gap-2">
          <button
            onClick={() => onSchedule(post.id)}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <FaRegEdit className="w-3.5 h-3.5" />
            Edit Time
          </button>

          {onUnschedule && (
            <button
              onClick={() => onUnschedule(post.id)}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <FaTimes className="w-3.5 h-3.5" />
              Unschedule
            </button>
          )}
        </div>
      )}

      {/* Posted State */}
      {post.status === 'posted' && (
        <div className="bg-green-50 text-green-700 py-2 px-3 rounded text-sm font-medium text-center">
          Posted
        </div>
      )}
    </div>
  )
}