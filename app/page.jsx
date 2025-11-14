'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import './globals.css';
import VideoRecorder from './components/VideoRecorder';
import VideoPlayer from './components/VideoPlayer';

export default function Page() {
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [clips, setClips] = useState([]);
  const objectUrlsRef = useRef([]);

  const onNewRecording = useCallback((blob) => {
    const url = URL.createObjectURL(blob);
    objectUrlsRef.current.push(url);
    const clip = { url, createdAt: new Date().toISOString(), size: blob.size };
    setClips((prev) => [clip, ...prev]);
    setCurrentVideoUrl(url);
  }, []);

  const onImportFile = useCallback((file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    const clip = { url, createdAt: new Date().toISOString(), size: file.size, name: file.name };
    setClips((prev) => [clip, ...prev]);
    setCurrentVideoUrl(url);
  }, []);

  const onSelectClip = useCallback((url) => {
    setCurrentVideoUrl(url);
  }, []);

  const onClearClips = useCallback(() => {
    setClips([]);
    setCurrentVideoUrl(null);
    objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];
  }, []);

  const humanSize = useCallback((bytes) => {
    if (bytes == null) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(1)} ${units[i]}`;
  }, []);

  return (
    <main className="container">
      <header className="header">
        <h1>Video Studio</h1>
        <p className="sub">Record from your camera, import files, play and download.</p>
      </header>

      <section className="grid">
        <div className="card">
          <h2 className="cardTitle">Recorder</h2>
          <VideoRecorder onNewRecording={onNewRecording} />
        </div>

        <div className="card">
          <h2 className="cardTitle">Player</h2>
          <VideoPlayer src={currentVideoUrl} onImportFile={onImportFile} />
        </div>
      </section>

      <section className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Clips</h2>
          <button className="btn secondary" onClick={onClearClips} disabled={clips.length === 0}>Clear</button>
        </div>
        {clips.length === 0 ? (
          <p className="muted">No clips yet. Record or import a video.</p>
        ) : (
          <ul className="clips">
            {clips.map((c, idx) => (
              <li key={c.url} className="clipItem">
                <button className="link" onClick={() => onSelectClip(c.url)}>Play</button>
                <span className="clipMeta">{c.name || `Recording ${clips.length - idx}`}</span>
                <span className="spacer" />
                <span className="muted">{new Date(c.createdAt).toLocaleString()}</span>
                <span className="muted">? {humanSize(c.size)}</span>
                <a className="btn small" href={c.url} download={(c.name || 'recording') + '.webm'}>Download</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">
        <span className="muted">Built for modern browsers. Camera/microphone permission required to record.</span>
      </footer>
    </main>
  );
}
