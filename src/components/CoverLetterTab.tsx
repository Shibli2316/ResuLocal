'use client';

import React, { useState } from 'react';
import { 
  FileText, Sparkles, Copy, Check, Download, AlertTriangle, 
  Globe, Building2, UserCheck, MailOpen, AlertCircle, RefreshCw 
} from 'lucide-react';
import { Card, Input, Button, Alert, message, Space, Divider, Tag, Typography } from 'antd';
import { useResumeStore } from '../store/resumeStore';

const { TextArea } = Input;

export default function CoverLetterTab() {
  const { resumes, currentResumeId } = useResumeStore();
  const currentResume = resumes.find(r => r.id === currentResumeId);

  const [jobDescription, setJobDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Dynamic translations and text containers
  const [englishLetter, setEnglishLetter] = useState('');
  const [germanLetter, setGermanLetter] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [isGermanActive, setIsGermanActive] = useState(false);

  // Extracted job data
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [personResponsible, setPersonResponsible] = useState('');
  
  // CV suggestions to improve match rate
  const [cvSuggestions, setCvSuggestions] = useState<string[]>([]);
  
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!currentResume) {
      message.error('Please select a resume first');
      return;
    }
    if (!jobDescription.trim()) {
      message.warning('Please enter the target Job Description first');
      return;
    }

    setGenerating(true);
    // Reset translation toggles and suggestions
    setIsGermanActive(false);
    
    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription
        })
      });

      if (!response.ok) {
        throw new Error('AI Generation failed. Check server status and API credentials.');
      }

      const result = await response.json();
      
      setEnglishLetter(result.coverLetter);
      setGermanLetter(result.coverLetterGerman);
      setActiveLetter(result.coverLetter); // Default is English
      
      setCompanyName(result.companyName);
      setContactEmail(result.contactEmail);
      setPersonResponsible(result.personResponsible);
      setCvSuggestions(result.cvSuggestions || []);

      message.success('Cover Letter and layout analysis generated successfully!');
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Failed to generate cover letter');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle Translation
  const handleToggleTranslation = () => {
    if (isGermanActive) {
      setActiveLetter(englishLetter);
      setIsGermanActive(false);
      message.info('Switched view to English draft');
    } else {
      setActiveLetter(germanLetter);
      setIsGermanActive(true);
      message.info('Translated cover letter view to German');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeLetter);
    setCopied(true);
    message.success('Copied current text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyValue = (value: string, label: string) => {
    if (!value || value === 'Not Found') {
      message.warning(`Cannot copy: ${label} value is empty or not found.`);
      return;
    }
    navigator.clipboard.writeText(value);
    message.success(`Copied ${label} to clipboard!`);
  };

  // Plain text export
  const handleExportTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([activeLetter], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const suffix = isGermanActive ? 'DE' : 'EN';
    element.download = `CoverLetter_${currentResume?.title || 'Draft'}_${suffix}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card 
      title={
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <FileText size={16} className="text-teal-600" />
          <span>AI Cover Letter Architect</span>
        </div>
      }
      size="small"
      className="shadow-sm border-slate-200 h-full flex flex-col"
      bodyStyle={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex flex-col gap-3 flex-1">
        
        {/* Job description input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-bold">Target Job Description</label>
          <TextArea 
            rows={4} 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            placeholder="Paste target job listing keywords, contact details, responsibilities, and requirements here..."
            className="text-xs"
            disabled={generating}
          />
        </div>

        <Button 
          type="primary" 
          icon={<Sparkles size={14} />} 
          onClick={handleGenerate} 
          loading={generating}
          className="bg-teal-600 hover:bg-teal-700 border-teal-600"
          block
        >
          {generating ? 'Drafting Custom Letter & Extracting Meta...' : 'Generate Target Cover Letter'}
        </Button>

        {activeLetter && (
          <div className="flex flex-col gap-3 mt-1 flex-1 overflow-y-auto max-h-[55vh] pr-1">
            
            {/* Extracted Contact / Company Metadata */}
            <Card size="small" className="bg-slate-50 border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Extracted Job Contact Metadata
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 shrink-0">Company Name:</span>
                    <strong className="text-slate-700 truncate">{companyName}</strong>
                  </div>
                  <Button 
                    size="small" 
                    type="text" 
                    icon={<Copy size={11} />} 
                    onClick={() => handleCopyValue(companyName, 'Company Name')}
                    className="text-slate-400 hover:text-teal-600 flex items-center justify-center h-6 w-6"
                  />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <UserCheck size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 shrink-0">Person Responsible:</span>
                    <strong className="text-slate-700 truncate">{personResponsible}</strong>
                  </div>
                  <Button 
                    size="small" 
                    type="text" 
                    icon={<Copy size={11} />} 
                    onClick={() => handleCopyValue(personResponsible, 'Person Responsible')}
                    className="text-slate-400 hover:text-teal-600 flex items-center justify-center h-6 w-6"
                  />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <MailOpen size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 shrink-0">Contact Email:</span>
                    <strong className="text-slate-700 truncate">{contactEmail}</strong>
                  </div>
                  <Button 
                    size="small" 
                    type="text" 
                    icon={<Copy size={11} />} 
                    onClick={() => handleCopyValue(contactEmail, 'Contact Email')}
                    className="text-slate-400 hover:text-teal-600 flex items-center justify-center h-6 w-6"
                  />
                </div>
              </div>
            </Card>

            {/* Actions & Translation Button */}
            <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <Tag color={isGermanActive ? 'blue' : 'green'} className="font-bold text-[10px] m-0 px-2 py-0.5">
                  {isGermanActive ? 'Deutsch (German)' : 'English (US/UK)'}
                </Tag>
                <Button 
                  size="small" 
                  type="link" 
                  icon={<Globe size={12} />} 
                  onClick={handleToggleTranslation}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 p-0"
                >
                  {isGermanActive ? 'Switch to English' : 'Translate to German'}
                </Button>
              </div>
              <div className="flex gap-1.5">
                <Button 
                  size="small" 
                  icon={copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />} 
                  onClick={handleCopy}
                >
                  Copy
                </Button>
                <Button 
                  size="small" 
                  icon={<Download size={12} />} 
                  onClick={handleExportTxt}
                >
                  Export .txt
                </Button>
              </div>
            </div>

            {/* Cover Letter Editor */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
              <TextArea
                value={activeLetter}
                onChange={(e) => setActiveLetter(e.target.value)}
                autoSize={{ minRows: 10, maxRows: 16 }}
                className="bg-transparent border-0 resize-none hover:bg-white focus:bg-white text-slate-700 text-xs leading-relaxed font-sans shadow-none p-0 outline-none"
              />
            </div>

            {/* CV Gap Suggestions */}
            {cvSuggestions.length > 0 && (
              <div className="mt-1">
                <Alert
                  message={
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Suggestions to improve your CV before applying:
                    </span>
                  }
                  description={
                    <ul className="list-disc pl-4 mt-1 text-[11px] text-amber-700 flex flex-col gap-1">
                      {cvSuggestions.map((suggestion, idx) => (
                        <li key={idx} className="leading-relaxed">{suggestion}</li>
                      ))}
                    </ul>
                  }
                  type="warning"
                  showIcon={false}
                  className="bg-amber-50 border-amber-200"
                />
              </div>
            )}
            
          </div>
        )}
      </div>
    </Card>
  );
}
