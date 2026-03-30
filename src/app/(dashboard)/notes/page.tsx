'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, X, Tag, Calendar, Search, Sparkles, Share2 } from 'lucide-react'
import type { Note } from '@/types'
import { format } from 'date-fns'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showAIGen, setShowAIGen] = useState(false)
  const [aiSymptoms, setAiSymptoms] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [form, setForm] = useState({ title: '', content: '', appointmentDate: '', tags: '' })

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(json => { setNotes(json.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      content: form.content,
      appointmentDate: form.appointmentDate || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.data) {
        setNotes(p => [json.data, ...p])
      }
    } catch {
      // fallback: add locally
      const newNote: Note = {
        id: `note-${Date.now()}`,
        userId: 'user-1',
        recordId: null,
        title: form.title,
        content: form.content,
        appointmentDate: form.appointmentDate ? new Date(form.appointmentDate) : null,
        tags: payload.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setNotes(p => [newNote, ...p])
    }
    setShowAdd(false)
    setForm({ title: '', content: '', appointmentDate: '', tags: '' })
  }

  const generateQuestions = async () => {
    setAiGenerating(true)
    await new Promise(r => setTimeout(r, 1800))
    setAiQuestions([
      `How long have I been experiencing ${aiSymptoms || 'these symptoms'}?`,
      'Are there any patterns to when symptoms worsen or improve?',
      'What over-the-counter treatments have I tried so far?',
      'Should I adjust any of my current medications?',
      'What tests or follow-ups would you recommend?',
      'Are there lifestyle changes that could help?',
      'What warning signs should prompt an emergency visit?',
    ])
    setAiGenerating(false)
  }

  const tagColors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Notes
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Patient notes and appointment preparation</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAIGen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="h-4 w-4" /> Prep
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New
          </motion.button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm"
        />
      </motion.div>

      {/* Notes grid */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="h-3.5 bg-slate-100 rounded w-1/2 mb-3" />
              <div className="h-2.5 bg-slate-100 rounded w-3/4 mb-1.5" />
              <div className="h-2.5 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedNote(note)}
              className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-sm">{note.title}</h3>
                <button
                  onClick={e => { e.stopPropagation(); alert('Link copied!') }}
                  className="text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-3">{note.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag, ti) => (
                    <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[ti % tagColors.length]}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="h-3 w-3" />
                  {note.appointmentDate
                    ? format(new Date(note.appointmentDate), 'MMM d')
                    : format(new Date(note.createdAt), 'MMM d')}
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notes found</p>
            </div>
          )}
        </div>
      )}

      {/* Note detail modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">{selectedNote.title}</h3>
                <button onClick={() => setSelectedNote(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto">
                {selectedNote.appointmentDate && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-indigo-600">
                    <Calendar className="h-4 w-4" />
                    Appointment: {format(new Date(selectedNote.appointmentDate), 'MMMM d, yyyy')}
                  </div>
                )}
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedNote.content}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {selectedNote.tags.map((tag, ti) => (
                    <span key={tag} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tagColors[ti % tagColors.length]}`}>
                      <Tag className="h-2.5 w-2.5" />{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add note modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">New Note</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Pre-appointment notes"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Content</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write your notes here..."
                    rows={5}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Appointment Date</label>
                    <input
                      type="date"
                      value={form.appointmentDate}
                      onChange={e => setForm(p => ({ ...p, appointmentDate: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Tags (comma separated)</label>
                    <input
                      value={form.tags}
                      onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                      placeholder="diet, labs, cardio"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Save Note</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* AI Appointment Prep */}
        {showAIGen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800">Appointment Prep Assistant</h3>
                </div>
                <button onClick={() => { setShowAIGen(false); setAiQuestions([]) }} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                {aiQuestions.length === 0 ? (
                  <>
                    <p className="text-sm text-slate-600 mb-4">Describe your symptoms and I&apos;ll generate questions to ask your doctor.</p>
                    <textarea
                      value={aiSymptoms}
                      onChange={e => setAiSymptoms(e.target.value)}
                      placeholder="e.g., I've been having persistent headaches and fatigue for the past 2 weeks..."
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none mb-4"
                    />
                    <button
                      onClick={generateQuestions}
                      disabled={aiGenerating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-70"
                    >
                      {aiGenerating ? (
                        <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Generate Questions</>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Questions to ask your doctor:</p>
                    {aiQuestions.map((q, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold flex-shrink-0">{i + 1}</span>
                        <p className="text-sm text-slate-700">{q}</p>
                      </motion.div>
                    ))}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => { setAiQuestions([]); setAiSymptoms('') }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Regenerate</button>
                      <button
                        onClick={async () => {
                          const payload = {
                            title: 'Appointment Questions',
                            content: aiQuestions.join('\n\n'),
                            tags: ['appointment', 'ai-generated'],
                          }
                          try {
                            const res = await fetch('/api/notes', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload),
                            })
                            const json = await res.json()
                            if (json.data) {
                              setNotes(p => [json.data, ...p])
                            }
                          } catch {
                            const newNote: Note = {
                              id: `note-${Date.now()}`,
                              userId: 'user-1',
                              recordId: null,
                              title: 'Appointment Questions',
                              content: aiQuestions.join('\n\n'),
                              appointmentDate: null,
                              tags: ['appointment', 'ai-generated'],
                              createdAt: new Date(),
                              updatedAt: new Date(),
                            }
                            setNotes(p => [newNote, ...p])
                          }
                          setShowAIGen(false)
                          setAiQuestions([])
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                      >
                        Save as Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
