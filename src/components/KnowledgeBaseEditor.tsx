import React, { useState } from 'react';
import { KnowledgeBase, KBDocument, PresentationSlide } from '../types';
import { DEFAULT_KB_OMNIFLOW } from '../utils/kb-engine';
import {
  Search,
  Plus,
  BookOpen,
  FileText,
  CheckCircle2,
  Trash2,
  Edit3,
  Save,
  X,
  Upload,
  Sparkles,
  FileSpreadsheet,
  Presentation,
  RotateCcw,
  Sliders,
  FolderPlus,
  HelpCircle,
} from 'lucide-react';

interface KnowledgeBaseEditorProps {
  knowledgeBase: KnowledgeBase;
  onUpdateKnowledgeBase: (kb: KnowledgeBase) => void;
  slides: PresentationSlide[];
}

export const KnowledgeBaseEditor: React.FC<KnowledgeBaseEditorProps> = ({
  knowledgeBase,
  onUpdateKnowledgeBase,
  slides,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDocId, setActiveDocId] = useState<string>(knowledgeBase.documents[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isIngestingModalOpen, setIsIngestingModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  // Meta editor state
  const [metaName, setMetaName] = useState(knowledgeBase.name);
  const [metaTagline, setMetaTagline] = useState(knowledgeBase.tagline);
  const [metaProductType, setMetaProductType] = useState(knowledgeBase.productType);

  // Form states for add/edit
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<string>('architecture');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editKeyFacts, setEditKeyFacts] = useState('');
  const [editSlideId, setEditSlideId] = useState('');

  // Ingestion system state
  const [ingestRawText, setIngestRawText] = useState('');
  const [ingestFileName, setIngestFileName] = useState('');
  const [ingestCategory, setIngestCategory] = useState<string>('security');
  const [isParsingIngest, setIsParsingIngest] = useState(false);
  const [autoGenSlide, setAutoGenSlide] = useState(true);

  const activeDoc = knowledgeBase.documents.find((d) => d.id === activeDocId) || knowledgeBase.documents[0];

  const filteredDocs = knowledgeBase.documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.keyFacts.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getFormatBadge = (title: string, category: string) => {
    const t = title.toLowerCase();
    if (t.includes('.pdf') || t.includes('audit') || t.includes('soc2') || t.includes('compliance')) {
      return { label: 'PDF Spec', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' };
    }
    if (t.includes('.docx') || t.includes('agreement') || t.includes('contract') || t.includes('sla')) {
      return { label: 'Word Doc', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' };
    }
    if (t.includes('.xlsx') || t.includes('.csv') || t.includes('pricing') || t.includes('benchmark')) {
      return { label: 'Sheet / Data', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
    }
    if (t.includes('.pptx') || t.includes('.ppt') || t.includes('presentation') || t.includes('deck')) {
      return { label: 'Slide Deck', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' };
    }
    return { label: 'Verified Spec', color: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10' };
  };

  const handleStartEdit = (doc: KBDocument) => {
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setCustomCategoryInput('');
    setEditContent(doc.content);
    setEditKeyFacts(doc.keyFacts.join('\n'));
    setEditSlideId(doc.suggestedSlideId || slides[0]?.id || '');
    setIsEditing(true);
    setIsCreatingNew(false);
  };

  const handleStartCreate = () => {
    setEditTitle('');
    setEditCategory('architecture');
    setCustomCategoryInput('');
    setEditContent('');
    setEditKeyFacts('');
    setEditSlideId(slides[0]?.id || '');
    setIsCreatingNew(true);
    setIsEditing(false);
  };

  const handleSaveDoc = () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const finalCategory = customCategoryInput.trim() ? customCategoryInput.trim().toLowerCase() : editCategory;

    const facts = editKeyFacts
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (isCreatingNew) {
      const newDoc: KBDocument = {
        id: `doc-${Date.now()}`,
        title: editTitle,
        category: finalCategory,
        content: editContent,
        keyFacts: facts.length > 0 ? facts : [editTitle],
        suggestedSlideId: editSlideId,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      const updatedDocs = [newDoc, ...knowledgeBase.documents];
      onUpdateKnowledgeBase({ ...knowledgeBase, documents: updatedDocs });
      setActiveDocId(newDoc.id);
      setIsCreatingNew(false);
    } else if (activeDoc) {
      const updatedDocs = knowledgeBase.documents.map((d) =>
        d.id === activeDoc.id
          ? {
              ...d,
              title: editTitle,
              category: finalCategory,
              content: editContent,
              keyFacts: facts.length > 0 ? facts : d.keyFacts,
              suggestedSlideId: editSlideId,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : d
      );
      onUpdateKnowledgeBase({ ...knowledgeBase, documents: updatedDocs });
      setIsEditing(false);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    const updatedDocs = knowledgeBase.documents.filter((d) => d.id !== docId);
    onUpdateKnowledgeBase({ ...knowledgeBase, documents: updatedDocs });
    if (activeDocId === docId) {
      setActiveDocId(updatedDocs[0]?.id || '');
    }
  };

  const handleResetToBlank = () => {
    if (window.confirm('Reset this Knowledge Base to a blank canvas? You can upload your own custom documents.')) {
      onUpdateKnowledgeBase({
        id: `kb-${Date.now()}`,
        name: 'My Custom Product',
        tagline: 'Custom Grounded Knowledge Base',
        productType: 'Enterprise Product',
        documents: [],
        slides: [],
      });
      setActiveDocId('');
      setIsEditing(false);
      setIsCreatingNew(false);
    }
  };

  const handleReloadSampleTemplate = () => {
    onUpdateKnowledgeBase(DEFAULT_KB_OMNIFLOW);
    setActiveDocId(DEFAULT_KB_OMNIFLOW.documents[0].id);
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKnowledgeBase({
      ...knowledgeBase,
      name: metaName.trim() || 'My Product',
      tagline: metaTagline.trim() || 'Product Knowledge Base',
      productType: metaProductType.trim() || 'SaaS',
    });
    setIsMetaModalOpen(false);
  };

  // Multi-format file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIngestFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      setIngestCategory('security');
    } else if (ext === 'docx' || ext === 'doc') {
      setIngestCategory('security');
    } else if (ext === 'xlsx' || ext === 'csv') {
      setIngestCategory('pricing');
    } else if (ext === 'pptx' || ext === 'ppt') {
      setIngestCategory('architecture');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setIngestRawText(content);
      }
    };
    reader.readAsText(file);
  };

  // Ingestion Presets for PDF, Word, Spreadsheets, and PPT
  const handleApplyPresetIngestion = (presetType: 'pdf_audit' | 'word_sla' | 'sheet_pricing' | 'ppt_pitch') => {
    if (presetType === 'pdf_audit') {
      setIngestFileName('SOC2_Type_II_Compliance_Audit.pdf');
      setIngestCategory('security');
      setIngestRawText(`# SOC 2 Type II & FedRAMP High Compliance Certification (PDF)

Auditor: Ernst & Young LLP | Certification Date: 2026-Q1
Scope: Security, Availability, Processing Integrity, and Confidentiality.

Executive Audit Findings:
• Zero Critical Vulnerabilities: 100% of tested controls passed without exception.
• Customer Data Encryption: AES-256 at rest, TLS 1.3 with Perfect Forward Secrecy in transit.
• Data Residency Guarantee: Complete isolated VPC in Frankfurt, Tokyo, or Virginia with zero cross-border telemetry.
• BAA Healthcare Ready: Guaranteed HIPAA Business Associate Agreement signed within 24 hours.
• Disaster Recovery: RPO < 1 second, RTO < 30 seconds with automatic multi-cloud replication.`);
    } else if (presetType === 'word_sla') {
      setIngestFileName('Enterprise_Master_Service_Agreement_SLA.docx');
      setIngestCategory('security');
      setIngestRawText(`# Enterprise Master Service Agreement & 99.99% SLA (DOCX)

Legal Terms & Liability Indemnification Addendum:
• 99.99% Financial Uptime Guarantee: 10% credit for every 30 minutes under 99.99% SLA.
• $5,000,000 Uncapped IP Indemnification: Complete customer indemnity against third-party patent and copyright claims.
• 30-Day Risk-Free POC Credit: Full reimbursement if sub-10ms performance SLA is not met during sandbox evaluation.
• 24/7/365 Dedicated Slack/Teams Engineering Bridge with 15-minute P1 response time.`);
    } else if (presetType === 'sheet_pricing') {
      setIngestFileName('Enterprise_Pricing_Tier_Matrix.xlsx');
      setIngestCategory('pricing');
      setIngestRawText(`# Enterprise Pricing & Competitor Comparison Matrix (XLSX)

Tier | Monthly Price | Execution Quota | Cost Per Extra 10k Executions | SLA | Support
Starter | $4,500/mo | 500,000 | $12.00 | 99.9% | Business Hours
Growth | $9,500/mo | 2,500,000 | $8.00 | 99.95% | 24/7 Slack
Enterprise | $19,500/mo | Unlimited VPC | $0 (Flat Rate) | 99.99% | Dedicated CSM

Commercial Incentives:
• 20% annual upfront commitment discount across all plans.
• Zero data egress fee: No surcharge on API tokens, audio streaming, or model calls.
• 40% more cost-effective than Workato and MuleSoft enterprise tiers.`);
    } else {
      setIngestFileName('OmniFlow_Executive_Product_Architecture.pptx');
      setIngestCategory('architecture');
      setIngestRawText(`# OmniFlow Global Event Architecture & Scalability (PPTX)

Slide 1: Global Edge Routing Fabric
• 45 global edge PoPs with sub-10ms P95 round-trip execution latency.
• Zero-lock actor concurrency handles 450,000 simultaneous webhook triggers.

Slide 2: Enterprise Integration Ecosystem
• Native 2-way sync connectors for Salesforce, SAP S/4HANA, Snowflake, and ServiceNow.
• Microsecond data transforms using sandboxed WASM compute.`);
    }
  };

  const handleExecuteIngestion = async () => {
    if (!ingestRawText.trim()) return;
    setIsParsingIngest(true);

    try {
      const response = await fetch('/api/kb/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: ingestRawText,
          fileName: ingestFileName,
          category: ingestCategory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.document) {
          let updatedSlides = knowledgeBase.slides;
          if (autoGenSlide && data.generatedSlide) {
            updatedSlides = [...knowledgeBase.slides, data.generatedSlide];
          }

          const updatedDocs = [data.document, ...knowledgeBase.documents];
          onUpdateKnowledgeBase({
            ...knowledgeBase,
            documents: updatedDocs,
            slides: updatedSlides,
          });

          setActiveDocId(data.document.id);
          setIsIngestingModalOpen(false);
          setIngestRawText('');
          setIngestFileName('');
          setIsParsingIngest(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Ingestion failed, adding raw markdown locally:', e);
    }

    // Fallback local ingestion
    const lines = ingestRawText.split('\n').filter((l) => l.trim().length > 0);
    const title = ingestFileName || lines[0]?.replace(/[#*`]/g, '').trim() || 'Uploaded Knowledge Document';
    const keyFacts = lines
      .filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || l.includes(':'))
      .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
      .slice(0, 5);

    const newDoc: KBDocument = {
      id: `doc-${Date.now()}`,
      title,
      category: ingestCategory,
      content: ingestRawText,
      keyFacts: keyFacts.length > 0 ? keyFacts : [lines[0]?.slice(0, 100) || title],
      suggestedSlideId: slides[0]?.id || 'slide-1',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onUpdateKnowledgeBase({
      ...knowledgeBase,
      documents: [newDoc, ...knowledgeBase.documents],
    });

    setActiveDocId(newDoc.id);
    setIsIngestingModalOpen(false);
    setIngestRawText('');
    setIngestFileName('');
    setIsParsingIngest(false);
  };

  const categories = Array.from(
    new Set(['all', 'pricing', 'security', 'architecture', 'integration', 'competitors', ...knowledgeBase.documents.map((d) => d.category)])
  );

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-6 pb-24 md:pb-8 flex flex-col gap-6">
      {/* Top Banner / Knowledge Base Overview */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold tracking-wide uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Product Knowledge Base Ingestion System</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-400 normal-case font-mono">{knowledgeBase.documents.length} verified documents</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{knowledgeBase.name}</h1>
            <button
              onClick={() => {
                setMetaName(knowledgeBase.name);
                setMetaTagline(knowledgeBase.tagline);
                setMetaProductType(knowledgeBase.productType);
                setIsMetaModalOpen(true);
              }}
              className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Edit Knowledge Base Name & Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{knowledgeBase.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetToBlank}
            className="px-3 py-2 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
            title="Start from scratch with zero sample documents"
          >
            <span>Start Blank KB</span>
          </button>

          <button
            onClick={handleReloadSampleTemplate}
            className="px-3 py-2 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all border border-slate-200 dark:border-white/10 cursor-pointer flex items-center gap-1.5"
            title="Load default template documents"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Sample Preset</span>
          </button>

          <button
            onClick={() => setIsIngestingModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/[0.08] dark:hover:bg-white/[0.15] dark:text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 border border-slate-700 dark:border-white/10 shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Ingest Document (PDF, Word, Sheet, PPT)</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Spec</span>
          </button>
        </div>
      </div>

      {/* Edit Knowledge Base Profile Modal */}
      {isMetaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Customize Knowledge Base Details</span>
              </div>
              <button
                onClick={() => setIsMetaModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Product Name</label>
                <input
                  type="text"
                  value={metaName}
                  onChange={(e) => setMetaName(e.target.value)}
                  placeholder="e.g. Acme Cloud or Pulse Health"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline / Mission</label>
                <input
                  type="text"
                  value={metaTagline}
                  onChange={(e) => setMetaTagline(e.target.value)}
                  placeholder="e.g. Autonomous Workflow Engine"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Category / Industry</label>
                <input
                  type="text"
                  value={metaProductType}
                  onChange={(e) => setMetaProductType(e.target.value)}
                  placeholder="e.g. Enterprise SaaS, HealthTech, CyberSecurity"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMetaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Format Ingestion Modal */}
      {isIngestingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>Ingest Document, PDF, Word, Sheet or Presentation</span>
              </div>
              <button
                onClick={() => setIsIngestingModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Multi-Format Templates */}
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                Quick Sample Multi-Format Ingestion Presets:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => handleApplyPresetIngestion('pdf_audit')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5" /> 📕 PDF
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">SOC2 Audit Report</div>
                </button>

                <button
                  onClick={() => handleApplyPresetIngestion('word_sla')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5" /> 📘 Word
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Master SLA Contract</div>
                </button>

                <button
                  onClick={() => handleApplyPresetIngestion('sheet_pricing')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> 📊 Sheet
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Pricing Matrix</div>
                </button>

                <button
                  onClick={() => handleApplyPresetIngestion('ppt_pitch')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <Presentation className="w-3.5 h-3.5" /> 📙 PPT
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Architecture Deck</div>
                </button>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50/60 dark:bg-black/30 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".txt,.md,.json,.csv,.pdf,.docx,.doc,.xlsx,.pptx,.ppt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-amber-500 mb-1" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {ingestFileName ? ingestFileName : 'Click to upload or drag & drop (PDF, Word, Excel, PPT, CSV, Markdown)'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Knowledge engine automatically chunks tabular metrics and generates presentation slides
                </span>
              </label>
            </div>

            {/* Category select */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Category</label>
                <select
                  value={ingestCategory}
                  onChange={(e) => setIngestCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="security">Security & Compliance</option>
                  <option value="architecture">Architecture & Infrastructure</option>
                  <option value="pricing">Pricing & Commercial</option>
                  <option value="integration">Integrations & Connectors</option>
                  <option value="competitors">Competitor Battlecards</option>
                  <option value="faq">FAQ</option>
                  <option value="overview">Overview / General</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenSlide}
                    onChange={(e) => setAutoGenSlide(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Auto-generate Pitch Slide from Document</span>
                </label>
              </div>
            </div>

            {/* Raw Text Content */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Extracted Document Content / Text to Ingest
              </label>
              <textarea
                rows={6}
                value={ingestRawText}
                onChange={(e) => setIngestRawText(e.target.value)}
                placeholder="Paste markdown, text, bullet points, or product specifications..."
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setIsIngestingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteIngestion}
                disabled={!ingestRawText.trim() || isParsingIngest}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsingIngest ? 'Ingesting...' : 'Ingest into Knowledge Base'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Document List on Left, Viewer/Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filter and Doc List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search documents, facts, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-amber-500/20 text-slate-900 dark:text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Doc List Items */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === activeDoc?.id && !isCreatingNew;
              const badge = getFormatBadge(doc.title, doc.category);
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setActiveDocId(doc.id);
                    setIsCreatingNew(false);
                    setIsEditing(false);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-white/[0.08] border-amber-500/50 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-white/80 dark:bg-black/30 border-slate-200/90 dark:border-white/[0.06] hover:border-amber-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] tracking-wider">
                        {doc.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums">{doc.lastUpdated}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{doc.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{doc.content}</p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {doc.keyFacts.length} Verified Facts
                    </span>
                    {doc.suggestedSlideId && (
                      <>
                        <span>·</span>
                        <span className="text-slate-400">Linked to Pitch Slide</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 text-xs space-y-3">
                <FolderPlus className="w-8 h-8 text-amber-500 mx-auto" />
                <div className="font-bold text-slate-900 dark:text-white">No documents found</div>
                <p className="max-w-xs mx-auto text-slate-500 dark:text-slate-400">
                  {knowledgeBase.documents.length === 0
                    ? 'This Knowledge Base is blank. Ingest your company documents (PDF, Word, Sheet, PPT) or add a manual spec.'
                    : `No documents matching "${searchQuery}".`}
                </p>
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Document</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Doc Viewer or Form Editor */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 min-h-[540px]">
          {isCreatingNew || isEditing ? (
            /* Editing or Creating Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isCreatingNew ? 'Feed New Product Knowledge' : `Edit: ${editTitle}`}
                </h2>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. SOC2 Compliance & Data Residency"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="architecture">Architecture</option>
                    <option value="pricing">Pricing</option>
                    <option value="security">Security</option>
                    <option value="integration">Integration</option>
                    <option value="competitors">Competitors</option>
                    <option value="faq">FAQ</option>
                    <option value="custom">Other / Custom</option>
                  </select>
                  {editCategory === 'custom' && (
                    <input
                      type="text"
                      placeholder="Type custom category..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="mt-1.5 w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Suggested Presentation Slide</label>
                  <select
                    value={editSlideId}
                    onChange={(e) => setEditSlideId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">No linked slide</option>
                    {slides.map((s) => (
                      <option key={s.id} value={s.id}>
                        Slide {s.number}: {s.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Document Content (Fed into Copilot Reasoning & Presentations)
                </label>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Detailed technical specifications, pricing rules, guarantees, numbers, or SLA details..."
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Key Authoritative Facts (1 per line for quick Copilot citations)
                </label>
                <textarea
                  rows={4}
                  value={editKeyFacts}
                  onChange={(e) => setEditKeyFacts(e.target.value)}
                  placeholder="Sub-15ms execution latency&#10;SOC2 Type II certified&#10;20% annual commitment discount"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDoc}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Knowledge Doc</span>
                </button>
              </div>
            </div>
          ) : activeDoc ? (
            /* Document Preview & Details */
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/10 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px]">
                      {activeDoc.category}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{activeDoc.lastUpdated}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{activeDoc.title}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartEdit(activeDoc)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-white/10 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(activeDoc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Key Facts Strip */}
              <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Grounded Key Facts for Pitching & Presentations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {activeDoc.keyFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Content */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Knowledge Base Content
                </h3>
                <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {activeDoc.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 dark:text-slate-500 text-xs space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-amber-500/40" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Knowledge Base is Empty</div>
              <p className="max-w-xs mx-auto">
                Ingest PDF, Word, Sheet, or PPT documents, or click "Add Manual Spec" to start building your knowledge base.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
