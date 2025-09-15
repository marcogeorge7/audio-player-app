'use client';

interface FileUploadProps {
  onUploadComplete: () => void;
}

export default function FileUpload(_props: FileUploadProps) {
  // File upload is disabled for GitHub Pages static deployment
  return (
    <div className="mb-6">
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
        <div className="space-y-3">
          <div className="text-4xl">📁</div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              File Upload Not Available
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              File upload is not supported on GitHub Pages static hosting.
              To add new audio files, please add them to the repository.
            </p>
          </div>

          <div className="text-xs text-gray-400">
            <p>Current files are loaded from the public/audio directory</p>
            <p>To add files: Add them to public/audio/ and update public/data/audio-files.json</p>
          </div>
        </div>
      </div>
    </div>
  );
}