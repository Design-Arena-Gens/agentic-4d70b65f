'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function VideoRecorder({ onNewRecording }) {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = () => {
    setElapsedMs(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    const start = Date.now() - elapsedMs;
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const requestMedia = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsReady(true);
    } catch (e) {
      console.error(e);
      setError('Unable to access camera/microphone.');
      setIsReady(false);
    }
  }, []);

  useEffect(() => {
    requestMedia();
    return () => {
      stopTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [requestMedia]);

  const startRecording = useCallback(() => {
    if (!mediaStreamRef.current) return;
    chunksRef.current = [];
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let chosen = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) { chosen = m; break; }
    }
    try {
      const rec = new MediaRecorder(mediaStreamRef.current, chosen ? { mimeType: chosen } : undefined);
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stopTimer();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'video/webm' });
        onNewRecording?.(blob);
        chunksRef.current = [];
        setIsPaused(false);
        setIsRecording(false);
        resetTimer();
      };
      rec.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
    } catch (e) {
      console.error(e);
      setError('Recording failed to start.');
    }
  }, [onNewRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  }, []);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  return (
    <div>
      <div className="videoBox">
        <video ref={videoRef} playsInline muted />
      </div>
      <div className="row" style={{ marginTop: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn" onClick={startRecording} disabled={!isReady || isRecording}>Start</button>
          <button className="btn secondary" onClick={pauseRecording} disabled={!isRecording || isPaused}>Pause</button>
          <button className="btn secondary" onClick={resumeRecording} disabled={!isRecording || !isPaused}>Resume</button>
          <button className="btn" onClick={stopRecording} disabled={!isRecording}>Stop</button>
        </div>
        <div className="label">{formatTime(elapsedMs)}</div>
      </div>
      {error ? <p className="muted" style={{ marginTop: 8 }}>{error}</p> : null}
    </div>
  );
}
