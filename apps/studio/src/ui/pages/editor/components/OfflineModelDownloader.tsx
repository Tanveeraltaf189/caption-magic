import React, { useState, useEffect } from 'react';

export interface OfflineModel {
  id: string;
  name: string;
  size: number; // bytes
  language: string;
  version: string;
  downloadUrl: string;
  isDownloaded: boolean;
  downloadProgress: number;
}

const AVAILABLE_MODELS: OfflineModel[] = [
  {
    id: 'whisper-tiny-en',
    name: 'Whisper Tiny (English)',
    size: 139 * 1024 * 1024, // 139MB
    language: 'en',
    version: '1.0',
    downloadUrl: 'https://huggingface.co/openai/whisper-tiny/resolve/main/model.bin',
    isDownloaded: false,
    downloadProgress: 0,
  },
  {
    id: 'whisper-base-en',
    name: 'Whisper Base (English)',
    size: 265 * 1024 * 1024, // 265MB
    language: 'en',
    version: '1.0',
    downloadUrl: 'https://huggingface.co/openai/whisper-base/resolve/main/model.bin',
    isDownloaded: false,
    downloadProgress: 0,
  },
  {
    id: 'whisper-small-multilang',
    name: 'Whisper Small (Multilingual)',
    size: 488 * 1024 * 1024, // 488MB
    language: 'multi',
    version: '1.0',
    downloadUrl: 'https://huggingface.co/openai/whisper-small/resolve/main/model.bin',
    isDownloaded: false,
    downloadProgress: 0,
  },
  {
    id: 'silero-hindi',
    name: 'Silero STT (Hindi)',
    size: 45 * 1024 * 1024, // 45MB
    language: 'hi',
    version: '1.0',
    downloadUrl: 'https://models.silero.ai/models/tts_models/multilang_v2/hi_IN/v3_1_hi.pt',
    isDownloaded: false,
    downloadProgress: 0,
  },
  {
    id: 'silero-urdu',
    name: 'Silero STT (Urdu)',
    size: 45 * 1024 * 1024, // 45MB
    language: 'ur',
    version: '1.0',
    downloadUrl: 'https://models.silero.ai/models/tts_models/multilang_v2/ur_PK/v3_1_ur.pt',
    isDownloaded: false,
    downloadProgress: 0,
  },
];

export const OfflineModelDownloader: React.FC = () => {
  const [models, setModels] = useState<OfflineModel[]>(AVAILABLE_MODELS);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    // Check which models are already downloaded
    loadDownloadedModels();
    calculateTotalSize();
  }, []);

  const loadDownloadedModels = () => {
    const stored = localStorage.getItem('downloaded-models');
    if (stored) {
      const downloadedIds = JSON.parse(stored);
      setModels((prev) =>
        prev.map((model) => ({
          ...model,
          isDownloaded: downloadedIds.includes(model.id),
        }))
      );
    }
  };

  const calculateTotalSize = () => {
    const total = models.reduce((sum, model) => sum + model.size, 0);
    setTotalSize(total);
  };

  const downloadModel = async (model: OfflineModel) => {
    setDownloading((prev) => new Set(prev).add(model.id));

    try {
      const response = await fetch(model.downloadUrl);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      let downloadedBytes = 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Cannot read response body');

      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        downloadedBytes += value.length;

        const progress = Math.round((downloadedBytes / contentLength) * 100);
        setModels((prev) =>
          prev.map((m) =>
            m.id === model.id ? { ...m, downloadProgress: progress } : m
          )
        );
      }

      // Combine chunks and store in IndexedDB
      const blob = new Blob(chunks);
      await saveModelToIndexedDB(model.id, blob);

      // Mark as down
