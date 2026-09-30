'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBase64: string, mimeType: string) => void;
  onClearAudio: () => void;
}

export function AudioRecorder({ onAudioReady, onClearAudio }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          onAudioReady(base64Data, mimeType);
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Audio recording failed:', error);
      setErrorMsg(error.message || 'Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      onAudioReady(base64Data, file.type || 'audio/mp3');
    };
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingDuration(0);
    onClearAudio();
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Voice Note / Audio Dispatch
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Sister/Doctor Audio Log
        </span>
      </div>

      {errorMsg && (
        <div className="mb-3 flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs font-medium transition-colors"
            >
              <Mic className="h-4 w-4 text-red-400" />
              <span>Record Voice Note</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-medium shadow-md shadow-red-900/50 animate-pulse transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>Stop Recording ({formatSeconds(recordingDuration)})</span>
            </button>
          )}

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            <span>Upload Audio File</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {audioUrl && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              onClick={togglePlayback}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 text-xs font-medium transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Play Clip</span>
                </>
              )}
            </button>

            <button
              onClick={resetAudio}
              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Delete audio"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
