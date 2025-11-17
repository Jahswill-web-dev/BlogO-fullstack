"use client"

import React, { useState } from 'react';
import { CalendarIcon, LinkIcon } from 'lucide-react';
import { PostCard } from '@/components/modules/PostCard';
import { ScheduleModal } from '@/components/modules/ScheduleModal';
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  content: string
  platform: string
  status: 'draft' | 'scheduled' | 'posted'
  scheduledDate?: Date
}

export default function GeneratedPostsPage() {
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content:
        "Excited to announce our new product launch! 🚀 We're revolutionizing the way startups connect with their audience. Join us on this incredible journey! #StartupLife #Innovation",
      platform: 'LinkedIn',
      status: 'draft',
    },
    {
      id: '2',
      content:
        "🎉 Big news! Our platform just hit 10,000 users! Thank you for believing in our vision. Here's to the next milestone! 💪 #Growth #Milestone",
      platform: 'Twitter',
      status: 'draft',
    },
    {
      id: '3',
      content:
        'Behind the scenes at our startup! 📸 Meet the amazing team making it all happen. Swipe to see our office culture ➡️ #TeamWork #StartupCulture',
      platform: 'Instagram',
      status: 'draft',
    },
  ])

  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const handleSchedule = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (post) {
      setSelectedPost(post)
      setIsScheduleModalOpen(true)
    }
  }

  const handlePostNow = (postId: string) => {
    setPosts(posts.map((post) =>
      post.id === postId ? { ...post, status: 'posted' } : post
    ))
  }

  const handleUnschedule = (postId: string) => {
    setPosts(posts.map((post) =>
      post.id === postId ? { ...post, status: 'draft', scheduledDate: undefined } : post
    ))
  }

  const handleScheduleConfirm = (date: Date) => {
    if (selectedPost) {
      setPosts(posts.map((post) =>
        post.id === selectedPost.id
          ? { ...post, status: 'scheduled', scheduledDate: date }
          : post
      ))
    }

    setIsScheduleModalOpen(false)
    setSelectedPost(null)
  }

  const handleAutoSchedule = () => {
    const now = new Date()
    setPosts(posts.map((post, index) => {
      if (post.status === 'draft') {
        const scheduledDate = new Date(now)
        scheduledDate.setHours(now.getHours() + (index + 1) * 2)

        return {
          ...post,
          status: 'scheduled',
          scheduledDate,
        }
      }
      return post
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Posts</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {posts.filter((p) => p.status === 'draft').length} drafts
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAutoSchedule}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                Auto-Schedule
              </button>

              <button
                onClick={() => router.push('/calendar')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <LinkIcon className="w-4 h-4" />
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSchedule={handleSchedule}
              onPostNow={handlePostNow}
              onUnschedule={handleUnschedule}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No posts generated yet</p>
          </div>
        )}
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setSelectedPost(null)
        }}
        onConfirm={handleScheduleConfirm}
        post={selectedPost}
      />
    </div>
  )
}
