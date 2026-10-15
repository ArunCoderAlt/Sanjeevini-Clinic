import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Upload, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Layers, 
  RefreshCw, 
  Sparkles, 
  Send, 
  BookOpen,
  Eye,
  EyeOff,
  FileCheck,
  Check,
  X,
  Key,
  Save,
  RotateCcw,
  ExternalLink,
  Database,
  Cloud,
  Copy,
  Code,
  Activity,
  BarChart3,
  Clock,
  History,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { 
  getBotStatus, 
  getBotDocuments, 
  uploadBotPdf, 
  deleteBotDocument, 
  toggleBotDocument,
  sendChatMessage,
  updateBotSettings,
  restoreSeedDocument,
  getBotUsage
} from '../../services/botService';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-hot-toast';

const SQL_MIGRATION_TEXT = `-- ==============================================================================
-- 1. Storage Bucket for RAG PDFs
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('rag-documents', 'rag-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==============================================================================
-- 2. Dedicated Table for RAG Documents
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'rag-documents',
  file_size INTEGER DEFAULT 0,
  page_count INTEGER DEFAULT 1,
  chunk_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. Dedicated Table for RAG Knowledge Chunks
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.rag_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER DEFAULT 1,
  section_title TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_id ON public.rag_chunks(document_id);`;

const AVAILABLE_GROQ_MODELS = [
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (Recommended - Ultra Fast, Highly Accurate & Active)' },
  { id: 'openai/gpt-oss-120b', name: 'OpenAI GPT-OSS 120B (Flagship Advanced Reasoning)' },
  { id: 'openai/gpt-oss-20b', name: 'OpenAI GPT-OSS 20B (High-Speed Reasoning)' }
];

