import React, { useState } from 'react';
import { KnowledgeBase, KBDocument, PresentationSlide } from '../types';
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
  Layers,
  ArrowUpRight,
  FileCheck,
  FileCode,
  Sparkles,
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

  // Form states for add/edit
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<KBDocument['category']>('architecture');
  const [editContent, setEditContent] = useState('');
  const [editKeyFacts, setEditKeyFacts] = useState('');
  const [editSlideId, setEditSlideId] = useState('');

  // Ingestion system state
  const [ingestRawText, setIngestRawText] = useState('');
  const [ingestFileName, setIngestFileName] = useState('');
  const [ingestCategory, setIngestCategory] = useState<KBDocument['category']>('security');
  const [isParsingIngest, setIsParsingIngest] = useState(false);

  const activeDoc = knowledgeBase.documents.find((d) => d.id === activeDocId) || knowledgeBase.documents[0];

  const filteredDocs = knowledgeBase.documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.keyFacts.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleStartEdit = (doc: KBDocument) => {
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditContent(doc.content);
    setEditKeyFacts(doc.keyFacts.join('\n'));
    setEditSlideId(doc.suggestedSlideId || slides[0]?.id || '');
    setIsEditing(true);
    setIsCreatingNew(false);
  };

  const handleStartCreate = () => {
    setEditTitle('');
    setEditCategory('architecture');
    setEditContent('');
    setEditKeyFacts('');
    setEditSlideId(slides[0]?.id || '');
    setIsCreatingNew(true);
    setIsEditing(false);
  };

  const handleSaveDoc = () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const facts = editKeyFacts
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (isCreatingNew) {
      const newDoc: KBDocument = {
        id: `doc-${Date.now()}`,
        title: editTitle,
        category: editCategory,
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
              category: editCategory,
              content: editContent,
              keyFacts: facts,
              suggestedSlideId: editSlideId,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : d
      );
      onUpdateKnowledgeBase({ ...knowledgeBase, documents: updatedDocs });
      setIsEditing(false);
    }
  };

  const handleDeleteDoc = (id: string) => {
    if (knowledgeBase.documents.length <= 1) return;
    const updatedDocs = knowledgeBase.documents.filter((d) => d.id !== id);
    onUpdateKnowledgeBase({ ...knowledgeBase, documents: updatedDocs });
    if (activeDocId === id) {
      setActiveDocId(updatedDocs[0]?.id || '');
    }
  };

  // Ingestion logic
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIngestFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setIngestRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPresetIngestion = (presetType: 'hipaa' | 'latency' | 'shopify') => {
    if (presetType === 'hipaa') {
      setIngestFileName('HIPAA_Healthcare_Compliance_Addendum.md');
      setIngestCategory('security');
      setIngestRawText(`# Healthcare & HIPAA Regulatory Security Addendum

OmniFlow AI executes healthcare workflow payloads with guaranteed BAA protection.
Key Compliance Guarantees:
• Zero PHI retention: patient identifiers and health records are processed in ephemeral memory and discarded in 0ms.
• Dedicated single-tenant VPC isolation with HITRUST CSF validation.
• End-to-end encryption with customer-controlled KMS keys and hardware security modules (HSM).
• Audit logging retained in tamper-proof WORM storage for 7 years.`);
    } else if (presetType === 'latency') {
      setIngestFileName('Sub10ms_Global_Edge_Performance_Whitepaper.txt');
      setIngestCategory('architecture');
      setIngestRawText(`# Global Edge Routing & Sub-10ms Inference Benchmarks

Performance metrics tested across 45 edge regions:
• P95 cold start latency: 8.4 milliseconds using Firecracker microVM isolates.
• Zero-lock actor fabric supporting 450,000 parallel transactional webhooks.
• Dynamic failover between Frankfurt, Tokyo, and N. Virginia within 120ms without dropped packets.
• Direct fiber cross-connect with AWS Direct Connect and Google Cloud Interconnect.`);
    } else {
      setIngestFileName('Retail_ERP_Connector_Specs.md');
      setIngestCategory('integration');
      setIngestRawText(`# OmniFlow Enterprise Retail & ERP Connectors

Out-of-the-box support for large retail stacks:
• Turnkey connectors for SAP S/4HANA, Shopify Plus, NetSuite, and Salesforce Commerce Cloud.
• Bidirectional sync handles up to 80,000 orders/minute during Black Friday / Cyber Monday.
• Automatic rate limiting backoff and dead-letter queue re-drive guarantees zero dropped orders.
• Native support for custom Python and TypeScript middleware plugins.`);
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
          const updated = [data.document, ...knowledgeBase.documents];
          onUpdateKnowledgeBase({ ...knowledgeBase, documents: updated });
          setActiveDocId(data.document.id);
          setIsIngestingModalOpen(false);
          setIngestRawText('');
          setIngestFileName('');
          setIsParsingIngest(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend ingestion failed, using local parser:', e);
    }

    // Local extraction fallback
    const lines = ingestRawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const title =
      lines[0]?.replace(/^#+\s*/, '') ||
      ingestFileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
      'Ingested Product Document';
    const keyFacts = lines
      .filter((l) => /^[-*•]|\d|%|\$|SLA|SOC|API|BAA/i.test(l))
      .slice(0, 4)
      .map((l) => l.replace(/^[-*•]\s*/, ''));

    const newDoc: KBDocument = {
      id: `doc-ingest-${Date.now()}`,
      title,
      category: ingestCategory,
      content: ingestRawText,
      keyFacts: keyFacts.length > 0 ? keyFacts : [title, 'Ingested knowledge specification'],
      lastUpdated: new Date().toISOString().split('T')[0],
      suggestedSlideId: slides[0]?.id,
    };

    const updated = [newDoc, ...knowledgeBase.documents];
    onUpdateKnowledgeBase({ ...knowledgeBase, documents: updated });
    setActiveDocId(newDoc.id);
    setIsIngestingModalOpen(false);
    setIngestRawText('');
    setIngestFileName('');
    setIsParsingIngest(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner / Knowledge Base Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Product Knowledge Base Ingestion System</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 normal-case font-normal">{knowledgeBase.documents.length} verified documents</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">{knowledgeBase.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{knowledgeBase.tagline}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsIngestingModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Ingest Document / Spec</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Doc</span>
          </button>
        </div>
      </div>

      {/* Ingestion Modal */}
      {isIngestingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Ingest Document, FAQ or Product Specification</span>
              </div>
              <button
                onClick={() => setIsIngestingModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Templates */}
            <div>
              <div className="text-xs text-slate-400 mb-1.5 font-medium">Quick Sample Ingest Templates:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleApplyPresetIngestion('hipaa')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Healthcare HIPAA Addendum
                </button>
                <button
                  onClick={() => handleApplyPresetIngestion('latency')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Global Edge Performance Specs
                </button>
                <button
                  onClick={() => handleApplyPresetIngestion('shopify')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Retail & ERP Specs
                </button>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".txt,.md,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <FileCode className="w-8 h-8 text-amber-400 mb-1" />
                <span className="text-xs font-semibold text-white">
                  {ingestFileName ? ingestFileName : 'Click to upload or drag & drop .txt, .md, .json'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Knowledge engine will automatically chunk and extract key facts
                </span>
              </label>
            </div>

            {/* Category select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Category</label>
              <select
                value={ingestCategory}
                onChange={(e) => setIngestCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="security">Security & Compliance</option>
                <option value="architecture">Architecture & Infrastructure</option>
                <option value="pricing">Pricing & Commercial</option>
                <option value="integration">Integrations & Connectors</option>
                <option value="competitors">Competitor Battlecards</option>
                <option value="faq">FAQ</option>
              </select>
            </div>

            {/* Raw Text Content */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Document Content / Text to Ingest
              </label>
              <textarea
                rows={6}
                value={ingestRawText}
                onChange={(e) => setIngestRawText(e.target.value)}
                placeholder="Paste markdown, text, bullet points, or product specifications..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsIngestingModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteIngestion}
                disabled={!ingestRawText.trim() || isParsingIngest}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsingIngest ? 'Ingesting...' : 'Ingest into Knowledge Base'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Document List on Left, Viewer/Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Left Column: Filter and Doc List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search documents, facts, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/70"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'pricing', 'security', 'architecture', 'integration', 'competitors'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-amber-400 font-medium border border-amber-400/30'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Doc List Items */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === activeDoc?.id && !isCreatingNew;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setActiveDocId(doc.id);
                    setIsCreatingNew(false);
                    setIsEditing(false);
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/50 ring-1 ring-amber-500/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-medium text-amber-400 uppercase text-[10px] tracking-wider">
                      {doc.category}
                    </span>
                    <span className="font-mono text-[11px]">{doc.lastUpdated}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug">{doc.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{doc.content}</p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> {doc.keyFacts.length} Verified Facts
                    </span>
                    {doc.suggestedSlideId && (
                      <>
                        <span>·</span>
                        <span className="text-slate-400">Linked to Slide</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-xs">
                No documents found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Doc Viewer or Form Editor */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 min-h-[500px]">
          {isCreatingNew || isEditing ? (
            /* Editing or Creating Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-base font-semibold text-white">
                  {isCreatingNew ? 'Feed New Product Knowledge' : `Edit: ${editTitle}`}
                </h2>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. SOC2 Compliance & Data Residency"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="architecture">Architecture</option>
                    <option value="pricing">Pricing</option>
                    <option value="security">Security</option>
                    <option value="integration">Integration</option>
                    <option value="competitors">Competitors</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Suggested Presentation Slide</label>
                  <select
                    value={editSlideId}
                    onChange={(e) => setEditSlideId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {slides.map((s) => (
                      <option key={s.id} value={s.id}>
                        Slide {s.number}: {s.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Document Content (Fed into Copilot Reasoning & Presentations)
                </label>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Detailed technical specifications, pricing rules, guarantees, numbers, or SLA details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Key Authoritative Facts (1 per line for quick Copilot citations)
                </label>
                <textarea
                  rows={4}
                  value={editKeyFacts}
                  onChange={(e) => setEditKeyFacts(e.target.value)}
                  placeholder="Sub-15ms execution latency&#10;SOC2 Type II certified&#10;20% annual commitment discount"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDoc}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Knowledge Doc</span>
                </button>
              </div>
            </div>
          ) : activeDoc ? (
            /* Document Preview & Details */
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
                      {activeDoc.category}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{activeDoc.lastUpdated}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{activeDoc.title}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartEdit(activeDoc)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(activeDoc.id)}
                    disabled={knowledgeBase.documents.length <= 1}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Key Facts Strip */}
              <div className="my-5 p-4 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Grounded Key Facts for Pitching & Presentations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {activeDoc.keyFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Content */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Knowledge Base Content
                </h3>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {activeDoc.content}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
