export interface S3Config {
  region: string
  endpoint: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
}

export interface ImageInfo {
  key: string
  url: string
  timestamp: Date
  filename: string
}