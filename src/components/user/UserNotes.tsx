import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, StickyNote, ArrowLeft, Trash2, Edit3, Check, Loader2 } from 'lucide-react';
import { Note } from '../../types';

export const UserNotes: React.FC = () => {
  const { notes, saveNote, deleteNote } = useStore();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'processing' | 'saved'>('idle');

  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const startNewNote = () => {
    setActiveNote(null);
    setTitle('');
    setBody('');
    setSaveStatus('idle');
  };

  const openNote = (n: Note) => {
    setActiveNote(n);
    setTitle(n.title);
    setBody(n.body);
    setSaveStatus('saved');
  };

  // Auto-save logic: triggers after 3 seconds of typing inactivity
  const handleContentChange = (newTitle: string, newBody: string) => {
    setTitle(newTitle);
    setBody(newBody);
    setSaveStatus('processing');

    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      if (newTitle.trim() || newBody.trim()) {
        const saved = saveNote(activeNote ? activeNote.id : null, newTitle, newBody);
        setActiveNote(saved);
        setSaveStatus('saved');
      }
    }, 3000); // 3 seconds autosave
  };

  const handleManualSave = () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (title.trim() || body.trim()) {
      const saved = saveNote(activeNote ? activeNote.id : null, title, body);
      setActiveNote(saved);
      setSaveStatus('saved');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600">
            <StickyNote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Notes Scratchpad</h2>
            <p className="text-xs text-slate-500">Auto-saved personal reminders and shift logs</p>
          </div>
        </div>

        {activeNote || title || body ? (
          <button
            onClick={startNewNote}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notes List</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setActiveNote({ id: '', userId: '', title: '', body: '', lastEditedAt: '' });
              setTitle('');
              setBody('');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add a Note</span>
          </button>
        )}
      </div>

      {/* Editor view when creating or editing a note */}
      {activeNote !== null || title !== '' || body !== '' ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={startNewNote}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-500 uppercase">
                {activeNote?.id ? 'Editing Note' : 'New Note'}
              </span>
            </div>

            {/* Auto-save status indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {saveStatus === 'processing' && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleManualSave}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Save Note
              </button>
            </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => handleContentChange(e.target.value, body)}
            placeholder="Note Title..."
            className="w-full px-4 py-2 text-lg font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <textarea
            value={body}
            onChange={(e) => handleContentChange(title, e.target.value)}
            rows={10}
            placeholder="Type note content here... (Autosaves after 3 seconds of typing)"
            className="w-full p-4 text-sm font-normal bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      ) : (
        /* Notes Preview List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 space-y-2">
              <StickyNote className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium">No saved notes yet. Click "Add a Note" above to write one!</p>
            </div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3 hover:border-orange-500 transition"
              >
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{n.title || 'Untitled Note'}</h4>
                  <p className="text-xs text-slate-500 line-clamp-3">{n.body || 'No text content...'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(n.lastEditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openNote(n)}
                      className="p-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg transition"
                      title="Open"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
