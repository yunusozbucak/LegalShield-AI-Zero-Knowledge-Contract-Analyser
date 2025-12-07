
import React, { useEffect, useState } from 'react';

interface WatermarkProps {
  sessionToken: string;
}

const Watermark: React.FC<WatermarkProps> = ({ sessionToken }) => {
  const [ip, setIp] = useState<string>('127.0.0.1');

  useEffect(() => {
    // Attempt to fetch public IP (simulated for demo reliability)
    // In production, this would come from the server-side prop or a stable IP service
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Unknown IP'));
  }, []);

  // Create a grid of watermark text
  const timestamp = new Date().toLocaleString('en-US');
  const watermarkText = `CONFIDENTIAL - ${ip} - ${sessionToken} - ${timestamp}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-wrap content-center justify-center overflow-hidden select-none">
      {/* 
         Reduced opacity to 0.065 (6.5%) as requested.
         Using absolute positioning to stay within the main content area (excluding header/footer)
      */}
      <div className="w-[150%] h-[150%] -ml-[25%] -mt-[25%] flex flex-wrap items-center justify-center opacity-[0.065] -rotate-12">
        {Array.from({ length: 100 }).map((_, i) => (
          <div 
            key={i} 
            className="m-12 text-sm font-black text-gray-500 dark:text-gray-400 whitespace-nowrap uppercase tracking-widest"
          >
            {watermarkText}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watermark;
