
import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndProcessFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size must be smaller than 10MB.");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-56 rounded-xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${dragActive ? "bg-legal-primary/5 dark:bg-legal-primary/20 border-2 border-legal-primary" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-legal-primary/50 hover:shadow-md"}
          ${isLoading ? "opacity-50 pointer-events-none" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10 flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className={`mb-4 p-3 rounded-full transition-colors ${dragActive ? 'bg-legal-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:text-legal-primary group-hover:bg-legal-primary/10'}`}>
            <UploadCloud className="w-8 h-8" strokeWidth={1.5} />
          </div>
          
          <p className="mb-2 text-lg text-legal-dark dark:text-gray-200 font-medium">
            Drop the contract here
          </p>
          <p className="text-sm text-gray-400 font-light">
             or <span className="text-legal-primary underline decoration-legal-primary/30 underline-offset-4 cursor-pointer">click</span> to select a file
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-4 font-mono">PDF • Max 10MB</p>
        </div>
        
        <input 
          id="dropzone-file" 
          type="file" 
          accept="application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" 
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-900/50 animate-fade-in" role="alert">
          <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-2" />
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
