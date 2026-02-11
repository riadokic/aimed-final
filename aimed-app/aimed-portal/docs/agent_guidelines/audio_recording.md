# Audio Recording Guidelines — AIMED

## Browser Audio Recording

AIMED uses the browser's native MediaRecorder API. No external libraries needed.

---

## MediaRecorder Implementation

### Hook: `useAudioRecorder`

```typescript
interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;        // seconds
  audioBlob: Blob | null;
  error: string | null;
}

interface AudioRecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}
```

### Key Implementation Details

**MIME Type Selection**
```typescript
function getPreferredMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',  // Chrome, Firefox, Edge
    'audio/webm',               // Fallback WebM
    'audio/mp4',                // Safari
    'audio/wav',                // Universal fallback
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return ''; // Let browser decide
}
```

**File Extension Mapping**
```typescript
function getFileExtension(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm'; // default
}
```

---

## Permission Handling

### Request Flow
1. Call `navigator.mediaDevices.getUserMedia({ audio: true })`
2. Browser shows permission dialog
3. Handle three outcomes:
   - **Granted**: Start recording
   - **Denied**: Show error message
   - **Dismissed**: Show error message

### Error Messages (Bosnian)
| Scenario | Message |
|----------|---------|
| Permission denied | "Pristup mikrofonu je odbijen. Omogućite mikrofon u postavkama preglednika." |
| No microphone | "Mikrofon nije pronađen. Provjerite da li je mikrofon povezan." |
| In use | "Mikrofon je zauzet od strane druge aplikacije." |
| Not supported | "Vaš preglednik ne podržava snimanje zvuka. Koristite Chrome ili Firefox." |

### Permission Check (before showing record UI)
```typescript
async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state;
  } catch {
    // Firefox doesn't support permissions.query for microphone
    return 'prompt';
  }
}
```

---

## Recording Constraints

### Audio Settings
```typescript
const constraints: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,          // Mono — smaller file
    sampleRate: 16000,        // 16kHz is sufficient for speech
  }
};
```

Note: `sampleRate` may not be respected by all browsers. That's OK — Whisper handles various sample rates.

### Duration Limits
- **Minimum**: 2 seconds (prevent accidental taps)
- **Maximum**: 10 minutes (practical limit, show warning at 8 min)
- **Warning at 8 min**: "Snimak se približava maksimalnom trajanju."

### File Size
- WebM/Opus at 16kHz mono: ~10KB/second
- 5 minute recording: ~3MB
- 10 minute recording: ~6MB
- Well within Whisper's 25MB limit

---

## Timer Display

Format: `MM:SS`
- Update every second during recording
- Use `setInterval` inside the hook, clean up on unmount
- Show in red when recording, gray when paused

```typescript
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
```

---

## UX Flow

### Happy Path
1. Doctor opens app → sees record button (blue)
2. Taps record → permission granted → button turns red, timer starts
3. Doctor dictates report → timer counts
4. Doctor taps stop → recording ends
5. Audio blob ready → auto-submit to API

### Auto-Submit Behavior
When recording stops, automatically submit to the API. Don't make the doctor press another button. The flow should be:
- Record → Stop → Processing → Report

If the doctor wants to re-record, they can use a "Snimi ponovo" (Record again) button after seeing the result.

---

## Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 49+ | Full support | Best audio quality |
| Firefox 25+ | Full support | Good |
| Edge 79+ | Full support | Chromium-based |
| Safari 14.1+ | Partial | Uses `audio/mp4`, no `audio/webm` |

### Safari Handling
Safari doesn't support WebM. The MediaRecorder will output MP4 instead. Whisper accepts both formats, so this is transparent to the user.

---

## Cleanup

Always stop and release media streams when:
- Component unmounts
- User navigates away
- Recording is reset

```typescript
function stopMediaStream(stream: MediaStream) {
  stream.getTracks().forEach(track => track.stop());
}
```

Failure to clean up will leave the browser's microphone indicator active.
