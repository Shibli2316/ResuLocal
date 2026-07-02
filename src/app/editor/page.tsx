'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Download, Sliders, Sparkles, Layout, 
  FileText, ClipboardList, Scan, Bookmark, Settings2, AlertTriangle, AlertCircle, LayoutTemplate
} from 'lucide-react';
import { 
  Button, Card, Tabs, Switch, Slider, Tooltip, Alert, Space, Divider, message 
} from 'antd';
import { useResumeStore } from '../../store/resumeStore';
import EditorForm from '../../components/EditorForm';
import ResumePreview, { LayoutReport } from '../../components/ResumePreview';
import ContentLibrary from '../../components/ContentLibrary';
import AtsScorePanel from '../../components/AtsScorePanel';
import CoverLetterTab from '../../components/CoverLetterTab';

export default function EditorWorkspace() {
  const router = useRouter();
  const { resumes, currentResumeId, updateResumeStyle, applyTemplateLayout } = useResumeStore();
  const currentResume = resumes.find(r => r.id === currentResumeId);

  // Tracks layout analysis from Preview engine
  const [layoutReport, setLayoutReport] = useState<LayoutReport | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  if (!currentResume) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-sm">
          <AlertCircle className="mx-auto text-amber-500 mb-2" size={36} />
          <h3 className="font-bold text-slate-800 mb-1">No Active Portfolio</h3>
          <p className="text-xs text-slate-500 mb-4">Please return to the dashboard and select a resume to edit.</p>
          <Button type="primary" icon={<ArrowLeft size={14} />} onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const { style, data } = currentResume;

  // Toggle Auto-Fit Layout
  const handleAutoFitChange = (checked: boolean) => {
    updateResumeStyle((draft) => {
      draft.autoFit = checked;
    });
    message.info(checked ? 'Autofit engine enabled' : 'Manual override enabled');
  };

  // Adjust style sliders (Manual override)
  const adjustStyle = (key: any, value: any) => {
    updateResumeStyle((draft) => {
      (draft as any)[key] = value;
    });
  };

  // PDF Export Trigger
  const handleExportPDF = async () => {
    setExportingPdf(true);
    message.loading({ content: 'Generating PDF in shown format...', key: 'exporting', duration: 0 });
    
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeData: currentResume.data, 
          styleSettings: currentResume.style,
          sections: currentResume.sections
        })
      });

      if (!response.ok) {
        throw new Error('Server PDF compilation failed.');
      }

      // Download file stream
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${currentResume.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      message.success({ content: 'PDF Export Complete!', key: 'exporting' });
    } catch (err: any) {
      console.error(err);
      message.error({ content: err.message || 'Failed to export PDF. Check Docker and Chromium configuration.', key: 'exporting', duration: 4 });
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Editor Navbar */}
      <header className="bg-gradient-to-r from-teal-900 to-cyan-950 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Button 
            type="text" 
            icon={<ArrowLeft size={16} className="text-white" />} 
            onClick={() => router.push('/')}
            className="hover:!bg-teal-800"
          />
          <div>
            <h1 className="text-sm font-bold leading-none">{currentResume.title}</h1>
            <span className="text-[10px] text-teal-300">Workspace Editor</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Info Sizing Pill */}
          {layoutReport && (
            <div className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-semibold ${
              layoutReport.isOverflown 
                ? 'bg-red-500/20 border border-red-500/30 text-red-200' 
                : layoutReport.actualPages === 2 
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-200' 
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200'
            }`}>
              <span>Layout Budget:</span>
              <span>
                {layoutReport.isOverflown 
                  ? 'Exceeds 2 Pages!' 
                  : `${layoutReport.actualPages} Page${layoutReport.actualPages > 1 ? 's' : ''}`
                }
              </span>
            </div>
          )}

          <Button 
            type="primary" 
            icon={<Download size={15} />} 
            onClick={handleExportPDF} 
            loading={exportingPdf}
            className="!bg-teal-400 !text-slate-900 hover:!bg-teal-300 font-bold border-0"
          >
            Export PDF
          </Button>
        </div>
      </header>

      {/* Editor Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-50px)]">
        
        {/* Left Side: Form Panels & Tools (5 columns, 41% width roughly) */}
        <div className="lg:col-span-5 bg-white border-r border-slate-200 p-4 overflow-y-auto flex flex-col justify-between">
          <Tabs 
            defaultActiveKey="editor" 
            size="small"
            items={[
              {
                key: 'editor',
                label: (
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <Layout size={13} />
                    Resume Builder
                  </span>
                ),
                children: <EditorForm />
              },
              {
                key: 'library',
                label: (
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <Bookmark size={13} />
                    Content Library
                  </span>
                ),
                children: <ContentLibrary />
              },
              {
                key: 'ats',
                label: (
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <Scan size={13} />
                    ATS Simulator
                  </span>
                ),
                children: <AtsScorePanel />
              },
              {
                key: 'coverletter',
                label: (
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <FileText size={13} />
                    Cover Letter
                  </span>
                ),
                children: <CoverLetterTab />
              }
            ]}
          />
        </div>

        {/* Right Side: Resume Live Canvas Preview (7 columns, 59% width) */}
        <div className="lg:col-span-7 p-6 overflow-y-auto flex flex-col items-center gap-4 bg-slate-200 h-full">
          
          {/* Sizing Warning Banners */}
          {layoutReport && (
            <div className="w-full max-w-[210mm] flex flex-col gap-2">
              {layoutReport.isOverflown && (
                <Alert
                  message="Content Overflow Warning!"
                  description="Your portfolio content exceeds the exact 2-page print limit. Extra text will be clipped. Please reduce paragraphs or remove items."
                  type="error"
                  showIcon
                  icon={<AlertCircle className="text-red-500" size={16} />}
                />
              )}
              {!layoutReport.fitsOnePage && !layoutReport.isOverflown && (
                <Alert
                  message="Resume fits on 2 Pages"
                  description="To fit on exactly 1 page: Trim work/project bullet points, reduce margin spacing manually, or shorten your summary."
                  type="warning"
                  showIcon
                  icon={<AlertTriangle className="text-amber-500" size={16} />}
                  action={
                    <Button 
                      size="small" 
                      type="dashed" 
                      onClick={() => {
                        updateResumeStyle((draft) => {
                          draft.margin = 15;
                          draft.sectionGap = 9;
                          draft.fontSize = 11.5;
                        });
                        message.success('Applied standard tight-page rules!');
                      }}
                    >
                      Apply 1-Page Presets
                    </Button>
                  }
                />
              )}
              {layoutReport.didAutoShrink && layoutReport.fitsOnePage && (
                <Alert
                  message="Auto-Fit Compression Active"
                  description={`The engine adjusted styling variables to force-fit content on a single page.`}
                  type="success"
                  showIcon
                  className="py-1.5"
                />
              )}
            </div>
          )}

          {/* Layout Tuner Toolbar */}
          <Card 
            size="small" 
            className="w-full max-w-[210mm] shadow-sm border-slate-300"
            bodyStyle={{ padding: '8px 16px' }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Switch 
                    checked={style.autoFit} 
                    onChange={handleAutoFitChange} 
                    size="small" 
                  />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Settings2 size={13} />
                    Auto-Fit
                  </span>
                </div>
                <Divider type="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <input 
                    type="color" 
                    value={style.primaryColor || '#3f8890'} 
                    onChange={(e) => adjustStyle('primaryColor', e.target.value)} 
                    className="w-5 h-5 border-0 rounded cursor-pointer p-0 bg-transparent" 
                  />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Theme</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="color" 
                    value={style.metaColor || '#5a6c7d'} 
                    onChange={(e) => adjustStyle('metaColor', e.target.value)} 
                    className="w-5 h-5 border-0 rounded cursor-pointer p-0 bg-transparent" 
                  />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Dates/Meta</span>
                </div>
              </div>
              
              <Divider type="vertical" className="hidden md:block h-6" />

              {/* Spacing adjustments slider */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Font Size</span>
                  <div className="flex items-center gap-1.5">
                    <Slider 
                      min={9} 
                      max={16} 
                      step={0.5}
                      value={style.autoFit && layoutReport ? layoutReport.shrinkLevels.fontSize : style.fontSize}
                      onChange={(val) => adjustStyle('fontSize', val)}
                      disabled={style.autoFit}
                      className="flex-1 m-0 py-1"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 w-8 text-right">
                      {style.autoFit && layoutReport ? layoutReport.shrinkLevels.fontSize : style.fontSize}px
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Line Ht</span>
                  <div className="flex items-center gap-1.5">
                    <Slider 
                      min={1.1} 
                      max={1.8} 
                      step={0.05}
                      value={style.autoFit && layoutReport ? layoutReport.shrinkLevels.lineHeight : style.lineHeight}
                      onChange={(val) => adjustStyle('lineHeight', val)}
                      disabled={style.autoFit}
                      className="flex-1 m-0 py-1"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 w-8 text-right">
                      {style.autoFit && layoutReport ? layoutReport.shrinkLevels.lineHeight : style.lineHeight}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Margins</span>
                  <div className="flex items-center gap-1.5">
                    <Slider 
                      min={10} 
                      max={40} 
                      step={1}
                      value={style.autoFit && layoutReport ? layoutReport.shrinkLevels.margin : style.margin}
                      onChange={(val) => adjustStyle('margin', val)}
                      disabled={style.autoFit}
                      className="flex-1 m-0 py-1"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 w-8 text-right">
                      {style.autoFit && layoutReport ? layoutReport.shrinkLevels.margin : style.margin}px
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Row Gap</span>
                  <div className="flex items-center gap-1.5">
                    <Slider 
                      min={6} 
                      max={25} 
                      step={1}
                      value={style.autoFit && layoutReport ? layoutReport.shrinkLevels.sectionGap : style.sectionGap}
                      onChange={(val) => adjustStyle('sectionGap', val)}
                      disabled={style.autoFit}
                      className="flex-1 m-0 py-1"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 w-8 text-right">
                      {style.autoFit && layoutReport ? layoutReport.shrinkLevels.sectionGap : style.sectionGap}px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Layout Templates Selection Bar */}
          <Card 
            size="small" 
            className="w-full max-w-[210mm] shadow-sm border-slate-300"
            bodyStyle={{ padding: '6px 16px' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                <LayoutTemplate size={13} className="text-teal-600" />
                <span>Apply Layout Preset Template</span>
              </div>
              <Space size="small">
                <Button 
                  size="small" 
                  className="text-[11px] h-7 font-bold hover:!text-teal-600"
                  onClick={() => {
                    applyTemplateLayout(1);
                    message.success('Applied - Default layout preset!');
                  }}
                >
                  Default
                </Button>
                <Button 
                  size="small" 
                  className="text-[11px] h-7 font-bold hover:!text-teal-600"
                  onClick={() => {
                    applyTemplateLayout(2);
                    message.success('Applied - Experience layout preset!');
                  }}
                >
                  Experience
                </Button>
                <Button 
                  size="small" 
                  className="text-[11px] h-7 font-bold hover:!text-teal-600"
                  onClick={() => {
                    applyTemplateLayout(3);
                    message.success('Applied Fresher layout preset!');
                  }}
                >
                  Fresher
                </Button>
              </Space>
            </div>
          </Card>

          {/* Preview Canvas */}
          <div className="flex-1 w-full flex justify-center pb-8">
            <ResumePreview 
              data={data} 
              style={style} 
              isEditable={true}
              onLayoutCalculated={setLayoutReport}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
