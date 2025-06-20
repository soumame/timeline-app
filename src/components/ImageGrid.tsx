import { useState, useEffect, useRef, useCallback } from 'react'
import { Grid, List, Loader2 } from 'lucide-react'
import type { ImageInfo } from '../types/s3'
import { cn } from '../lib/utils'

interface ImageGridProps {
  images: ImageInfo[]
  loading: boolean
}

type ScrollDirection = 'horizontal' | 'vertical'

export const ImageGrid = ({ images, loading }: ImageGridProps) => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('vertical')
  const [visibleImages, setVisibleImages] = useState<ImageInfo[]>([])
  const [loadedCount, setLoadedCount] = useState(20)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  // Load more images when scrolling near the end
  const loadMoreImages = useCallback(() => {
    if (loadedCount < images.length) {
      setLoadedCount(prev => Math.min(prev + 20, images.length))
    }
  }, [loadedCount, images.length])

  // Update visible images when images or loadedCount changes
  useEffect(() => {
    setVisibleImages(images.slice(0, loadedCount))
  }, [images, loadedCount])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreImages()
        }
      },
      { threshold: 0.1 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreImages])

  // Reset loaded count when images change
  useEffect(() => {
    setLoadedCount(20)
  }, [images])

  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading images...</span>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>No images found in the lifelog directory.</p>
        <p className="text-sm mt-2">Make sure your S3 bucket contains JPG files in /lifelog/yyyy/mm/dd/ format.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {images.length} images found
          </span>
          <span className="text-sm text-gray-500">
            Showing {visibleImages.length} of {images.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Layout:</span>
          <button
            onClick={() => setScrollDirection('vertical')}
            className={cn(
              'p-2 rounded-md transition-colors',
              scrollDirection === 'vertical'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setScrollDirection('horizontal')}
            className={cn(
              'p-2 rounded-md transition-colors',
              scrollDirection === 'horizontal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div
        ref={containerRef}
        className={cn(
          'space-y-4',
          scrollDirection === 'horizontal' && 'overflow-x-auto'
        )}
      >
        {scrollDirection === 'vertical' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleImages.map((image) => (
              <ImageCard key={image.key} image={image} formatDate={formatDate} />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 pb-4" style={{ width: `${visibleImages.length * 320}px` }}>
            {visibleImages.map((image) => (
              <div key={image.key} className="flex-shrink-0 w-80">
                <ImageCard image={image} formatDate={formatDate} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator for infinite scroll */}
      {loadedCount < images.length && (
        <div ref={loadingRef} className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading more images...</span>
        </div>
      )}
    </div>
  )
}

interface ImageCardProps {
  image: ImageInfo
  formatDate: (date: Date) => string
}

const ImageCard = ({ image, formatDate }: ImageCardProps) => {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-square relative overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            <span className="text-sm">Failed to load</span>
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.filename}
            className={cn(
              'w-full h-full object-cover transition-transform group-hover:scale-105',
              imageLoading && 'opacity-0'
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false)
              setImageError(true)
            }}
          />
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 truncate">{image.filename}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(image.timestamp)}</p>
      </div>
    </div>
  )
}