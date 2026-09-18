# Explainer Maker 

> A modular AI-powered content house for researching, scripting, designing, narrating, and rendering short-form explainer videos automatically.

Explainer Maker is a **modular content-generation pipeline** designed for creators who want to turn an idea or a trending topic into a polished short-form video with minimal manual work.

The system separates **research, reasoning, content generation, visual composition, audio generation, rendering, and post-processing** into independent modules. This makes the platform reusable, configurable, and easy to extend with new AI models, research providers, TTS engines, and video renderers.

---

##  Vision

The goal is to build an automated content house for an AI-focused social media channel.

The system should be able to:

```text
Topic / Discovery
       ↓
Research
       ↓
Source Selection
       ↓
Research & Fact Extraction
       ↓
User Approval
       ↓
Script Generation
       ↓
Storyboard Generation
       ↓
Voice Generation
       ↓
Visual Composition
       ↓
Video Rendering
       ↓
Preview / AI Editing
       ↓
Export
```

A user should eventually be able to enter something like:

> "Explain the latest AI coding agents in 45 seconds."

and receive a complete vertical video containing:

* Hook
* Narration
* Animated text
* Images/screenshots
* Code/terminal visuals
* Captions
* Transitions
* Sources
* CTA

---

#  Core Design Principle

The most important architectural decision is:

> **AI should generate structured content specifications, not directly generate renderer-specific video code.**

The application will maintain its own intermediate representation called **Storyboard JSON**.

```text
LLM
 ↓
Storyboard JSON
 ↓
Renderer Adapter
 ├── Remotion
 ├── HyperFrames
 └── Future Renderer
```

This prevents the entire application from becoming dependent on a single video-generation technology.

---

#  High-Level Architecture

```text
                    ┌─────────────────────┐
                    │      Web UI         │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     API Server      │
                    │   Node + Express    │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        Discovery          Research          Content AI
             │                 │                 │
             ▼                 ▼                 ▼
        Search APIs      Crawl4AI /        Script Generator
                        Browserbase
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │  Research Packet    │
                    └──────────┬──────────┘
                               │
                         User Approval
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Storyboard JSON   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         Visual Engine       TTS          Captions/Timing
              │                │                │
              ▼                ▼                ▼
        Remotion /         Kokoro /        Alignment
        HyperFrames        Piper /          Data
                           ElevenLabs
              │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Render Pipeline   │
                    │ Remotion/HyperFrames│
                    └──────────┬──────────┘
                               ▼
                          FFmpeg
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Final MP4 Export   │
                    │    1080 × 1920      │
                    └─────────────────────┘
```

---

#  Final Tech Stack

## Frontend

### React + TypeScript

Used for:

* Dashboard
* Research interface
* Source selection
* Script editor
* Storyboard editor
* Video preview
* Scene/element selection
* AI editing interface
* Export configuration

React is also useful because **Remotion uses React as its composition model**.

---

## Styling

### Tailwind CSS

Used for:

* Application UI
* Dashboard
* Forms
* Cards
* Timeline interface
* Configuration panels
* Responsive layouts

---

# Backend

## Node.js + TypeScript

The backend will coordinate the different modules and external providers.

Responsibilities:

* API endpoints
* Authentication
* Project management
* Research orchestration
* AI provider calls
* TTS orchestration
* Render jobs
* File management
* Export jobs
* Provider configuration

---

## Express.js

Express will initially be used as the API layer.

Example:

```text
/api/projects
/api/research
/api/scripts
/api/storyboards
/api/tts
/api/render
/api/export
```

The backend should remain modular enough that Express can later be replaced without changing the core business logic.

---

# Database

## Supabase

Supabase (managed Postgres) will store:

* Users
* Projects
* Research packets
* Sources
* Scripts
* Storyboards
* Render jobs
* Provider configurations
* Export history
* Version history

Supabase fits the project because it auto-scales without infrastructure management and gives built-in auth, storage, and realtime out of the box, reducing custom backend work. Document-shaped data such as **Storyboard JSON** is stored as `jsonb` columns rather than requiring a document database.

---

#  AI Layer

The AI layer should not be tightly coupled to one model.

Instead, create an abstraction:

```text
LLMProvider
 ├── OpenAI
 ├── Gemini
 ├── Anthropic
 └── Local Model
```

