import { useState, useEffect } from 'react'
import { Settings, Save, Eye, EyeOff } from 'lucide-react'
import type { S3Config } from '../types/s3'

interface S3ConfigFormProps {
  onConfigSave: (config: S3Config) => void
  initialConfig?: S3Config | null
}

export const S3ConfigForm = ({ onConfigSave, initialConfig }: S3ConfigFormProps) => {
  const [config, setConfig] = useState<S3Config>({
    region: '',
    endpoint: '',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: ''
  })
  const [showSecrets, setShowSecrets] = useState(false)
  const [isOpen, setIsOpen] = useState(!initialConfig)

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
    }
  }, [initialConfig])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfigSave(config)
    setIsOpen(false)
  }

  if (!isOpen && initialConfig) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">S3 Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <input
              type="text"
              value={config.region}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="us-east-1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Endpoint</label>
            <input
              type="url"
              value={config.endpoint}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="https://s3.amazonaws.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bucket Name</label>
            <input
              type="text"
              value={config.bucket}
              onChange={(e) => setConfig({ ...config, bucket: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="my-bucket"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Access Key ID</label>
            <div className="relative">
              <input
                type={showSecrets ? "text" : "password"}
                value={config.accessKeyId}
                onChange={(e) => setConfig({ ...config, accessKeyId: e.target.value })}
                className="w-full p-2 border rounded-md pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showSecrets ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Secret Access Key</label>
            <input
              type={showSecrets ? "text" : "password"}
              value={config.secretAccessKey}
              onChange={(e) => setConfig({ ...config, secretAccessKey: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Configuration
            </button>
            {initialConfig && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}