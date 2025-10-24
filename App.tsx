
import React, { useState, useCallback } from 'react';
import type { UploadedPhoto } from './types';
import { generateReunificationImage } from './services/geminiService';
import { UploadIcon, HeartIcon, SparklesIcon } from './components/icons';

// Component defined outside App to prevent re-renders
interface ImageUploaderProps {
  id: string;
  label: string;
  onFileSelect: (file: UploadedPhoto) => void;
  previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onFileSelect, previewUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
            onFileSelect({
                base64: base64String,
                mimeType: file.type,
                previewUrl: URL.createObjectURL(file),
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-100 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors"
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="object-cover w-full h-full rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP</p>
          </div>
        )}
        <input id={id} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      </label>
    </div>
  );
};

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export default function App() {
  const [childPhoto, setChildPhoto] = useState<UploadedPhoto | null>(null);
  const [adultPhoto, setAdultPhoto] = useState<UploadedPhoto | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    if (!childPhoto || !adultPhoto) {
      setError("Please upload both photos before generating.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateReunificationImage(childPhoto, adultPhoto);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [childPhoto, adultPhoto]);

  const canGenerate = childPhoto && adultPhoto && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center py-10 px-4">
      <main className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Reunify
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Upload a childhood photo and a recent one to see your adult self hugging your younger self.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ImageUploader id="child-photo" label="your childhood photo" onFileSelect={setChildPhoto} previewUrl={childPhoto?.previewUrl || null} />
          <ImageUploader id="adult-photo" label="your recent photo" onFileSelect={setAdultPhoto} previewUrl={adultPhoto?.previewUrl || null} />
        </div>

        <div className="text-center mb-10">
          <button
            onClick={handleGenerateClick}
            disabled={!canGenerate}
            className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner/>
                Generating...
              </>
            ) : (
                <>
                <HeartIcon />
                Reunify Photos
                </>
            )}
          </button>
        </div>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-center mb-8" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {isLoading && (
            <div className="text-center p-6 bg-blue-50 dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-lg font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                Our AI is creating your special moment. This can take a minute...
                </p>
            </div>
        )}

        {generatedImage && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center">
              <SparklesIcon /> Your Reunified Moment
            </h2>
            <div className="aspect-square w-full max-w-xl mx-auto">
                <img src={generatedImage} alt="Generated reunification" className="rounded-lg object-contain w-full h-full" />
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl mx-auto text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Reunify. Powered by Gemini.</p>
      </footer>
    </div>
  );
}
