"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, increment, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/contexts"

const LIKED_BLOGS_KEY = "liked_blogs"

export interface LikedBlog {
  id: string
  title: string
  imageUrl: string
  category: string
  likedAt: string
}

export function useLikedBlogs() {
  const { user } = useAuth()
  const [likedBlogs, setLikedBlogs] = useState<LikedBlog[]>([])
  const [loading, setLoading] = useState(true)

  // Load liked blogs from localStorage
  useEffect(() => {
    const loadLikedBlogs = () => {
      try {
        const stored = localStorage.getItem(LIKED_BLOGS_KEY)
        if (stored) {
          setLikedBlogs(JSON.parse(stored))
        }
      } catch (error) {
        console.error("Error loading liked blogs:", error)
      } finally {
        setLoading(false)
      }
    }

    loadLikedBlogs()
  }, [])

  // Save to localStorage whenever likedBlogs changes
  const saveLikedBlogs = (blogs: LikedBlog[]) => {
    try {
      localStorage.setItem(LIKED_BLOGS_KEY, JSON.stringify(blogs))
    } catch (error) {
      console.error("Error saving liked blogs:", error)
    }
  }

  // Check if a blog is liked
  const isLiked = (blogId: string): boolean => {
    return likedBlogs.some((blog) => blog.id === blogId)
  }

  // Like a blog
  const likeBlog = async (blog: { id: string; title: string; imageUrl: string; category: string }) => {
    if (isLiked(blog.id)) return

    const newLikedBlog: LikedBlog = {
      id: blog.id,
      title: blog.title,
      imageUrl: blog.imageUrl,
      category: blog.category,
      likedAt: new Date().toISOString(),
    }

    const updatedBlogs = [...likedBlogs, newLikedBlog]
    setLikedBlogs(updatedBlogs)
    saveLikedBlogs(updatedBlogs)

    // Increment like count in Firestore
    try {
      const blogRef = doc(db, "blogs", blog.id)
      await updateDoc(blogRef, {
        likeCount: increment(1),
      })
    } catch (error) {
      console.error("Error incrementing like count:", error)
    }
  }

  // Unlike a blog
  const unlikeBlog = async (blogId: string) => {
    const updatedBlogs = likedBlogs.filter((blog) => blog.id !== blogId)
    setLikedBlogs(updatedBlogs)
    saveLikedBlogs(updatedBlogs)

    // Decrement like count in Firestore
    try {
      const blogRef = doc(db, "blogs", blogId)
      const blogDoc = await getDoc(blogRef)
      if (blogDoc.exists() && (blogDoc.data().likeCount || 0) > 0) {
        await updateDoc(blogRef, {
          likeCount: increment(-1),
        })
      }
    } catch (error) {
      console.error("Error decrementing like count:", error)
    }
  }

  // Toggle like
  const toggleLike = async (blog: { id: string; title: string; imageUrl: string; category: string }) => {
    if (isLiked(blog.id)) {
      await unlikeBlog(blog.id)
    } else {
      await likeBlog(blog)
    }
  }

  // Clear all liked blogs
  const clearLikedBlogs = () => {
    setLikedBlogs([])
    localStorage.removeItem(LIKED_BLOGS_KEY)
  }

  return {
    likedBlogs,
    loading,
    isLiked,
    likeBlog,
    unlikeBlog,
    toggleLike,
    clearLikedBlogs,
    likedCount: likedBlogs.length,
  }
}
