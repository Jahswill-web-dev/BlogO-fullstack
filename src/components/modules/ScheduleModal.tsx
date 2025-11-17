"use client"

import React, { useEffect, useState } from "react"
import { X, Calendar, Clock } from "lucide-react"

interface Post {
  id: string
  content: string
  platform: string
  status: "draft" | "scheduled" | "posted"
  scheduledDate?: Date
}

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: Date) => void
  post: Post | null
}

export function ScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  post,
}: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  // Pre-fill if editing
  useEffect(() => {
    if (post?.scheduledDate) {
      const date = new Date(post.scheduledDate)
      setSelectedDate(date.toISOString().split("T")[0])
      setSelectedTime(date.toTimeString().slice(0, 5))
    } else {
      setSelectedDate("")
      setSelectedTime("")
    }
  }, [post])

  if (!isOpen || !post) return null

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`)
      onConfirm(dateTime)
      setSelectedDate("")
      setSelectedTime("")
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const now = new Date().toTimeString().slice(0, 5)
  const isEditing = post.status === "scheduled"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {isEditing ? "Edit Schedule" : "Schedule Post"}
          </h2>
          <p className="text-sm text-gray-500">
            {isEditing ? "Update when to publish" : "Choose when to publish"} your {post.platform} post
          </p>
        </div>

        {/* Post Preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-5">
          <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-5">

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              min={selectedDate === today ? now : undefined}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? "Update" : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  )
}