Example interface:

```ts
interface LLMProvider {
  generateText(input: string): Promise<string>;

  generateStructured<T>(
    input: string,
    schema: unknown
  ): Promise<T>;
}
```

This allows the application to switch models without rewriting the rest of the pipeline.

---

#  Research Layer

Research is treated as an independent module.

```text
ResearchProvider
 ├── Search
 ├── Crawl4AI
 ├── Browserbase / Stagehand
 └── Future providers
```

## Crawl4AI

Primary candidate for:

* Web crawling
* HTML → clean content
* Markdown extraction
* LLM-oriented web research
* Self-hosted workflows

## Browserbase + Stagehand

Useful for websites that require:

* JavaScript execution
* Browser interaction
* Dynamic content
* Structured extraction
* More complex browsing workflows

The two approaches are complementary rather than mutually exclusive.

---

#  Research Pipeline

```text
User Topic
    ↓
Search
    ↓
Candidate Sources
    ↓
User Selects Sources
    ↓
Fetch / Crawl
    ↓
Clean Content
    ↓
Extract Facts
    ↓
Cross-check Claims
    ↓
Generate Research Packet
    ↓
User Approval
```

The research system should preserve the original sources rather than only storing an AI-generated summary.

---

#  Research Packet

The research module produces a structured object:

```json
{
  "topic": "AI Coding Agents",
  "summary": "...",
  "claims": [
    {
      "id": "claim-1",
      "text": "...",
      "sourceIds": ["source-1"],
      "confidence": 0.94
    }
  ],
  "sources": [
    {
      "id": "source-1",
      "title": "...",
      "url": "...",
      "domain": "..."
    }
  ],
  "openQuestions": [],
  "notes": []
}
```

This creates a clean boundary between **research** and **content generation**.

---

#  Content Generation

The content generation layer converts the approved research packet into:

```text
Research Packet
       ↓
Script
       ↓
Storyboard JSON
```

The script should contain:

* Hook
* Main explanation
* Supporting facts
* Examples
* Conclusion
* CTA

---

#  Storyboard JSON

Storyboard JSON is the central format of the entire rendering system.

Example:

```json
{
  "video": {
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "scenes": [
    {
      "id": "scene-1",
      "duration": 5,
      "narration": "AI just changed the way developers write code.",
      "elements": [
        {
          "id": "headline",
          "type": "text",
          "text": "AI JUST CHANGED CODING",
          "animation": "slideUp"
        },
        {
          "id": "terminal",
          "type": "terminal",
          "code": "npm install agent",
          "animation": "type"
        }
      ]
    }
  ]
}
```

---

#  Visual Component System

Instead of allowing the LLM to create arbitrary visuals, the application will provide reusable components.

Initial component library:

```text
HookText
BigNumber
ImageReveal
CodeBlock
Terminal
BrowserWindow
TweetCard
SourceCard
Comparison
Timeline
Diagram
Logo
Quote
BulletList
ProgressBar
Caption
CTA
```

Example:

```text
Storyboard
   │
   ├── HookText
   ├── BrowserWindow
   ├── CodeBlock
   ├── ImageReveal
   ├── Comparison
   └── CTA
```

This makes AI-generated videos much more reliable and consistent.

---

#  Video Rendering

Two rendering technologies will be supported behind a common interface.

```text
RendererProvider
      │
      ├── RemotionRenderer
      │
      └── HyperFramesRenderer
```

## Remotion

Remotion uses React to create programmatic videos.

Useful for:

* React-based visual components
* Animations
* Parameterized videos
* Server-side rendering
* Interactive preview
* Reusable component systems
* Editor-style workflows

Official website:

https://www.remotion.dev/

### Why it fits this project

The project already uses React, and the visual component library can directly become a Remotion component library.

---

#  HyperFrames

HyperFrames is an open-source HTML-based video rendering framework.

It converts HTML compositions into deterministic frame-by-frame video.

Useful for:

* AI-generated HTML compositions
* Agent-generated visuals
* HTML/CSS animations
* GSAP
* Lottie
* Deterministic rendering
* Docker-based rendering

Official documentation:

https://hyperframes.app/docs/1-startup/1-introduction

### Why it is important

