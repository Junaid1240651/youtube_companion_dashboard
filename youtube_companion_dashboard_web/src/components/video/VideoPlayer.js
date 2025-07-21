import React from 'react';

const VideoPlayer = ({ videoId, title }) => (
  <iframe
    src={`https://www.youtube.com/embed/${videoId}`}
    title={title}
    style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '16px 16px 0 0'
    }}
    allowFullScreen
  />
);

export default VideoPlayer; 