export default function AiBotKnowledge() {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, docId: null, docName: '' });

  // SQL Schema modal state
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Groq API Key Settings state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen/qwen3.8-27b');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Groq API Key Usage Telemetry state
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Admin sandbox tester state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_TEXT);
    toast.success('SQL Migration copied to clipboard!');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, docsRes, usageRes] = await Promise.allSettled([
        getBotStatus(),
        getBotDocuments(),
        getBotUsage()
      ]);

      if (statusRes.status === 'fulfilled') {
        const statusData = statusRes.value.data?.data || null;
        setStatus(statusData);
        if (statusData?.groq?.model) {
          setSelectedModel(statusData.groq.model);
        }
        if (statusData?.usage) {
          setUsageData(prev => ({ ...(prev || {}), ...statusData.usage }));
        }
      }

      if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value.data?.data)) {
        setDocuments(docsRes.value.data.data);
      }

      if (usageRes.status === 'fulfilled' && usageRes.value.data?.data) {
        setUsageData(usageRes.value.data.data);
      }
    } catch (err) {
      console.warn('Failed to load AI bot knowledge base data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshUsage = async () => {
    setLoadingUsage(true);
    try {
      const res = await getBotUsage();
      if (res.data?.data) {
        setUsageData(res.data.data);
        toast.success('Token usage & rate limits refreshed');
      }
    } catch (err) {
      console.warn('Failed to refresh usage details:', err);
      toast.error('Could not refresh token usage data');
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleSaveGroqSettings = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim() && !status?.groq?.connected) {
      toast.error('Please enter a valid Groq API key (starts with gsk_...)');
      return;
    }

    setSavingSettings(true);
    try {
      const payload = {
        model: selectedModel
      };
      if (apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await updateBotSettings(payload);
      const groqResult = res.data?.data?.groq;

      if (groqResult?.connected) {
        toast.success(res.data?.message || 'Groq API Key verified & connected successfully!');
      } else {
        toast(res.data?.message || 'Groq settings updated', { icon: '⚠️' });
      }

      setApiKeyInput('');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update Groq settings.';
      toast.error(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please select a valid PDF file (.pdf)');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error('File size exceeds the 15MB limit');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please choose a PDF file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const res = await uploadBotPdf(formData);
      toast.success(res.data?.message || 'PDF uploaded and indexed successfully!');
      setSelectedFile(null);
      const fileInput = document.getElementById('pdf-upload-input');
      if (fileInput) fileInput.value = '';
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to parse and index PDF.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, docId: id, docName: name });
  };

  const confirmDelete = async () => {
    const { docId, docName } = deleteModal;
    if (!docId) return;

    // Optimistically remove from UI immediately
    setDocuments(prev => prev.filter(d => d.id !== docId && d.filename !== docId));

    try {
      await deleteBotDocument(docId);
      toast.success(`"${docName}" removed from knowledge base.`);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete document: ' + (err.response?.data?.message || err.message));
      fetchData();
    } finally {
      setDeleteModal({ isOpen: false, docId: null, docName: '' });
    }
  };

  const handleRestoreSeed = async () => {
    try {
      await restoreSeedDocument();
      toast.success('Default Clinic Portfolio Guide restored to active knowledge!');
      fetchData();
    } catch (err) {
      toast.error('Failed to restore default clinic guide');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleBotDocument(id, !currentStatus);
      toast.success(`Document ${!currentStatus ? 'activated' : 'deactivated'}`);
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
    } catch (err) {
      toast.error('Failed to update document status');
    }
  };

  const handleTestBot = async (e) => {
    e.preventDefault();
    if (!testQuery.trim() || testing) return;

    setTesting(true);
    setTestResult(null);

    try {
      const res = await sendChatMessage(testQuery.trim());
      setTestResult(res.data?.data || null);
    } catch (err) {
      toast.error('Error testing bot response');
    } finally {
      setTesting(false);
    }
  };

  const hasSeedDoc = documents.some(d => d.id.startsWith('seed-'));

  return (
    <div className="space-y-8 font-body max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            AI Chatbot Knowledge Base & PDF RAG Manager
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage your Groq LLM API Key, upload or remove clinic guide PDFs, and inspect real-time RAG answers.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Groq API Key Configuration Card */}
      <div className="bg-gradient-to-br from-white to-[#FAF8F5] p-6 md:p-8 rounded-2xl shadow-sm border border-gold/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary text-white rounded-xl shadow-sm">
              <Key className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                Groq LLM Configuration & API Key
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-semibold border ${
                  status?.groq?.connected 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {status?.groq?.connected ? '● Groq Connected' : '○ Local Fallback Active'}
                </span>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Change your Groq API key or switch models anytime directly from this admin panel.
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-mono bg-white px-3 py-2 rounded-xl border border-gray-200">
            Active Model: <span className="text-primary font-bold">{status?.groq?.model || selectedModel}</span>
          </div>
        </div>

        <form onSubmit={handleSaveGroqSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Key Input */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Groq API Key (starts with gsk_...)
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={status?.groq?.connected ? '•••••••••••••••••••••••••••••••••••••••• (Leave blank to keep current key)' : 'Enter your Groq API Key (e.g. gsk_...)'}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-sm font-mono shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  title={showApiKey ? 'Hide key' : 'Show key'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Get your free API key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">console.groq.com/keys</a>
              </p>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Groq LLM Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm shadow-sm"
              >
                {AVAILABLE_GROQ_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Active production models verified for your Groq API key.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
            <div className="text-xs text-gray-600 flex items-center gap-1.5">
              {status?.groq?.connected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Verified: {status?.groq?.message}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Enter your Groq key above to enable full conversational LLM reasoning.</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing & Saving Key...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Connect Groq Key
                </>
              )}
            </button>
          </div>
        </form>

        {/* ========================================================================= */}
        {/* Groq API Key Token Usage & Live Quota Monitor                             */}
        {/* ========================================================================= */}
        {(() => {
          const activeUsage = usageData?.activeKeyUsage || status?.usage?.activeKeyUsage || null;
          const rateLimits = usageData?.latestReportedRateLimits || status?.usage?.latestReportedRateLimits || null;
          const historicalPeriods = usageData?.historicalKeysUsage || [];
          const historicalCount = usageData?.totalHistoricalKeysCount ?? historicalPeriods.length;

          const formatDate = (dateStr) => {
            if (!dateStr) return '—';
            try {
              return new Date(dateStr).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch {
              return dateStr;
            }
          };

          return (
            <div className="mt-8 pt-6 border-t border-gray-200/80">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-gray-900 tracking-wide uppercase">
                    API Key Token Usage & Live Quota
                  </h3>
                  {activeUsage?.keyVersion && (
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-primary text-white rounded-full shadow-xs">
                      {activeUsage.keyVersion}
                    </span>
                  )}
                  {activeUsage?.keyHint && (
                    <span className="text-xs font-mono text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                      {activeUsage.keyHint}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tracking Active Key
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefreshUsage}
                    disabled={loadingUsage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-xs transition-colors shrink-0"
                    title="Refresh token usage metrics"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingUsage ? 'animate-spin text-primary' : 'text-gray-500'}`} />
                    <span>{loadingUsage ? 'Refreshing...' : 'Refresh Usage'}</span>
                  </button>

                  {historicalCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-xs transition-colors shrink-0"
                    >
                      <History className="w-3.5 h-3.5 text-gold" />
                      <span>Past Keys ({historicalCount})</span>
                      {showHistory ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Active Key 4-Grid Token Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Total Tokens */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Tokens</p>
                    <BarChart3 className="w-4 h-4 text-primary opacity-60" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-primary mt-1.5">
                    {(activeUsage?.totalTokens || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Input + Output</p>
                </div>

                {/* Input Tokens */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Input Tokens</p>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-blue-700 mt-1.5">
                    {(activeUsage?.totalInputTokens || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Prompts & Context Chunks</p>
                </div>

                {/* Output Tokens */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Output Tokens</p>
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-purple-700 mt-1.5">
                    {(activeUsage?.totalOutputTokens || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Generated AI Answers</p>
                </div>

                {/* Total API Requests */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">API Calls</p>
                    <Clock className="w-4 h-4 text-amber-600 opacity-60" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-amber-700 mt-1.5">
                    {(activeUsage?.totalRequests || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Under current key</p>
                </div>
              </div>

              {/* Timestamp Details & Auto-Reset Callout */}
              <div className="mt-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-[11px]">
                  <span>
                    <strong className="text-gray-700">Started:</strong> {formatDate(activeUsage?.firstSeenAt)}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-gray-700">Last Call:</strong> {formatDate(activeUsage?.lastUsedAt)}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700">
                    Zero-Plaintext Storage (SHA-256 fingerprint)
                  </span>
                </div>
              </div>

              {/* Live Rate Limits from Groq Cloud Response Headers */}
              {rateLimits ? (
                <div className="mt-3.5 bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Live Groq Cloud Rate Limits (Org Level)
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      Reset: Req {rateLimits.resetRequests || '—'} / Tokens {rateLimits.resetTokens || '—'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Remaining Requests */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Remaining Requests (RPM)</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {rateLimits.remainingRequests?.toLocaleString()} / {rateLimits.limitRequests?.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.max(5, Math.min(100, (rateLimits.remainingRequests / (rateLimits.limitRequests || 1)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Remaining Tokens */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Remaining Tokens (TPM)</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {rateLimits.remainingTokens?.toLocaleString()} / {rateLimits.limitTokens?.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.max(5, Math.min(100, (rateLimits.remainingTokens / (rateLimits.limitTokens || 1)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs text-gray-600 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    Live Groq Cloud quota headers (RPM & TPM) are read dynamically from Groq responses and will populate here as bot queries run.
                  </span>
                </div>
              )}

              {/* Automatic Tracking Reset Information Note */}
              <div className="mt-3 flex items-start gap-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  <strong className="font-semibold text-amber-950">Automatic Tracking Reset:</strong> When you enter and save a new Groq API key in the form above, the system automatically detects the new key, archives all usage from the current key into history, and starts a fresh tracking period at <strong>0 tokens</strong>.
                </div>
              </div>

              {/* Expandable Historical Key Periods Table */}
              {showHistory && historicalPeriods.length > 0 && (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-gold" />
                    Previous Groq API Key Tracking Periods ({historicalPeriods.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Version</th>
                          <th className="py-2.5 px-3">Key Hint</th>
                          <th className="py-2.5 px-3">Total Tokens</th>
                          <th className="py-2.5 px-3">Input / Output</th>
                          <th className="py-2.5 px-3">Requests</th>
                          <th className="py-2.5 px-3">First Seen</th>
                          <th className="py-2.5 px-3">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {historicalPeriods.map((p) => (
                          <tr key={p.id || p.keyVersion} className="hover:bg-gray-50/60">
                            <td className="py-2 px-3 font-bold text-gray-900">{p.keyVersion}</td>
                            <td className="py-2 px-3 text-gray-500">{p.keyHint}</td>
                            <td className="py-2 px-3 font-semibold text-primary">{(p.totalTokens || 0).toLocaleString()}</td>
                            <td className="py-2 px-3 text-gray-600">
                              {(p.totalInputTokens || 0).toLocaleString()} / {(p.totalOutputTokens || 0).toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-gray-700">{(p.totalRequests || 0).toLocaleString()}</td>
                            <td className="py-2 px-3 text-[11px] text-gray-500 font-sans">{formatDate(p.firstSeenAt)}</td>
                            <td className="py-2 px-3 text-[11px] text-gray-500 font-sans">{formatDate(p.lastUsedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Documents Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-3">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Documents</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</p>
            <p className="text-xs text-green-600 mt-0.5 font-medium">{documents.filter(d => d.is_active).length} In RAG Retrieval</p>
          </div>
        </div>

        {/* Total Chunks Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Knowledge Chunks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{status?.totalChunks || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Indexed paragraphs</p>
          </div>
        </div>

        {/* Cloud PDF Storage Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-start space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">PDF Cloud Storage</p>
            <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5">
              <span>Supabase Storage</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-mono">bucket: rag-documents</p>
          </div>
        </div>

        {/* Supabase Database Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Supabase Table</p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {status?.database?.table || 'rag_documents'}
            </p>
            <p className="text-xs mt-0.5 font-medium text-green-600">
              {status?.database?.isReady ? '● Cloud Synced' : 'Ready for Schema'}
            </p>
          </div>
        </div>
      </div>

      {/* Supabase SQL Migration Banner (if database table not yet executed) */}
      {status?.database && !status.database.isReady && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                Supabase RAG Cloud Storage Active (Bucket: rag-documents)
              </h3>
              <p className="text-xs text-amber-800 mt-1 max-w-3xl leading-relaxed">
                PDF binaries are uploaded directly to your Supabase Storage bucket (<code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-amber-950">rag-documents</code>). To sync knowledge chunks to the dedicated <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-amber-950">rag_documents</code> and <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-amber-950">rag_chunks</code> tables in Supabase, run the quick SQL script in your Supabase SQL Editor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Code className="w-4 h-4" />
              View & Copy SQL Migration
            </button>
          </div>
        </div>
      )}

      {/* PDF Upload Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-serif font-bold text-gray-800">Upload New PDF Document for AI Learning</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Upload any clinic brochure, research paper, doctor bio, or treatment guideline. Our system will extract the text, split it into semantic chunks, and feed it into the chatbot's knowledge retrieval pool.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-8 text-center transition-colors bg-gray-50/50">
            <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
            <div className="text-sm text-gray-600">
              <label htmlFor="pdf-upload-input" className="font-semibold text-primary hover:underline cursor-pointer">
                Click to browse a PDF
              </label>{' '}
              or drag and drop it here
            </div>
            <p className="text-xs text-gray-400 mt-1">Standard Adobe PDF (.pdf) up to 15MB</p>

            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Extracting Text & Generating Chunks...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Train AI Bot
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Indexed Documents Table with REMOVE Buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-800">Active Knowledge Documents</h2>
            <p className="text-sm text-gray-500 mt-1">
              You can remove older documents at any time using the <strong>Remove</strong> buttons below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!hasSeedDoc && (
              <button
                onClick={handleRestoreSeed}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold-900 border border-gold/40 rounded-xl text-xs font-semibold transition-colors"
                title="Restore default clinic guide"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gold-700" />
                Restore Default Clinic Guide
              </button>
            )}
            <span className="px-3 py-1 bg-sage/40 text-primary-800 rounded-full text-xs font-semibold">
              {documents.length} Total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Pages</th>
                <th className="px-6 py-4">Chunks</th>
                <th className="px-6 py-4">Cloud Storage (PDF)</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-center">Active in RAG</th>
                <th className="px-6 py-4 text-right">Remove Older Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    <p className="font-medium text-gray-700">No knowledge documents currently indexed.</p>
                    <p className="text-xs text-gray-500 mt-1">Upload a new PDF above or restore the default clinic guide.</p>
                    <button
                      onClick={handleRestoreSeed}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-light"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore Default Clinic Guide
                    </button>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.original_name || doc.filename}</p>
                          {doc.id.startsWith('seed-') && (
                            <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold-800 font-semibold">
                              Built-in Clinic Portfolio Guide
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '45 KB'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{doc.page_count || 1}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
                        {doc.chunk_count} chunks
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                          title="View PDF stored in Supabase 'rag-documents' bucket"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View PDF</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                          Built-in Guide
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(doc.id, doc.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          doc.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {doc.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Prominent Remove Button for Any Document */}
                      <button
                        onClick={() => handleDeleteClick(doc.id, doc.original_name || doc.filename)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors border border-red-200 hover:border-red-300"
                        title="Remove Document from Knowledge Base"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Testing Sandbox */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-gray-800">Test AI Bot RAG Retrieval Sandbox</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Test any patient question right here to verify that the bot strictly answers from the uploaded documents and displays the retrieved source citations.
        </p>

        <form onSubmit={handleTestBot} className="flex gap-3 mb-6">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. What are the consultation hours on Saturday? or What is Varmam therapy?"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <button
            type="submit"
            disabled={!testQuery.trim() || testing}
            className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shrink-0"
          >
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Test Query
          </button>
        </form>

        {testResult && (
          <div className="bg-cream/40 p-6 rounded-2xl border border-sage/60 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Generated Answer:</p>
              <div className="p-4 bg-white rounded-xl border border-sage text-gray-800 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                {testResult.reply}
              </div>
            </div>

            {testResult.sources && testResult.sources.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Retrieved RAG Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {testResult.sources.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-700 shadow-sm">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{s.document} ({s.section})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

        {/* Supabase SQL Migration Modal */}
        {showSqlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-serif font-bold text-gray-900">
                    Supabase SQL Migration for RAG
                  </h3>
                </div>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 overflow-y-auto">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Run this SQL in your <strong>Supabase Dashboard &gt; SQL Editor &gt; New Query</strong> to enable dedicated table sync for RAG knowledge chunks and PDF storage metadata.
                </p>

                <div className="relative">
                  <pre className="p-4 bg-gray-900 text-gray-100 text-xs font-mono rounded-xl overflow-x-auto max-h-80 leading-relaxed select-all">
                    {SQL_MIGRATION_TEXT}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy SQL
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-light transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy SQL to Clipboard
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Document Removal */}
        <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, docId: null, docName: '' })}
        onConfirm={confirmDelete}
        title="Remove Document from AI Knowledge Base"
        message={`Are you sure you want to remove "${deleteModal.docName}"? The AI chatbot will immediately stop using answers and citations from this document.`}
        confirmText="Remove Document"
        cancelText="Keep Document"
        variant="danger"
      />
    </div>
  );
}
