# SAM Application — User Prompts Archive & Project History

This document contains the chronological record of all user prompts, specifications, and directives for the **SAM** application project.

---

## Prompt 1: Initial Repository & Environment Setup
**Context:** Project initialization with TypeScript, React 19, Tailwind CSS v4, Express server, and Google GenAI SDK.
```
Here is the full initial file tree for the application:
/.env.example
/.gitignore
/index.html
/metadata.json
/package.json
/src/App.tsx
/src/index.css
/src/main.tsx
/tsconfig.json
/vite.config.ts

The following dependencies are installed:
@google/genai: ^2.4.0
@tailwindcss/vite: ^4.3.3
@vitejs/plugin-react: ^6.1.1
dotenv: ^17.2.3
express: ^4.21.2
lucide-react: ^0.546.0
motion: ^12.23.24
react: ^19.0.1
react-dom: ^19.0.1
vite: ^8.3.0
```

---

## Prompt 2: Core Concept Proposal
**User Request:**
> "ok so i am thinking of creating an application with same concept as cluely but we can show translation , give presentation by exactly telling about our product knowledge base feeded , also on google meet so translating to our preferred language in real-time."

**Key Requirements:**
- Real-time translation during sales calls and meetings.
- Grounded presentation generation driven directly from a fed product knowledge base.
- Meeting co-pilot translating spoken conversation to a preferred language in real-time.

---

## Prompt 3: Functional Specifications & Provider Integration
**User Request:**
> "Develop a real-time translation engine for the application. This engine should be able to listen to a Google Meet call, identify the spoken language, and translate it into a user-selected preferred language. The translated text should be displayed alongside the original in the call interface.
> 
> Design and implement a presentation generation module. This module should take input from the product knowledge base and user-defined parameters (e.g., topic, duration) to create structured presentations. It should be able to incorporate key information and talking points derived from the knowledge base.
> 
> Create a knowledge base ingestion system for the application. Users should be able to upload documents, FAQs, or product specifications. The application should then be able to access this knowledge base to generate informative presentations and answer user queries about the products. and yes remember our application can be able to integrate with the google gemini , teams , zoom and others too and get me proper interface with proper ui and ux design and i will get you the openrouter key so it can work locally also"

**Key Requirements:**
- Real-time translation engine with source language detection and user-selected target language.
- Presentation generator utilizing product knowledge base with customizable duration, topic, and talking points.
- Multi-format knowledge base ingestion (documents, specs, FAQs).
- Integration support for Google Gemini, OpenRouter, and meeting platforms.
- Professional UI/UX design.

---

## Prompt 4: Decoupling from Meeting Platforms & Local LLM Support
**User Request:**
> "no need to show google meet or any other meeting simulation ...i just want an application and rest i will look myself and test on the real applications and make its name sam not cluely meet and give option to connect ai providers api keys and even local llms ollam and lm studio"

**Key Requirements:**
- Brand name: **SAM** (not "Cluely Meet").
- Decoupled HUD: Standalone production copilot tool ready to use alongside any meeting tool or audio input.
- AI Provider Connectivity: Direct connection for user API keys (Google Gemini, OpenRouter) and local LLMs (Ollama at `localhost:11434`, LM Studio at `localhost:1234`).

---

## Prompt 5: Error Resolution & Fallback Resilience
**User Request:**
> "Fix the errors in the app
> [AIS_METADATA_SECTION_START]
> fix_it_trigger: manual
> error 0: Copilot assist error: ApiError: {"error":{"code":429,"message":"You exceeded your current quota..."
> [AIS_METADATA_SECTION_END]"

**Key Requirements:**
- Resilient multi-provider failover handling when API quotas (HTTP 429) are reached.
- Real-time semantic fallback to local embedding/keyword knowledge base retrieval without crashing.
- Live quota and latency testing for each configured provider.

---

## Prompt 6: UI Refinement & Glassmorphism Aesthetic
**User Request:**
> "firstlly work on better ui , color grading premium with glassmorphism effects , and take reference from cluely how there interactive page looks"

**Key Requirements:**
- High-end glassmorphism design with backdrop filters, frosted translucent borders, and subtle glows.
- Interactive layout inspired by Cluely's modern live HUD interface.
- Crisp typography and micro-interactions.

---

## Prompt 7: Mobile Responsiveness, Tri-Part Sales Guidance & Document Ingestion
**User Request:**
> "make sure its completely web responsive too ...and also prepare its mobile application too...so for sales call what to speak , how and when exactly based on realtime conversation it should do that effectively , knowledge base can be taken from pdf , word docs , sheets ,ppt properly make sure of that"

**Key Requirements:**
- Full mobile responsiveness with PWA installability and touch target optimization (>= 48px).
- **Tri-Part Real-Time Sales Guidance**:
  1. **WHAT to speak**: Precise talking points, objection handles, counter-propositions grounded in KB.
  2. **HOW to speak**: Tone, pacing, keywords to emphasize, psychological framing.
  3. **WHEN to speak**: Micro-timing cues, conversation phase (Discovery, Objection, Closing, Rapport), urgency meter.
- Comprehensive document ingestion supporting PDF, Word (.docx), Excel/Sheets (.xlsx, .csv), and PowerPoint (.pptx).

---

## Prompt 8: Research Optimization & Parakeet AI Color Grading
**User Request:**
> "use open source github resources , research papers , internet to optimize the application architecture or system design effectively and efficiently , make sure ui and ux must be of top notch ...use light color grading take references from cluely and Parakeet AI....."

**Key Requirements:**
- System architecture optimized with efficient vector/BM25 retrieval and streaming response pipelines.
- Color grading inspired by **Parakeet AI** and **Cluely**: warm crisp off-whites (`#f8fafc`), soft slate accents (`#0284c7`, `#059669`, `#4f46e5`), subtle inner shadows, and clean toggleable dark mode (`#07080c`).
- Top-notch UX with live audio visualization, multi-column copilot HUD, and zero artificial latency.

---

## Prompt 9: Dynamic Architecture & Prompt Preservation
**User Request:**
> "no hardcoded part and put my all past prompts in one doc and keep it in ref directory"

**Key Requirements:**
- **Zero hardcoded data**:
  - Full dynamic management of Knowledge Base (blank canvas creation, custom KB title/description, add/edit/delete any document, custom categories).
  - Dynamic API key entry in UI with instant persistence for Google Gemini, OpenRouter, Ollama, LM Studio.
  - Dynamic simulation scenarios: user can create, edit, save, and delete custom counterparty speech scenarios, plus use real microphone or arbitrary typed text in any language.
  - Dynamic retrieval & generation: all fallback and online AI responses are synthesized strictly from user-provided KB documents.
  - Dynamic target languages: searchable and expandable.
- All historical prompts preserved in `/ref/all_user_prompts.md`.
