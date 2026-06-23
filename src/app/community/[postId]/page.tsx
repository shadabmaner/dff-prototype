import { headers } from 'next/headers'

interface PostData {
  id: string
  caption: string
  mediaUrl: string
  authorName: string
  authorAvatar: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  createdAt: string
}

interface ApiResponse {
  data: PostData
}

async function getPost(postId: string): Promise<PostData | null> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/community/posts/public/${postId}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`API request failed with status ${response.status}`)
    }

    const apiResponse: ApiResponse = await response.json()
    return apiResponse.data
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const post = await getPost(postId)
  
  if (!post) {
    return {
      title: 'Post Not Found - DrApp',
    }
  }

  const headersList = await headers()
  const host = headersList.get('host') || ''
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const currentUrl = `${protocol}://${host}/community/${postId}`

  return {
    title: `${post.authorName} posted on DrApp`,
    description: post.caption,
    openGraph: {
      title: `${post.authorName} posted on DrApp`,
      description: post.caption,
      images: [post.mediaUrl],
      url: currentUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.authorName} on DrApp`,
      description: post.caption,
      images: [post.mediaUrl],
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const post = await getPost(postId)

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h1>
          <p className="text-gray-600">This post may have been deleted or is not available.</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with Author Info */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <img
            src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=random`}
            alt={post.authorName}
            className="w-12 h-12 rounded-full object-cover bg-gray-200"
          />
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{post.authorName}</h2>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Media Content */}
        {post.mediaUrl && (
          <div className="relative w-full">
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="w-full h-auto"
              style={{ maxHeight: '600px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Caption */}
        <div className="p-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.caption}
          </p>
        </div>

        {/* Engagement Stats */}
        <div className="px-4 pb-4 flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {post.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              {post.commentsCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
              {post.sharesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
