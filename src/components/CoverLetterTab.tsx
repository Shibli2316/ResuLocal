'use client';

import React, { useState } from 'react';
import { 
  FileText, Sparkles, Copy, Check, Download, AlertTriangle, 
  Globe, Building2, UserCheck, MailOpen, AlertCircle, RefreshCw, 
  FileEdit, SpellCheck, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Card, Input, Button, Alert, message, Space, Divider, Tag, Typography, Tabs, Progress, List } from 'antd';
import { useResumeStore } from '../store/resumeStore';
import ApiKeyManager from './ApiKeyManager';

const { TextArea } = Input;
const { Title, Text, Link } = Typography;

interface GrammarError {
  original: string;
  correction: string;
  reason: string;
}

interface TestReport {
  score: number;
  grammarErrors: GrammarError[];
  improvementPoints: string[];
  formattedLetter: string;
}

export default function CoverLetterTab() {
  const { resumes, currentResumeId, userApiKey } = useResumeStore();
  const currentResume = resumes.find(r => r.id === currentResumeId);

  // Tab state: 'generate' or 'test'
  const [activeTab, setActiveTab] = useState<'generate' | 'test'>('generate');

  // Generator States
  const [jobDescription, setJobDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [englishLetter, setEnglishLetter] = useState('');
  const [germanLetter, setGermanLetter] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [isGermanActive, setIsGermanActive] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [personResponsible, setPersonResponsible] = useState('');
  const [cvSuggestions, setCvSuggestions] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tester States
  const [userDraft, setUserDraft] = useState('');
  const [testingJobDescription, setTestingJobDescription] = useState('');
  const [testing, setTesting] = useState(false);
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [testEditMode, setTestEditMode] = useState(false);
  const [testCopied, setTestCopied] = useState(false);

  // Custom Markdown Parser for rich rendering
  const parseBoldText = (text: string) => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const formatMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').map((paragraph, index) => {
      const cleanPara = paragraph.trim();
      if (!cleanPara) return null;

      // Bullet Lists
      if (cleanPara.startsWith('*') || cleanPara.startsWith('-')) {
        const items = cleanPara.split('\n').map(line => line.replace(/^[\s*-]+/, '').trim());
        return (
          <ul key={index} className="list-disc list-inside my-2.5 space-y-1.5 text-slate-600 text-xs">
            {items.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseBoldText(item) }} />
            ))}
          </ul>
        );
      }

      // Default Paragraph
      return (
        <p 
          key={index} 
          className="mb-3.5 text-slate-600 leading-relaxed text-justify text-xs whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: parseBoldText(cleanPara) }}
        />
      );
    }).filter(Boolean);
  };

  // Generate Letter Handler
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
    setIsGermanActive(false);
    setEditMode(false);
    
    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-api-key': userApiKey || ''
        },
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
      setActiveLetter(result.coverLetter);
      
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

  // Test / Review Letter Handler
  const handleTestLetter = async () => {
    if (!userDraft.trim()) {
      message.warning('Please paste or write your Cover Letter draft first.');
      return;
    }

    setTesting(true);
    setTestEditMode(false);

    try {
      const response = await fetch('/api/ai/test-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': userApiKey || ''
        },
        body: JSON.stringify({
          coverLetter: userDraft,
          jobDescription: testingJobDescription
        })
      });

      if (!response.ok) {
        throw new Error('Review Scan failed. Verify server status and API credentials.');
      }

      const result = await response.json();
      setTestReport(result);
      message.success('Cover Letter review and grammar analysis complete!');
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Failed to review cover letter');
    } finally {
      setTesting(false);
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

  const handleCopy = (text: string, setCopiedFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    message.success('Copied text to clipboard!');
    setTimeout(() => setCopiedFn(false), 2000);
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
  const handleExportTxt = (text: string, prefix: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const suffix = prefix === 'Draft' && isGermanActive ? 'DE' : 'EN';
    element.download = `${prefix}_${currentResume?.title || 'Portfolio'}_${suffix}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a'; // Green
    if (score >= 50) return '#faad14'; // Orange/Yellow
    return '#ff4d4f'; // Red
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
        <ApiKeyManager />

        {/* Sub tabs nested */}
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as any)}
          size="small"
          type="card"
          className="mb-1"
          items={[
            {
              key: 'generate',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold px-1.5 py-0.5">
                  <FileEdit size={12} />
                  Draft Letter (Auto-Gen)
                </span>
              ),
              children: (
                <div className="flex flex-col gap-3 pt-2">
                  {/* Job description input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-bold">Target Job Description</label>
                    <TextArea 
                      rows={4} 
                      value={jobDescription} 
                      onChange={(e) => {
                        setJobDescription(e.target.value);
                        setTestingJobDescription(e.target.value); // Sync with tester
                      }}
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
                    className="bg-teal-600 hover:bg-teal-700 border-teal-600 font-bold"
                    block
                  >
                    {generating ? 'Drafting Custom Letter & Extracting Meta...' : 'Generate Target Cover Letter'}
                  </Button>

                  {activeLetter && (
                    <div className="flex flex-col gap-3 mt-1 overflow-y-auto max-h-[75vh] pr-1">
                      
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
                            type={editMode ? 'primary' : 'default'}
                            className={editMode ? '!bg-teal-700 font-bold border-0 text-white' : ''}
                            onClick={() => setEditMode(!editMode)}
                          >
                            {editMode ? 'Preview Formatted' : 'Edit Text'}
                          </Button>
                          <Button 
                            size="small" 
                            icon={copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />} 
                            onClick={() => handleCopy(activeLetter, setCopied)}
                          >
                            Copy
                          </Button>
                          <Button 
                            size="small" 
                            icon={<Download size={12} />} 
                            onClick={() => handleExportTxt(activeLetter, 'Draft')}
                          >
                            Export .txt
                          </Button>
                        </div>
                      </div>

                      {/* Cover Letter Box */}
                      {editMode ? (
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg min-h-[300px]">
                          <TextArea
                            value={activeLetter}
                            onChange={(e) => setActiveLetter(e.target.value)}
                            autoSize={{ minRows: 15, maxRows: 24 }}
                            className="bg-transparent border-0 resize-none hover:bg-white focus:bg-white text-slate-700 text-xs leading-relaxed font-sans shadow-none p-0 outline-none"
                          />
                        </div>
                      ) : (
                        <Card 
                          size="small" 
                          className="bg-white border-slate-300 shadow-sm rounded-lg border-t-4 border-t-teal-700 min-h-[300px] max-h-[45vh] overflow-y-auto"
                          bodyStyle={{ padding: '16px' }}
                        >
                          <div className="font-sans text-xs">
                            {formatMarkdown(activeLetter)}
                          </div>
                        </Card>
                      )}

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
              )
            },
            {
              key: 'test',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold px-1.5 py-0.5">
                  <SpellCheck size={12} />
                  Review & Test Letter
                </span>
              ),
              children: (
                <div className="flex flex-col gap-3 pt-2">
                  <Alert 
                    message={
                      <div className="text-[11px] leading-normal text-teal-800 font-semibold">
                        Paste your draft letter below to run an alignment analysis, grammar & spelling checks, and receive a professionally polished, formatted version.
                      </div>
                    }
                    type="info"
                    showIcon
                    className="!py-1 !px-2.5 !border-teal-200 !bg-teal-50/50"
                  />

                  {/* Input draft text area */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-bold">Your Cover Letter Draft</label>
                    <TextArea 
                      rows={15} 
                      value={userDraft} 
                      onChange={(e) => setUserDraft(e.target.value)} 
                      placeholder="Paste your own drafted cover letter text here..."
                      className="text-xs"
                      disabled={testing}
                    />
                  </div>

                  {/* Optional job desc input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-bold">Target Job Description (Optional)</label>
                    <TextArea 
                      rows={3} 
                      value={testingJobDescription} 
                      onChange={(e) => setTestingJobDescription(e.target.value)} 
                      placeholder="Paste the target job description to verify alignment..."
                      className="text-xs"
                      disabled={testing}
                    />
                  </div>

                  <Button 
                    type="primary" 
                    icon={<Sparkles size={14} />} 
                    onClick={handleTestLetter} 
                    loading={testing}
                    className="bg-teal-700 hover:bg-teal-600 font-bold"
                    block
                  >
                    {testing ? 'Analyzing spelling, grammar & styling...' : 'Analyze & Format Letter'}
                  </Button>

                  {testReport && !testing && (
                    <div className="flex flex-col gap-4 mt-2 overflow-y-auto max-h-[75vh] pr-1">
                      <Divider className="!my-1" />

                      {/* Performance Score */}
                      <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <Progress 
                          type="circle" 
                          percent={testReport.score} 
                          strokeColor={getScoreColor(testReport.score)}
                          size={60} 
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-700 text-sm mb-0.5">
                            Draft Quality Rating: {testReport.score}%
                          </h4>
                          <p className="text-xs text-slate-500 mb-0 leading-normal">
                            {testReport.score >= 80 
                              ? 'Strong draft! Minor grammar fixes applied. Highly aligned with job expectations.' 
                              : testReport.score >= 50 
                              ? 'Moderate alignment. Look at the spelling/grammar corrections and optimization tips below.' 
                              : 'Needs significant polishing. We have rewritten and optimized a styled version for you.'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Grammar corrections */}
                      <div>
                        <Title level={5} className="!text-xs !font-bold !text-slate-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                          <SpellCheck size={13} className="text-red-500" />
                          Spelling & Grammar Corrections
                        </Title>
                        {testReport.grammarErrors.length > 0 ? (
                          <List
                            size="small"
                            bordered
                            className="bg-red-50/20 border-red-100 rounded-lg"
                            dataSource={testReport.grammarErrors}
                            renderItem={(item) => (
                              <List.Item className="!py-1.5 !px-2.5 flex flex-col items-start gap-0.5 text-xs">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="line-through text-red-500 font-semibold bg-red-50 px-1 rounded">{item.original}</span>
                                  <ChevronRight size={10} className="text-slate-400" />
                                  <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">{item.correction}</span>
                                </div>
                                <span className="text-[11px] text-slate-500 leading-normal">{item.reason}</span>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <div className="text-xs text-slate-500 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5 font-semibold text-emerald-600">
                            <CheckCircle2 size={13} />
                            No spelling or grammatical issues detected in your draft!
                          </div>
                        )}
                      </div>

                      {/* Optimization tips */}
                      <div>
                        <Title level={5} className="!text-xs !font-bold !text-slate-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                          <AlertTriangle size={13} className="text-amber-500" />
                          Stylistic Optimization Tips
                        </Title>
                        <ul className="list-disc pl-4 text-xs text-slate-600 flex flex-col gap-1.5">
                          {testReport.improvementPoints.map((tip, idx) => (
                            <li key={idx} className="leading-relaxed">{tip}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions & Format Preview */}
                      <div>
                        <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200 mb-2">
                          <span className="text-xs font-bold text-slate-700 pl-1">Polished & Formatted Version</span>
                          <div className="flex gap-1.5">
                            <Button 
                              size="small"
                              type={testEditMode ? 'primary' : 'default'}
                              className={testEditMode ? '!bg-teal-700 font-bold border-0 text-white' : ''}
                              onClick={() => setTestEditMode(!testEditMode)}
                            >
                              {testEditMode ? 'Preview Formatted' : 'Edit Text'}
                            </Button>
                            <Button 
                              size="small" 
                              icon={testCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />} 
                              onClick={() => handleCopy(testReport.formattedLetter, setTestCopied)}
                            >
                              Copy
                            </Button>
                            <Button 
                              size="small" 
                              icon={<Download size={12} />} 
                              onClick={() => handleExportTxt(testReport.formattedLetter, 'Polished')}
                            >
                              Export .txt
                            </Button>
                          </div>
                        </div>

                        {testEditMode ? (
                          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg min-h-[300px]">
                            <TextArea
                              value={testReport.formattedLetter}
                              onChange={(e) => setTestReport({ ...testReport, formattedLetter: e.target.value })}
                              autoSize={{ minRows: 15, maxRows: 24 }}
                              className="bg-transparent border-0 resize-none hover:bg-white focus:bg-white text-slate-700 text-xs leading-relaxed font-sans shadow-none p-0 outline-none"
                            />
                          </div>
                        ) : (
                          <Card 
                            size="small" 
                            className="bg-white border-slate-300 shadow-sm rounded-lg border-t-4 border-t-teal-700 min-h-[300px] max-h-[45vh] overflow-y-auto"
                            bodyStyle={{ padding: '16px' }}
                          >
                            <div className="font-sans text-xs">
                              {formatMarkdown(testReport.formattedLetter)}
                            </div>
                          </Card>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </div>
    </Card>
  );
}
