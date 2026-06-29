# 🚀 AI-Driven Resume & Cover Letter Builder

Welcome to the **AI-Driven Resume & Cover Letter Builder**, a sophisticated local workspace designed to build, edit, audit, and compile print-perfect resumes and matching cover letters.

This application runs entirely on your local machine and utilizes an intelligent **Single-Page A4 Budgeting Engine** that automatically fits content into an exact page boundary.

---

## ✨ Key Features

### 1. Dynamic Drag-and-Drop Canvas
*   **HTML5 Drag-and-Drop:** Directly drag and reorder sections (Education, Work Experience, Skills, etc.) between the left and right columns on the live preview canvas.
*   **Column Snapping:** Rearrange your document on-the-fly to balance whitespace.

### 2. Pre-designed Layout Templates
*   **Three Preset Templates:** Instantly reorganize your column hierarchies by applying preset templates:
    *   *Template 1:* Classic left-heavy work/academic priority.
    *   *Template 2:* Extra space for organizations and projects.
    *   *Template 3:* Left-heavy project focus.

### 3. Customizable Typography & Colors
*   **Independent Picker Controls:** Individually adjust your primary **Theme Color** and the **Dates/Metadata Color** (governing locations, timelines, and subheadings).
*   **Visual Hierarchy:** Clean font-weight differentiation (Headers `900`, Titles `800`, Sub-metadata `700`) matching modern professional resumes.

### 4. Clickable PDF Contact Links
*   **Anchor Mapping:** Add custom URLs and matching display labels (e.g. `github.com/shibli`) for Email, GitHub, LinkedIn, and custom links.
*   **Clickable Anchors:** Exported PDF files retain full link clickability.

### 5. Custom Sections Creator
*   **Structural Flex:** Add custom sections in either column and render them as either timeline entries, comma-separated pill tags (like skills), or paragraphs.

### 6. AI Co-Pilot & ATS Analysis
*   **ATS Optimization Scanner:** Scan resumes against target job descriptions to identify missing keywords and check formatting compliance.
*   **AI Cover Letter Writer:** Automatically draft targeted cover letters based on your selected resume profile and the job posting.
*   **Content Library:** Save variations of bullet points, summaries, and skills to quickly swap them in and out.

---

## 🔑 Configuring the Gemini AI API Key

To enable the automated AI cover letter builder and ATS keyword scanning features, you need to configure your Google Gemini API key:

1. Obtain a free API key from the [Google AI Studio](https://aistudio.google.com/).
2. Create a file named `.env` in the root folder of the project.
3. Add your key to the file:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

*Note: Next.js will read this key automatically when running locally, and Docker Compose will forward it into the running container.*

---

## 🚀 How to Run the App

You can launch the app locally either using **Docker Compose** (recommended) or **Node.js**.

### Option A: Using Docker (Recommended)
This is the simplest way to run the application, as it automatically provisions the Chromium browser binary required for Puppeteer PDF printing:

1.  Make sure you have Docker and Docker Compose installed.
2.  Launch the environment:
    ```bash
    docker-compose up --build
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Using Node.js locally
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Step-by-Step User Guide

### 1. Creating and Managing Resumes
*   On the dashboard home page, click **Create New Resume** or edit the seeded **Ahmad - Working Student** template.
*   You can delete custom resumes, rename them, and save multiple copies of your profile.

### 2. Customizing Styles & Auto-Fit
*   **Auto-Fit to 1 Page:** Toggle the **Auto-Fit** switch in the layout bar. The application will run a layout budgeting loop, gradually compressing padding, margins, gaps, and font size in real-time until your resume fits exactly onto a single page without overflowing.
*   **Manual Spacing Sliders:** Turn off Auto-Fit to manually adjust font sizes, line heights, page margins, and section spacing.

### 3. Dragging & Reordering Sections
*   Hover over any section on the right-hand **Preview Canvas**. 
*   A grab handle and a dashed border will appear.
*   Click and drag the section card. You will see empty dropzones snap open at the bottom of the columns.
*   Drop the section in your desired location to update the layout instantly.

### 4. Adding Contact Links
*   In the **Contact Info** form tab, click **Add Link**.
*   Select the link type (e.g. GitHub), enter the display label (what will show on the sheet), and the destination URL.
*   Clicking **Export PDF** will generate an A4 document with clickable links.

### 5. Swapping Content using the Library
*   Whenever you edit experience bullet points or summaries, you will see a **Save to Library** bookmark icon next to the input.
*   Save text snippets to your local Content Library, and click the **Bookmark/Library** button to quickly fetch and paste saved variations for targeted job applications.
