import React, { useState } from 'react';

export const OfflineModelDownloader: React.FC = () => {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  const models = [
    { id: 'whisper-tiny', name: 'Whisper Tiny', size: '139MB', language: 'en' },
    { id: 'whisper-base', name: 'Whisper Base', size: '265MB', language: 'en' },
    { id: 'silero-hindi', name: 'Silero Hindi', size: '45MB', language: 'hi' },
    { id: 'silero-urdu', name: 'Silero Urdu', size: '45MB', language: 'ur' },
  ];

  const downloadModel = async (modelId: string) => {
    setDownloading((prev) => new Set(prev).add(modelId));
    // Simulated download
    setTimeout(() => {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(modelId);
        return next;
      });
    }, 2000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📥 Offline Models</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {models.map((model) => (
          <div key={model.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <h3>{model.name}</h3>
            <p>Size: {model.size} | Language: {model.language}</p>
            <button
              onClick={() => downloadModel(model.id)}
              disabled={downloading.has(model.id)}
              style={{ width: '100%', padding: '8px' }}
            >
              {downloading.has(model.id) ? 'Downloading...' : 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
