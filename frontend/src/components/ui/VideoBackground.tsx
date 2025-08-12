import React from 'react';

interface VideoBackgroundProps {
  src?: string;
  opacity?: number;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ 
  src = './videos/travel-background.mp4', 
  opacity = 0.6,
  className = '' 
}) => {
  const [videoError, setVideoError] = React.useState(false);
  const [videoLoaded, setVideoLoaded] = React.useState(false);

  return (
    <div className={`fixed inset-0 z-[-1] ${className}`}>
      {/* Video element */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: videoLoaded && !videoError ? opacity : 0 }}
        onLoadedData={() => {
          console.log('Video loaded successfully');
          setVideoLoaded(true);
        }}
        onError={(e) => {
          console.error('Video error:', e);
          setVideoError(true);
        }}
        onCanPlay={() => {
          console.log('Video can play');
        }}
      >
        <source src="/videos/travel-background.mp4" type="video/mp4" />
        <source src="./videos/travel-background.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white bg-black/50 p-2 rounded">
          Video: {videoError ? 'Error' : videoLoaded ? 'Loaded' : 'Loading'} | Path: {src}
        </div>
      )}
      
      {/* No overlay - pure video background with glass elements providing readability */}
    </div>
  );
};

export default VideoBackground;