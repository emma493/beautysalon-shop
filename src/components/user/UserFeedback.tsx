import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  Mic,
  Smile,
  CheckCheck,
  Search,
  Shield,
  Trash2,
  Play,
  Pause,
  Volume2,
  X,
} from 'lucide-react';

// Voice Note Player Component inside Chat Bubble
const VoiceNotePlayer: React.FC<{
  audioUrl?: string;
  durationText?: string;
  isWorker: boolean;
}> = ({ audioUrl, durationText = '0:08', isWorker }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fallbackAudio = audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If play fails, simulate progress animation
          setIsPlaying(true);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 10;
      setProgress((current / total) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Simulated progress loop fallback if audio object doesn't trigger events
  useEffect(() => {
    let interval: any;
    if (isPlaying && (!audioRef.current || audioRef.current.paused)) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-3 my-1.5 p-2 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/10 dark:border-white/10 min-w-[200px] max-w-full">
      <audio
        ref={audioRef}
        src={fallbackAudio}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* Play/Pause Circle Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition ${
          isWorker
            ? 'bg-emerald-700 dark:bg-emerald-500 text-white hover:bg-emerald-800'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform Scrubber Visualizer */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-0.5 h-6">
          {[40, 75, 30, 90, 60, 100, 45, 80, 50, 70, 95, 35, 65, 85, 40, 90, 55, 30].map((heightPct, idx) => {
            const barPct = (idx / 18) * 100;
            const active = progress >= barPct;
            return (
              <span
                key={idx}
                style={{ height: `${heightPct}%` }}
                className={`flex-1 rounded-full transition-all duration-200 ${
                  active
                    ? isWorker
                      ? 'bg-emerald-800 dark:bg-emerald-200'
                      : 'bg-emerald-600 dark:bg-emerald-400'
                    : 'bg-black/20 dark:bg-white/20'
                }`}
              />
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Volume2 className="w-2.5 h-2.5" />
            Voice Note
          </span>
          <span>{durationText}</span>
        </div>
      </div>
    </div>
  );
};

export const UserFeedback: React.FC = () => {
  const { feedbackMessages, sendFeedback, currentUser, workers } = useStore();
  const [text, setText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState<'image' | 'document' | undefined>(undefined);
  const [showAttachInput, setShowAttachInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Live Voice Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeWorkerId = currentUser?.role === 'worker' ? currentUser.id : (workers[0]?.id || 'KWAME08002026xy');

  const workerFullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : workers.find((w) => w.id === activeWorkerId)?.firstName || 'Worker';

  // Filter messages relevant to this worker thread
  const rawMessages = feedbackMessages.filter((m) => m.workerId === activeWorkerId);

  const filteredMessages = rawMessages.filter((m) =>
    m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [rawMessages.length]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const startVoiceRecording = async () => {
    setShowEmojiPicker(false);
    setShowAttachInput(false);
    audioChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } else {
        // Fallback for iframe/sandboxed environments without audio device access
        setIsRecording(true);
      }
    } catch {
      // Permission denied or missing device - run virtual voice recorder
      setIsRecording(true);
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const stopAndSendVoiceRecording = () => {
    const finalSeconds = recordingSeconds || 4;
    const minutes = Math.floor(finalSeconds / 60);
    const seconds = finalSeconds % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    let recordedAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          recordedAudioUrl = URL.createObjectURL(audioBlob);
        }
        sendFeedback(
          `🎤 Voice note message (${durationStr})`,
          recordedAudioUrl,
          'document',
          activeWorkerId
        );
      };
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    } else {
      // Fallback voice note send
      sendFeedback(
        `🎤 Voice note message (${durationStr})`,
        recordedAudioUrl,
        'document',
        activeWorkerId
      );
    }

    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachmentUrl.trim()) return;
    sendFeedback(text, attachmentUrl || undefined, attachmentType, activeWorkerId);
    setText('');
    setAttachmentUrl('');
    setAttachmentType(undefined);
    setShowAttachInput(false);
    setShowEmojiPicker(false);
  };

  const handleQuickEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      {/* WhatsApp Header Bar */}
      <div className="bg-brand-600 text-white p-4 rounded-t-3xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white flex items-center justify-center font-bold text-lg text-white">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Admin Support Desk</h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
              Official Store Management • Online
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chat..."
            className="w-full pl-8 pr-3 py-1 bg-white/15 focus:bg-white/25 text-white placeholder-white/70 border border-white/20 rounded-full text-xs outline-none transition"
          />
        </div>
      </div>

      {/* WhatsApp Chat Body */}
      <div className="bg-brand-50 dark:bg-slate-950 rounded-b-3xl border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[540px]">
        {/* Messages Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 space-y-2">
              <div className="p-4 rounded-full bg-white/80 dark:bg-slate-800 shadow-xs">
                <MessageSquare className="w-8 h-8 text-brand-600" />
              </div>
              <p className="text-xs font-semibold max-w-sm">
                No chat history found. Start a conversation with the Admin below!
              </p>
            </div>
          ) : (
            filteredMessages.map((m) => {
              const isWorker = m.senderRole === 'worker';
              const timeStr = new Date(m.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              const isVoiceNote = m.message.includes('🎤 Voice note') || m.message.includes('🎤 Admin Voice');

              const senderDisplayName = isWorker ? workerFullName : 'Admin';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isWorker ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {/* WhatsApp Chat Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-md px-3.5 py-2 rounded-2xl text-xs shadow-sm relative group transition-all ${
                      isWorker
                        ? 'bg-brand-100 dark:bg-brand-800 text-slate-900 dark:text-white rounded-tr-none border border-emerald-200/50 dark:border-emerald-800/40'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {/* Header Label inside Bubble */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold ${
                          isWorker
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}
                      >
                        {senderDisplayName}
                      </span>
                    </div>

                    {/* Message Content / Voice Note Player */}
                    {isVoiceNote ? (
                      <VoiceNotePlayer
                        audioUrl={m.attachmentUrl}
                        durationText={m.message.match(/\((.*?)\)/)?.[1] || '0:08'}
                        isWorker={isWorker}
                      />
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.message}</p>
                    )}

                    {/* Attachment preview if standard image/doc */}
                    {m.attachmentUrl && !isVoiceNote && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                        {m.attachmentType === 'image' ? (
                          <a href={m.attachmentUrl} target="_blank" rel="noreferrer">
                            <img
                              src={m.attachmentUrl}
                              alt="Attachment"
                              className="w-full max-h-48 object-cover rounded-xl border border-slate-300 dark:border-slate-600 hover:opacity-90 transition"
                            />
                          </a>
                        ) : (
                          <a
                            href={m.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/10 rounded-xl hover:bg-brand-700/10 transition"
                          >
                            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold truncate text-slate-900 dark:text-white">
                                Attached File / Document
                              </p>
                              <p className="text-[9px] text-slate-500 dark:text-slate-400">Click to view/download</p>
                            </div>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Timestamp & Read Status Ticks */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isWorker
                          ? 'text-emerald-700 dark:text-emerald-200'
                          : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      <span>{timeStr}</span>
                      {isWorker && <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Emoji Strip */}
        {showEmojiPicker && (
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-base">
            {['😊', '👍', '❤️', '🙏', '🛍️', '📦', '✅', '⚡', '💯', '👋'].map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => handleQuickEmoji(e)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition shrink-0"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Attachment URL Bar */}
        {showAttachInput && (
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">Attach URL:</span>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="Paste Image or Document link..."
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setAttachmentType('image')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold ${
                attachmentType === 'image'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Image
            </button>
            <button
              type="button"
              onClick={() => setAttachmentType('document')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold ${
                attachmentType === 'document'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Document
            </button>
          </div>
        )}

        {/* Live Audio Recorder Input Bar OR Standard WhatsApp Chat Input */}
        {isRecording ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-full transition"
                title="Discard Recording"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <span className="w-3 h-3 bg-rose-600 rounded-full animate-ping"></span>
                <span>Recording Voice Note...</span>
                <span className="font-mono bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-md text-rose-700 dark:text-rose-300">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={stopAndSendVoiceRecording}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-full shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>Send Voice Note</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 rounded-full transition"
              title="Insert Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowAttachInput((prev) => !prev)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 rounded-full transition"
              title="Attach Link or Document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            />

            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5 text-rose-500" />
            </button>

            <button
              type="submit"
              className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-md flex items-center justify-center transition"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
