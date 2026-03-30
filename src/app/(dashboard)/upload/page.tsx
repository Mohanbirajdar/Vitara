'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, X, CheckCircle, Loader2, Eye, Save, AlertCircle } from 'lucide-react'

type UploadStage = 'idle' | 'uploading' | 'processing' | 'preview' | 'saved'

interface ExtractedData {
  date: string
  diagnosis: string
  medications: string[]
  doctorNotes: string
  provider: string
  type: string
}

const mockExtract: ExtractedData = {
  date: '2024-02-20',
  diagnosis: 'Acute Sinusitis',
  medications: ['Amoxicillin 500mg TID x 10 days', 'Fluticasone nasal spray 2 sprays daily'],
  doctorNotes: 'Patient presents with 5-day history of facial pressure, nasal congestion, and yellow-green discharge. Tender to palpation over maxillary sinuses. Prescribed antibiotic course. Follow-up in 2 weeks if no improvement.',
  provider: 'Dr. Sarah Park – Urgent Care',
  type: 'visit',
}

export default function UploadPage() {
  const [stage, setStage] = useState<UploadStage>('idle')
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<ExtractedData | null>(null)

  const simulateProcess = async (name: string) => {
    setFileName(name)
    setStage('uploading')
    setProgress(0)

    // Upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 80))
      setProgress(i)
    }

    setStage('processing')
    setProgress(0)

    // OCR progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60))
      setProgress(i)
    }

    setExtracted(mockExtract)
    setEditData(mockExtract)
    setStage('preview')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) simulateProcess(file.name)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) simulateProcess(file.name)
  }

  const handleSave = async () => {
    setStage('saved')
    await new Promise(r => setTimeout(r, 1500))
    setStage('idle')
    setExtracted(null)
    setFileName('')
  }

  const handleReset = () => {
    setStage('idle')
    setExtracted(null)
    setFileName('')
    setProgress(0)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="h-6 w-6 text-indigo-600" />
          Upload Records
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Upload PDFs or images and we&apos;ll digitize them using OCR</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Idle – Drop Zone */}
        {stage === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <label
              onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center w-full min-h-64 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
              }`}
            >
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInput} />

              <motion.div
                animate={{ scale: isDragOver ? 1.1 : 1 }}
                className="flex flex-col items-center gap-3 p-8 text-center"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${isDragOver ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  <Upload className={`h-7 w-7 ${isDragOver ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Drop your file here</p>
                  <p className="text-sm text-slate-400 mt-0.5">or click to browse</p>
                </div>
                <div className="flex gap-2 mt-2">
                  {['PDF', 'JPG', 'PNG'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Max file size: 10MB</p>
              </motion.div>
            </label>

            {/* Supported types */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { icon: FileText, title: 'Lab Results', desc: 'Blood panels, urinalysis, pathology' },
                { icon: Image, title: 'Medical Images', desc: 'X-rays, MRI, CT scan reports' },
                { icon: FileText, title: 'Doctor Notes', desc: 'Visit summaries, referral letters' },
                { icon: FileText, title: 'Prescriptions', desc: 'Medication scripts, pharmacy records' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 flex-shrink-0">
                    <Icon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Processing stages */}
        {(stage === 'uploading' || stage === 'processing') && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mx-auto mb-4">
              <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg mb-1">
              {stage === 'uploading' ? 'Uploading file...' : 'Scanning with OCR...'}
            </h3>
            <p className="text-slate-500 text-sm mb-1 truncate max-w-xs mx-auto">{fileName}</p>
            <p className="text-slate-400 text-xs mb-6">
              {stage === 'uploading'
                ? 'Securely uploading to encrypted storage'
                : 'Extracting text, dates, medications, and diagnoses'}
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-xs text-slate-400">{progress}% complete</p>
          </motion.div>
        )}

        {/* Preview */}
        {stage === 'preview' && extracted && editData && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Success banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">OCR extraction complete</p>
                <p className="text-xs text-emerald-600">Review and edit before saving to your records</p>
              </div>
              <button onClick={handleReset} className="ml-auto text-emerald-500 hover:text-emerald-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Extracted data card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 text-sm">Extracted Data</span>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${editMode ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {editMode ? 'Editing...' : 'Edit'}
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Source badge */}
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">OCR</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{fileName}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</label>
                    {editMode ? (
                      <input
                        type="date"
                        value={editData.date}
                        onChange={e => setEditData(p => p ? { ...p, date: e.target.value } : p)}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-slate-800">{editData.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Provider</label>
                    {editMode ? (
                      <input
                        value={editData.provider}
                        onChange={e => setEditData(p => p ? { ...p, provider: e.target.value } : p)}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-slate-800">{editData.provider}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Diagnosis</label>
                  {editMode ? (
                    <input
                      value={editData.diagnosis}
                      onChange={e => setEditData(p => p ? { ...p, diagnosis: e.target.value } : p)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-800">{editData.diagnosis}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Medications</label>
                  <div className="mt-1.5 space-y-1.5">
                    {editData.medications.map((med, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                        <span className="text-xs font-medium text-blue-700">Rx</span>
                        {editMode ? (
                          <input
                            value={med}
                            onChange={e => {
                              const meds = [...editData.medications]
                              meds[i] = e.target.value
                              setEditData(p => p ? { ...p, medications: meds } : p)
                            }}
                            className="flex-1 bg-transparent text-sm text-blue-800 focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm text-blue-800">{med}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Doctor Notes</label>
                  {editMode ? (
                    <textarea
                      value={editData.doctorNotes}
                      onChange={e => setEditData(p => p ? { ...p, doctorNotes: e.target.value } : p)}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{editData.doctorNotes}</p>
                  )}
                </div>

                {/* Confidence */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    OCR confidence: <span className="font-semibold">87%</span> — Review extracted data before saving. Highlighted fields may need correction.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-4 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
                >
                  <Save className="h-4 w-4" /> Save to Records
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved */}
        {stage === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Record saved!</h3>
            <p className="text-slate-500 text-sm">Your medical record has been digitized and added to your timeline.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
