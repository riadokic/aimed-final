"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ── Types ──

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  /** Normalized frequency data (0-255) for waveform visualization, 64 bins */
  frequencyData: Uint8Array | null;
}

export interface AudioRecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

// ── Constants ──

const MAX_DURATION = 600; // 10 minutes
const WARNING_DURATION = 480; // 8 minutes

const ERROR_MESSAGES: Record<string, string> = {
  NotAllowedError: "Pristup mikrofonu je odbijen. Omogućite mikrofon u postavkama preglednika.",
  NotFoundError: "Mikrofon nije pronađen. Provjerite da li je mikrofon povezan.",
  NotReadableError: "Mikrofon je zauzet od strane druge aplikacije.",
  NotSupported: "Vaš preglednik ne podržava snimanje zvuka. Koristite Chrome ili Firefox.",
};

// ── MIME type detection ──

function getPreferredMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/wav",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

// ── Hook ──

export function useAudioRecorder(): AudioRecorderState & AudioRecorderActions {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cleanup everything
  const cleanup = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    // Stop animation frame
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // Stop all tracks (releases microphone)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Start real-time frequency analysis for waveform
  const startAnalyser = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; // 64 frequency bins
      analyser.smoothingTimeConstant = 0.7;

      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      function updateFrequency() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        // Create a copy so React detects the change
        setFrequencyData(new Uint8Array(dataArray));
        animFrameRef.current = requestAnimationFrame(updateFrequency);
      }
      updateFrequency();
    } catch {
      // AnalyserNode not critical — waveform will fall back to CSS animation
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];

    // Check browser support
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(ERROR_MESSAGES.NotSupported);
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError(ERROR_MESSAGES.NotSupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      const mimeType = getPreferredMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        setIsRecording(false);
        setFrequencyData(null);

        // Release mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
        audioContextRef.current = null;
        analyserRef.current = null;
      };

      recorder.onerror = () => {
        setError("Greška pri snimanju. Pokušajte ponovo.");
        cleanup();
        setIsRecording(false);
      };

      // Request data every 1 second for progressive chunking
      recorder.start(1000);
      setIsRecording(true);

      // Start timestamp-based timer via rAF (no drift)
      startTimeRef.current = performance.now();
      pausedElapsedRef.current = 0;
      function tickTimer() {
        const elapsed = Math.floor(
          (performance.now() - startTimeRef.current + pausedElapsedRef.current) / 1000
        );
        setDuration(elapsed);
        // Auto-stop at max
        if (elapsed >= MAX_DURATION) {
          mediaRecorderRef.current?.stop();
          return;
        }
        timerRef.current = requestAnimationFrame(tickTimer);
      }
      timerRef.current = requestAnimationFrame(tickTimer);

      // Start waveform analyser
      startAnalyser(stream);
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : "Unknown";
      setError(ERROR_MESSAGES[name] || "Neočekivana greška. Pokušajte ponovo.");
      cleanup();
    }
  }, [cleanup, startAnalyser]);

  const pauseRecording = useCallback(() => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "recording"
    )
      return;

    mediaRecorderRef.current.pause();
    setIsPaused(true);

    // Accumulate elapsed time and stop the timer
    pausedElapsedRef.current += performance.now() - startTimeRef.current;
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    // Stop waveform updates while paused
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setFrequencyData(null);
  }, []);

  const resumeRecording = useCallback(() => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "paused"
    )
      return;

    mediaRecorderRef.current.resume();
    setIsPaused(false);

    // Restart timer from now, with accumulated elapsed time preserved
    startTimeRef.current = performance.now();
    function tickTimer() {
      const elapsed = Math.floor(
        (performance.now() - startTimeRef.current + pausedElapsedRef.current) /
          1000
      );
      setDuration(elapsed);
      if (elapsed >= MAX_DURATION) {
        mediaRecorderRef.current?.stop();
        return;
      }
      timerRef.current = requestAnimationFrame(tickTimer);
    }
    timerRef.current = requestAnimationFrame(tickTimer);

    // Restart waveform analyser
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      function updateFrequency() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        setFrequencyData(new Uint8Array(dataArray));
        animFrameRef.current = requestAnimationFrame(updateFrequency);
      }
      updateFrequency();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setError(null);
    setFrequencyData(null);
    chunksRef.current = [];
    pausedElapsedRef.current = 0;
  }, [cleanup]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error,
    frequencyData,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}

/** Returns true if duration is at or past the 8-minute warning threshold */
export function isDurationWarning(duration: number): boolean {
  return duration >= WARNING_DURATION;
}

/** Returns true if duration hit the maximum */
export function isDurationMax(duration: number): boolean {
  return duration >= MAX_DURATION;
}
