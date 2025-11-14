'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ src, onImportFile }) {
  const videoRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState(src || null);
  const [downloadName, setDownloadName] = useState('video');

  useEffect(() => {
    setCurrentSrc(src || null);
  }, [src]);

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDownloadName(file.name.replace(/\.[^.]+$/, ''));
    onImportFile?.(file);
    // do not set local URL here; parent will feed via src
  }, [onImportFile]);

  return (
    <div>
      <div className="videoBox">
        {currentSrc ? (
          <video ref={videoRef} src={currentSrc} controls playsInline />
        ) : (
          <div style={{ color: '#94a3b8', padding: '16px' }}>No video selected.</div>
        )}
      </div>

      <div className="row" style={{ marginTop: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="btn secondary" htmlFor="file-input">Import File</label>
        <input id="file-input" className="input" type="file" accept="video/*" style={{ display: 'none' }} onChange={onFileChange} />
        {currentSrc ? (
          <a className="btn" href={currentSrc} download={`${downloadName || 'video'}.webm`}>Download</a>
        ) : <span />}
      </div>
    </div>
  );
}
