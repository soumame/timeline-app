import { useState, useEffect, useCallback } from "react";
import { S3ConfigForm } from "./components/S3ConfigForm";
import { ImageGrid } from "./components/ImageGrid";
import { S3Service } from "./services/s3Service";
import type { S3Config, ImageInfo } from "./types/s3";
import { RefreshCw, Camera } from "lucide-react";

function App() {
  const [s3Config, setS3Config] = useState<S3Config | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load S3 config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("s3-config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setS3Config(config);
      } catch (err) {
        console.error("Failed to parse saved S3 config:", err);
        localStorage.removeItem("s3-config");
      }
    }
  }, []);

  const loadImages = useCallback(async () => {
    if (!s3Config) return;

    setLoading(true);
    setError(null);

    try {
      const s3Service = new S3Service(s3Config);
      const imageList = await s3Service.listImages();
      setImages(imageList);
    } catch (err) {
      console.error("Failed to load images:", err);
      setError(
        "Failed to load images. Please check your S3 configuration and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [s3Config]);

  // Load images when config is available
  useEffect(() => {
    if (s3Config) {
      loadImages();
    }
  }, [s3Config, loadImages]);

  const handleConfigSave = (config: S3Config) => {
    setS3Config(config);
    localStorage.setItem("s3-config", JSON.stringify(config));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Timeline App</h1>
            </div>

            {s3Config && (
              <button
                onClick={loadImages}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {s3Config ? (
          <ImageGrid images={images} loading={loading} />
        ) : (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Timeline App
            </h2>
            <p className="text-gray-600 mb-6">
              Configure your S3 settings to start viewing your lifelog images.
            </p>
          </div>
        )}
      </div>

      {/* S3 Config Form */}
      <S3ConfigForm onConfigSave={handleConfigSave} initialConfig={s3Config} />
    </div>
  );
}

export default App;
