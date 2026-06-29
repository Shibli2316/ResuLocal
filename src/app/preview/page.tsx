'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResumePreview from '../../components/ResumePreview';
import { ResumeData, StyleSettings, ResumeSectionOrder } from '../../store/resumeStore';
import '../../styles/resumeTemplate.css';

function PreviewContent() {
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [styleSettings, setStyleSettings] = useState<StyleSettings | null>(null);
  const [sectionsOrder, setSectionsOrder] = useState<ResumeSectionOrder[] | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Expose a global method for Puppeteer to inject the data directly
    // This resolves the local storage missing problem in headless contexts
    (window as any).renderResume = (data: ResumeData, style: StyleSettings, sectionsList?: ResumeSectionOrder[]) => {
      setResumeData(data);
      setStyleSettings(style);
      if (sectionsList) {
        setSectionsOrder(sectionsList);
      }
      setLoaded(true);
    };

    // Fallback for manual browser previews: try to load from query param or localStorage
    const manualId = searchParams.get('id');
    if (manualId) {
      try {
        const storeStr = localStorage.getItem('resume-builder-store');
        if (storeStr) {
          const store = JSON.parse(storeStr);
          const target = store.state.resumes.find((r: any) => r.id === manualId);
          if (target) {
            setResumeData(target.data);
            setStyleSettings(target.style);
            setSectionsOrder(target.sections);
            setLoaded(true);
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage in preview page", e);
      }
    }
  }, [searchParams]);

  if (!loaded || !resumeData || !styleSettings) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-slate-400 text-sm font-semibold">
        <span>Loading Print View Canvas...</span>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-start justify-center pt-0">
      {/* Renders only the clean sheet without sliders, banners, or lines */}
      <ResumePreview 
        data={resumeData} 
        style={styleSettings}
        sections={sectionsOrder}
      />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-slate-400 text-sm font-semibold">
        <span>Loading Print View Page...</span>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
