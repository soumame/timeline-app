import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import type { S3Config, ImageInfo } from '../types/s3'

export class S3Service {
  private client: S3Client
  private bucket: string

  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    })
    this.bucket = config.bucket
  }

  async listImages(): Promise<ImageInfo[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: 'lifelog/',
        MaxKeys: 1000,
      })

      const response = await this.client.send(command)
      const images: ImageInfo[] = []

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key.endsWith('.jpg')) {
            const filename = object.Key.split('/').pop() || ''
            const timestamp = this.parseTimestampFromFilename(filename)
            
            if (timestamp) {
              const url = await getSignedUrl(
                this.client,
                new GetObjectCommand({
                  Bucket: this.bucket,
                  Key: object.Key,
                }),
                { expiresIn: 3600 }
              )

              images.push({
                key: object.Key,
                url,
                timestamp,
                filename,
              })
            }
          }
        }
      }

      // Sort by timestamp (newest first)
      images.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      return images
    } catch (error) {
      console.error('Error listing images:', error)
      throw error
    }
  }

  private parseTimestampFromFilename(filename: string): Date | null {
    // Parse filename format: yyyy-mm-dd-hhmmss.jpg
    const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})(\d{2})\.jpg$/)
    
    if (!match) return null

    const [, year, month, day, hour, minute, second] = match
    
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // JavaScript months are 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    )
  }

  async getImageUrl(key: string): Promise<string> {
    try {
      return await getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
        { expiresIn: 3600 }
      )
    } catch (error) {
      console.error('Error getting image URL:', error)
      throw error
    }
  }
}