HyperFrames is particularly interesting for an AI-first system because an LLM can generate structured HTML-based compositions without having to understand a large custom rendering API.

---

#  Renderer Strategy

Rather than immediately committing the entire project to one renderer, the system will maintain:

```ts
interface RendererProvider {
  render(storyboard: Storyboard): Promise<RenderResult>;
  preview(storyboard: Storyboard): Promise<PreviewResult>;
}
```

Then:

```text
Storyboard JSON
       │
       ├───────────────┐
       ▼               ▼
 Remotion          HyperFrames
 Renderer            Renderer
       │               │
       └───────┬───────┘
               ▼
          RenderResult
```

A small benchmark video will be created in both systems before final production commitment.

---

#  Cloud Rendering Alternatives

## Shotstack

Shotstack provides a managed video rendering API based around JSON editing instructions.

Useful when:

* Cloud rendering is preferred
* Infrastructure should be minimized
* AI agents need a video-generation API
* Browser-based editing is required

It also provides an MCP integration and Studio SDK.

Official website:

https://shotstack.io/

## Creatomate

Creatomate provides template-based and programmatic rendering.

Useful for:

* Template-heavy content
* Automated social media videos
* JSON-based rendering
* Large-scale content generation

Official website:

https://creatomate.com/

These are considered **cloud alternatives**, not the initial core renderer.

---

#  Audio / TTS

TTS is also abstracted:

```text
TTSProvider
 ├── Kokoro
 ├── Piper
 └── ElevenLabs
```

---

#  Local TTS

## Kokoro

Kokoro is a strong candidate for local/browser-based TTS.

Advantages:

* Local execution possibilities
* No mandatory cloud API
* Suitable for experimentation
* Useful for low-cost development

Repository:

https://github.com/hexgrad/kokoro

## Piper

Piper is another lightweight local/offline TTS option.

It can be used when:

* Offline execution is important
* Low resource usage is preferred
* Cloud API costs need to be avoided

---

#  Cloud TTS

## ElevenLabs

ElevenLabs is an optional high-quality cloud provider.

One particularly useful capability is **speech timing/alignment data**.

The TTS endpoint can return character-level timestamps, and alignment capabilities can provide word-level timing.

This is important for:

* Captions
* Word highlighting
* Text animations
* Audio/video synchronization

Official documentation:

https://elevenlabs.io/docs

---

#  Audio Synchronization Decision

The LLM should **not be the final authority for exact audio timing**.

Instead:

```text
LLM
 ↓
Semantic Scene Timing
 ↓
TTS
 ↓
Actual Audio
 ↓
Alignment / Timestamp Data
 ↓
Final Animation Timing
```

The LLM can decide:

> "This sentence should appear in scene 2."

But the actual timestamp should come from the generated audio/alignment system.

This prevents animation drift.

---

#  Media Processing

## FFmpeg

FFmpeg will be used as the media processing layer rather than the primary video composition engine.

Responsibilities:

* Audio normalization
* Audio/video muxing
* Format conversion
* Resizing
* Compression
* Thumbnail generation
* Concatenation
* Final export processing

```text
Renderer
   ↓
Raw Video
   ↓
FFmpeg
   ↓
Final Export
```

---

#  AI-Powered Editing

One of the key features is **element-level editing**.

Instead of regenerating the entire video when the user says:

> "Change this terminal animation."

the system should identify the relevant element:

```text
Scene 3
 ├── headline
 ├── terminal ← selected
 ├── logo
 └── caption
```

The AI can then modify only that element.

Example:

```text
User:
"Change the terminal command to npm install openai"

        ↓

AI

        ↓

Scene 3
terminal.code
```

Only Scene 3 needs to be regenerated.

---

# 🆔 Scene & Element IDs

Every scene and visual element must have a stable ID.

```json
{
  "sceneId": "scene-3",
  "elements": [
    {
      "id": "terminal-1",
      "type": "terminal"
    },
    {
      "id": "headline-1",
      "type": "text"
    }
  ]
}
```

This is essential for future AI editing.

---

#  Preview System

The preview UI should allow users to:

* Play/pause
* Scrub timeline
* Select scene
* Select element
* Edit text
* Replace assets
* Ask AI for modifications
* Regenerate a scene
* Compare versions

Future architecture:

