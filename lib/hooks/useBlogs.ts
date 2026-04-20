// "use client"

// import { useState, useEffect } from "react"
// import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore"
// import { db } from "@/lib/firebase"
// import type { BlogPost } from "@/lib/types"

// export function useBlogs() {
//   const [blogs, setBlogs] = useState<BlogPost[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"))
    
//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         const blogsData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as BlogPost[]
//         setBlogs(blogsData)
//         setLoading(false)
//       },
//       (err) => {
//         console.error("Error fetching blogs:", err)
//         setError("Failed to fetch blogs")
//         setLoading(false)
//       }
//     )

//     return () => unsubscribe()
//   }, [])

//   const addBlog = async (blogData: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
//     try {
//       const docRef = await addDoc(collection(db, "blogs"), {
//         ...blogData,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       })
//       return docRef.id
//     } catch (err) {
//       console.error("Error adding blog:", err)
//       throw new Error("Failed to add blog")
//     }
//   }

//   const updateBlog = async (id: string, blogData: Partial<BlogPost>) => {
//     try {
//       const blogRef = doc(db, "blogs", id)
//       await updateDoc(blogRef, {
//         ...blogData,
//         updatedAt: serverTimestamp(),
//       })
//     } catch (err) {
//       console.error("Error updating blog:", err)
//       throw new Error("Failed to update blog")
//     }
//   }

//   const deleteBlog = async (id: string) => {
//     try {
//       await deleteDoc(doc(db, "blogs", id))
//     } catch (err) {
//       console.error("Error deleting blog:", err)
//       throw new Error("Failed to delete blog")
//     }
//   }

//   return {
//     blogs,
//     loading,
//     error,
//     addBlog,
//     updateBlog,
//     deleteBlog,
//   }
// }