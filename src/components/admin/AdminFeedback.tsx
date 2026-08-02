import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  FileText,
  Mic,
  Smile,
  CheckCheck,
  Shield,
  Trash2,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';

// Voice Note Player Component inside Chat Bubble
const VoiceNotePlayer: React.FC<{
  audioUrl?: string;
  durationText?: string;
  isAdminMsg: boolean;
}> = ({ audioUrl, durationText = '0:08', isAdminMsg }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fallbackAudio = audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

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

      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition ${
          isAdminMsg
            ? 'bg-emerald-700 dark:bg-emerald-500 text-white hover:bg-emerald-800'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

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
                    ? isAdminMsg
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

export const AdminFeedback: React.FC = () => {
  const { workers, feedbackMessages, sendFeedback } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [text, setText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState<'image' | 'document' | undefined>(undefined);
  const [showAttachInput, setShowAttachInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatSearch, setChatSearch] = useState('');

  // Voice Recorder State for Admin
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Filter workers list
  const filteredWorkers = workers.filter((w) =>
    `${w.firstName} ${w.lastName} ${w.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeWorker = workers.find((w) => w.id === selectedWorkerId);

  // Filter messages for active selected worker
  const activeThread = feedbackMessages.filter((m) => m.workerId === selectedWorkerId);

  const filteredThread = activeThread.filter((m) =>
    m.message.toLowerCase().includes(chatSearch.toLowerCase())
  );

  // Auto scroll chat thread on message updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeThread.length, selectedWorkerId]);

  // Recording Timer
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
    if (!selectedWorkerId) return;
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
        setIsRecording(true);
      }
    } catch {
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
    if (!selectedWorkerId) return;
    const finalSeconds = recordingSeconds || 4;
    const minutes = Math.floor(finalSeconds / 60);
    const seconds = finalSeconds % 60;
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    let recordedAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          recordedAudioUrl = URL.createObjectURL(audioBlob);
        }
        sendFeedback(
          `🎤 Admin Voice Note (${durationStr})`,
          recordedAudioUrl,
          'document',
          selectedWorkerId
        );
      };
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    } else {
      sendFeedback(
        `🎤 Admin Voice Note (${durationStr})`,
        recordedAudioUrl,
        'document',
        selectedWorkerId
      );
    }

    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !attachmentUrl.trim()) || !selectedWorkerId) return;

    sendFeedback(text, attachmentUrl || undefined, attachmentType, selectedWorkerId);
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
    <div className="space-y-4 max-w-6xl mx-auto font-sans">
      {/* Top Header */}
      <div className="bg-brand-600 text-white p-4 rounded-t-3xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Admin WhatsApp Staff Support</h2>
            <p className="text-xs text-emerald-100">Direct 1-on-1 messaging with store staff and workers</p>
          </div>
        </div>
      </div>

      {/* Main WhatsApp Grid Layout */}
      <div className="bg-brand-50 dark:bg-slate-950 rounded-b-3xl border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[580px]">
        {/* Left Column: Staff Contacts List */}
        <div className="border-r border-slate-300 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
          {/* Search Contacts Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff name or ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Workers List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredWorkers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No workers found</div>
            ) : (
              filteredWorkers.map((w) => {
                const isSelected = w.id === selectedWorkerId;
                const workerMsgs = feedbackMessages.filter((m) => m.workerId === w.id);
                const lastMsg = workerMsgs[workerMsgs.length - 1];

                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWorkerId(w.id);
                      setIsRecording(false);
                    }}
                    className={`w-full p-3 flex items-center gap-3 text-left transition ${
                      isSelected
                        ? 'bg-brand-100 dark:bg-slate-700 border-l-4 border-brand-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                      <img src={w.avatarUrl} alt={w.firstName} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {w.firstName} {w.lastName}
                        </span>
                        {lastMsg && (
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {lastMsg ? lastMsg.message : 'Tap to start conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active WhatsApp Chat Thread */}
        <div className="col-span-2 flex flex-col h-full bg-brand-50 dark:bg-slate-950">
          {activeWorker ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3 px-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-600 shrink-0">
                    <img src={activeWorker.avatarUrl} alt={activeWorker.firstName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {activeWorker.firstName} {activeWorker.lastName}
                    </h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Staff ID: {activeWorker.id} • {activeWorker.phoneNumber || 'Online'}
                    </p>
                  </div>
                </div>

                <div className="relative w-40 sm:w-48">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search in chat..."
                    className="w-full pl-8 pr-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-3"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {filteredThread.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-brand-600" />
                    <p className="text-xs">No messages with {activeWorker.firstName} yet.</p>
                  </div>
                ) : (
                  filteredThread.map((m) => {
                    const isAdminMsg = m.senderRole === 'admin';
                    const timeStr = new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const isVoiceNote = m.message.includes('🎤 Voice note') || m.message.includes('🎤 Admin Voice');

                    const senderDisplayName = isAdminMsg
                      ? 'Admin'
                      : `${activeWorker.firstName} ${activeWorker.lastName}`;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md px-3.5 py-2 rounded-2xl text-xs shadow-xs relative transition-all ${
                            isAdminMsg
                              ? 'bg-brand-100 dark:bg-brand-800 text-slate-900 dark:text-white rounded-tr-none border border-emerald-200/50 dark:border-emerald-800/40'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold ${
                                isAdminMsg
                                  ? 'text-emerald-800 dark:text-emerald-300'
                                  : 'text-orange-600 dark:text-orange-400'
                              }`}
                            >
                              {senderDisplayName}
                            </span>
                          </div>

                          {isVoiceNote ? (
                            <VoiceNotePlayer
                              audioUrl={m.attachmentUrl}
                              durationText={m.message.match(/\((.*?)\)/)?.[1] || '0:08'}
                              isAdminMsg={isAdminMsg}
                            />
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.message}</p>
                          )}

                          {m.attachmentUrl && !isVoiceNote && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                              {m.attachmentType === 'image' ? (
                                <a href={m.attachmentUrl} target="_blank" rel="noreferrer">
                                  <img
                                    src={m.attachmentUrl}
                                    alt="Attached"
                                    className="w-full max-h-40 object-cover rounded-xl hover:opacity-90 transition"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={m.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/10 rounded-xl hover:bg-brand-700/10 transition"
                                >
                                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold truncate">View Attachment</p>
                                  </div>
                                </a>
                              )}
                            </div>
                          )}

                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isAdminMsg ? 'text-emerald-700 dark:text-emerald-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{timeStr}</span>
                            {isAdminMsg && <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Emojis */}
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

              {/* Attachment Input Toggle */}
              {showAttachInput && (
                <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Attachment:</span>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="Attachment Link..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachmentType('image')}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold ${
                      attachmentType === 'image' ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachmentType('document')}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold ${
                      attachmentType === 'document' ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Document
                  </button>
                </div>
              )}

              {/* WhatsApp Chat Input Bar OR Voice Recorder */}
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
                  onSubmit={handleSendReply}
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 rounded-full transition"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAttachInput((prev) => !prev)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 rounded-full transition"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Reply to ${activeWorker.firstName}...`}
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
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a staff member from the left list to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
