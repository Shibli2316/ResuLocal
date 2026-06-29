# 🏗️ Architecture Design & Tech Stack

This document details the system layers, architecture, data flows, and layout algorithms utilized in the **AI-Driven Resume & Cover Letter Builder**.

---

## 🛠️ The Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend Core** | Next.js 15 (App Router), React 19, TypeScript | Page routing, client-side rendering, layout boundaries |
| **UI Components** | Ant Design (AntD v5), Lucide Icons | Form fields, modals, sliders, tabs, toggles |
| **Styling System** | Vanilla CSS + CSS Variables, TailwindCSS | CSS variables allow direct DOM modifications during auto-fitting |
| **State Layer** | Zustand + Immer + Persist | Global state tree with localStorage sync & automatic migrations |
| **Print Backend** | Headless Puppeteer (headless Chrome) | Compiles custom pixel-perfect A4 pages to standard PDFs |
| **Orchestration** | Docker, Docker Compose | Installs Chrome binaries, provisions environment, builds routes |

---

## 📦 Architectural Layers

```mermaid
graph TD
    subgraph UI Layer
        EditorWorkspace[Editor Workspace: app/editor/page.tsx]
        EditorForm[Editor Forms: EditorForm.tsx]
        CanvasPreview[Canvas Sheet: ResumePreview.tsx]
        Dashboard[Dashboard: app/page.tsx]
    end

    subgraph State Layer
        ZustandStore[Zustand Store: store/resumeStore.ts]
        BrowserStorage[(Local Storage)]
    end

    subgraph Compiler Backend
        ExportRoute[Export API: app/api/export-pdf/route.ts]
        HeadlessChrome[Puppeteer Browser Sandbox]
        PrintView[Print View: app/preview/page.tsx]
    end

    EditorForm -->|mutates state| ZustandStore
    ZustandStore -->|subscribes & re-renders| CanvasPreview
    ZustandStore -->|subscribes & re-renders| EditorWorkspace
    ZustandStore <-->|auto-syncs| BrowserStorage

    EditorWorkspace -->|triggers download| ExportRoute
    ExportRoute -->|launches| HeadlessChrome
    HeadlessChrome -->|visits| PrintView
    ExportRoute -->|evaluates data payload| PrintView
    PrintView -->|renders clean A4 layout| CanvasPreview
    HeadlessChrome -->|saves A4 PDF buffer| ExportRoute
    ExportRoute -->|returns PDF download stream| EditorWorkspace
```

---

## 🔄 Sequence Flows

### 1. The PDF Export Cycle
When exporting the resume, Puppeteer loads a serverless browser and connects to a clean `/preview` route. Since localStorage is inaccessible in headless browsers, we use a custom evaluate callback to inject the layout state directly into the browser tab's global context:

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as User
    participant Editor as Editor UI
    participant Route as Next API (export-pdf)
    participant Chrome as Puppeteer Sandbox
    participant Print as Print Preview Page
    
    Recruiter->>Editor: Click "Export PDF"
    Editor->>Route: POST /api/export-pdf (payload: resumeData, styleSettings, sections)
    Route->>Chrome: Launch Headless Browser (no-sandbox)
    Route->>Chrome: Navigate to http://localhost:3000/preview
    Chrome->>Print: Mount React application
    Print->>Chrome: Expose window.renderResume method in useEffect
    Route->>Chrome: page.evaluate(window.renderResume(data, style, sections))
    Chrome->>Print: Update state & calculate height rules
    Route->>Chrome: page.waitForSelector('.resume-page-canvas')
    Route->>Chrome: page.pdf({ format: 'A4', printBackground: true })
    Chrome->>Route: Return binary PDF Buffer
    Route->>Chrome: Close browser instance
    Route->>Editor: Send PDF file blob stream
    Editor->>Recruiter: Trigger browser save dialog (Shibli_Resume.pdf)
```

---

## ⚡ Key Layout Algorithms

### 1. Single-Page A4 Budgeting (Auto-Fit)
The core layout engine in `ResumePreview.tsx` contains an iterative budget loop that matches content bounds to standard A4 printing constraints. 

```
┌──────────────────────────────────────────────────────────┐
│              Calculate el.scrollHeight                   │
├─────────────────────────────────────────────┬────────────┤
│   Height <= 1122px (Fits 1 page)            │ Yes (Exit) │
├─────────────────────────────────────────────┼────────────┤
│   Is autoFit active?                        │ No (Exit)  │
├─────────────────────────────────────────────┴────────────┤
│   Loop steps 1 to 10:                                    │
│   - decrease font-size   (by 0.35px)                     │
│   - decrease margins     (by 1.2px)                      │
│   - decrease line-height (by 0.015)                      │
│   - decrease row gaps    (by 0.6px)                      │
│   Apply CSS Variables on canvas element                  │
│                                                          │
│   Does scrollHeight <= 1122px?              │ Yes (Break)│
└─────────────────────────────────────────────┴────────────┘
```

### 2. Canvas HTML5 Drag-and-Drop
The canvas handles vertical and cross-column reordering natively:
*   Standard HTML5 elements are wrapped in `draggable={isEditable}`.
*   Moving sections sets local component coordinates and tracks drag-over dropzones.
*   Dropping dispatch updates coordinates using `reorderSections(draggedId, targetId, column)` which shifts indexes inside Zustand.