```text
Video Preview
     │
     ├── Scene Selection
     ├── Element Selection
     ├── Property Editing
     └── AI Command
```

---

#  Export

Initial target:

```text
Instagram Reels
YouTube Shorts
TikTok
Custom
```

Default:

```text
Resolution: 1080 × 1920
Aspect Ratio: 9:16
FPS: 30
Format: MP4
Codec: H.264
Audio: AAC
```

Future export presets can support different aspect ratios.

---

#  Provider Architecture

The application should use provider interfaces wherever external technology may change.

```text
providers/

├── llm/
│   ├── openai/
│   ├── gemini/
│   └── anthropic/
│
├── research/
│   ├── crawl4ai/
│   └── browserbase/
│
├── tts/
│   ├── kokoro/
│   ├── piper/
│   └── elevenlabs/
│
├── renderer/
│   ├── remotion/
│   └── hyperframes/
│
└── export/
    └── ffmpeg/
```

The rest of the application should communicate with interfaces instead of directly calling provider SDKs.

---

#  Proposed Project Structure

```text
explainer-maker/
│
├── apps/
│   ├── web/
│   │   └── React + TypeScript
│   │
│   ├── api/
│   │   └── Node + Express
│   │
│   └── renderer/
│       ├── remotion/
│       └── hyperframes/
│
├── packages/
│   ├── types/
│   ├── storyboard/
│   ├── components/
│   ├── providers/
│   ├── prompts/
│   ├── research/
│   ├── media/
│   └── utils/
│
├── workers/
│   ├── research-worker/
│   ├── tts-worker/
│   └── render-worker/
│
├── docs/
│   ├── architecture/
│   ├── research/
│   └── benchmarks/
│
├── docker/
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

#  Complete Content Pipeline

```text
┌──────────────────┐
│ User enters topic│
│ OR discovery mode│
└────────┬─────────┘
         ↓
┌──────────────────┐
│     Research     │
│ Search + Crawl   │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Source Selection │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Research Packet  │
│ Facts + Sources  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│   User Approval  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Script Generator │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Storyboard JSON  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│       TTS        │
│ Kokoro/Piper/EL  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Audio Alignment  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Visual Renderer  │
│ Remotion / HF    │
└────────┬─────────┘
         ↓
┌──────────────────┐
│     Preview      │
└────────┬─────────┘
         ↓
┌──────────────────┐
│   AI Editing     │
│ Scene/Element    │
└────────┬─────────┘
         ↓
┌──────────────────┐
│      FFmpeg      │
└────────┬─────────┘
         ↓
┌──────────────────┐
│   Final Export   │
└──────────────────┘
```

---

#  MVP Scope

The first version will intentionally remain small.

## MVP Features

* [ ] User enters a topic
* [ ] Search web sources
* [ ] Select sources
* [ ] Crawl/extract source content
* [ ] Generate research packet
* [ ] User approves research
* [ ] Generate 30–45 second script
* [ ] Generate storyboard
* [ ] Generate TTS
* [ ] Generate captions
* [ ] Render 4–7 scenes
* [ ] Preview video
* [ ] Regenerate individual scenes
* [ ] Export 1080×1920 MP4

---

#  Not Part of MVP

The following will be postponed:

* Instagram auto-posting
* Autonomous publishing
* Full Canva-like editor
* Complex multi-agent architecture
* Music generation
* Avatar/lip-sync system
* Image-generation pipeline
* Advanced analytics
* Trend prediction
* Large-scale cloud rendering
* 10+ AI providers
* Automatic social-media growth optimization

The goal is to first make the **core research → content → video pipeline reliable**.

---

#  Renderer Benchmark

Before locking the renderer, create the same test video using:

1. Remotion
2. HyperFrames
3. Shotstack

### Benchmark video

Example:

> **"What is an AI Agent?"**

Approximately 30 seconds containing:

* Hook
* Large animated text
* Browser window
* Terminal
* Code block
* Image
* Voice
* Captions
* Transition
* CTA

### Benchmark criteria

```text
Development speed
AI generation quality
Preview experience
Rendering speed
Audio synchronization
Caption synchronization
Scene replacement
Element-level editing
React integration
HTML integration
Local rendering
Docker support
Deployment complexity
Cost
Licensing
Extensibility
```

The benchmark results will determine the final production renderer.

---

#  Current Technology Decisions

| Area              | Primary                | Alternative                  |
| ----------------- | ---------------------- | ---------------------------- |
| Frontend          | React + TypeScript     | —                            |
| Styling           | Tailwind CSS           | —                            |
| Backend           | Node.js + Express      | —                            |
| Database          | Supabase (Postgres)    | Self-hosted PostgreSQL later if required |
| LLM               | Provider abstraction   | OpenAI / Gemini / Anthropic  |
| Research          | Crawl4AI               | Browserbase + Stagehand      |
| Storyboard        | Custom JSON schema     | —                            |
| Renderer          | Remotion               | HyperFrames                  |
| Cloud Renderer    | —                      | Shotstack                    |
| Template Renderer | —                      | Creatomate                   |
| Local TTS         | Kokoro                 | Piper                        |
| Cloud TTS         | ElevenLabs             | —                            |
| Alignment         | TTS/alignment provider | ElevenLabs                   |
| Media Processing  | FFmpeg                 | —                            |
| UI                | React                  | —                            |
| Video Format      | MP4/H.264              | WebM/MOV                     |
| Target Format     | 1080×1920              | Custom presets               |

---

#  Future Roadmap

## Phase 1 — Core Pipeline

```text
Research
→ Script
→ Storyboard
→ TTS
→ Render
→ Export
```

## Phase 2 — Editing

```text
Scene editing
Element selection
AI modification
Version history
```

## Phase 3 — Content Automation

```text
Topic discovery
Trend monitoring
Scheduled generation
Content queue
```

## Phase 4 — Publishing

```text
Instagram
YouTube
TikTok
Automatic publishing
```

## Phase 5 — Intelligence

```text
Performance analytics
Content feedback
Topic recommendations
Audience analysis
Adaptive content generation
```

---

#  Configuration

External services should be configured through environment variables.

Example:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM
OPENAI_API_KEY=
GEMINI_API_KEY=

# Research
BROWSERBASE_API_KEY=

# TTS
ELEVENLABS_API_KEY=

# Storage
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Rendering
REMOTION_LICENSE_KEY=
```

Provider-specific variables should only be required when that provider is enabled.

---

#  Important Architectural Decisions

### 1. Own the intermediate format

The project should own **Storyboard JSON** rather than depending directly on Remotion or HyperFrames.

### 2. Keep providers replaceable

AI models, research tools, TTS engines, and renderers should be replaceable.

### 3. Make scenes independently renderable

A change to Scene 4 should not require rendering Scenes 1–3 again.

### 4. Use real audio timing

LLM-generated timestamps are semantic estimates. Actual audio/alignment data should determine final animation timing.

### 5. Treat FFmpeg as infrastructure

FFmpeg handles media processing and finalization, while Remotion/HyperFrames handle visual composition.

### 6. Human approval remains in the loop

Research should be reviewable before the system generates the final content.

### 7. Structured generation over free-form generation

The AI should generate:

```text
JSON
↓
Validated Schema
↓
Known Visual Components
↓
Renderer
```

rather than unrestricted renderer code.

---

#  Long-Term Vision

The final system should behave like a **content production operating system** rather than a simple AI video generator.

```text
                EXPLAINER MAKER

     ┌─────────────┐
     │  Discovery  │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │  Research   │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │   Writing   │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │ Storyboard  │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │   Design    │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │    Voice    │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │   Render    │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │    Edit     │
     └──────┬──────┘
            ↓
     ┌─────────────┐
     │   Publish   │
     └─────────────┘
```

The architecture is intentionally designed so that every stage can evolve independently without rebuilding the entire system.

---

##  Initial Development Priority

Build in this order:

```text
1. Project + Provider architecture
2. Research module
3. Research Packet
4. Script generator
5. Storyboard schema
6. Visual component library
7. Remotion prototype
8. HyperFrames benchmark
9. TTS integration
10. Audio alignment
11. Preview
12. Scene-level regeneration
13. FFmpeg export
14. Cloud deployment
```

The first milestone is **not** "generate a perfect AI video."

The first milestone is:

> **Given a topic, reliably produce one accurate, editable, 30–45 second vertical explainer video from research to MP4.**
