'use client';

import React, { useState } from 'react';
import { 
  Scan, AlertTriangle, AlertCircle, CheckCircle, HelpCircle, 
  Sparkles, Key, AlertOctagon, Plus, Check 
} from 'lucide-react';
import { 
  Card, Input, Button, Progress, List, Alert, Space, 
  Typography, message, Badge, Tooltip, Select, Dropdown, Tag 
} from 'antd';
import { useResumeStore } from '../store/resumeStore';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface AtsScanReport {
  matchScore: number;
  formattingWarnings: string[];
  contentGaps: string[];
  keywordOptimization: {
    keyword: string;
    frequencyInJob: number;
    action: 'add' | 'rephrase';
  }[];
}

export default function AtsScorePanel() {
  const { resumes, currentResumeId, updateResumeData } = useResumeStore();
  const currentResume = resumes.find(r => r.id === currentResumeId);

  const [jobDescription, setJobDescription] = useState('');
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<AtsScanReport | null>(null);

  // For adding keywords
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const handleScan = async () => {
    if (!currentResume) {
      message.error('Please select a resume first');
      return;
    }
    if (!jobDescription.trim()) {
      message.warning('Please enter a target Job Description first');
      return;
    }

    setScanning(true);
    try {
      const response = await fetch('/api/ai/ats-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription
        })
      });

      if (!response.ok) {
        throw new Error('ATS Scan failed. Verify server status and API credentials.');
      }

      const result = await response.json();
      setReport(result);
      message.success('ATS Simulation complete!');
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Failed to scan resume');
    } finally {
      setScanning(false);
    }
  };

  // Inject a keyword into a selected skill category
  const handleAddKeyword = (keyword: string, categoryId: string) => {
    updateResumeData((draft) => {
      const category = draft.skills.find(s => s.id === categoryId);
      if (category) {
        const itemsList = category.items ? category.items.split(',').map(i => i.trim()) : [];
        if (!itemsList.includes(keyword)) {
          itemsList.push(keyword);
          category.items = itemsList.filter(Boolean).join(', ');
          message.success(`Added "${keyword}" to "${category.name}" skill category!`);
        } else {
          message.info(`"${keyword}" is already in "${category.name}"`);
        }
      }
    });

    // Remove keyword from report suggestions list to avoid duplicates
    if (report) {
      setReport({
        ...report,
        keywordOptimization: report.keywordOptimization.filter(k => k.keyword !== keyword)
      });
    }
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
          <Scan size={16} className="text-primary-color" />
          <span>Deep ATS Simulation</span>
        </div>
      }
      size="small"
      className="shadow-sm border-slate-200 h-full flex flex-col"
      bodyStyle={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex flex-col gap-3 flex-1">
        
        {/* Job Description input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-bold">Target Job Description</label>
          <TextArea 
            rows={4} 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            placeholder="Paste the target job advertisement description here..."
            className="text-xs"
            disabled={scanning}
          />
        </div>

        <Button 
          type="primary" 
          icon={<Sparkles size={14} />} 
          onClick={handleScan} 
          loading={scanning}
          block
        >
          {scanning ? 'Simulating ATS System...' : 'Run Deep ATS Optimization Scan'}
        </Button>

        {/* Scan Report Display */}
        {report && !scanning && (
          <div className="mt-3 flex-1 overflow-y-auto max-h-[50vh] flex flex-col gap-4 border-t border-slate-100 pt-3">
            
            {/* Score circle and intro */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Progress 
                type="circle" 
                percent={report.matchScore} 
                strokeColor={getScoreColor(report.matchScore)}
                size={70} 
              />
              <div className="flex-1">
                <h4 className="font-bold text-slate-700 text-sm mb-0.5">
                  ATS Match Score: {report.matchScore}%
                </h4>
                <p className="text-xs text-slate-500 mb-0 leading-normal">
                  {report.matchScore >= 80 
                    ? 'Excellent job description alignment! Your resume is highly optimized.' 
                    : report.matchScore >= 50 
                    ? 'Moderate alignment. Add target keywords and address content gaps to boost selection chances.' 
                    : 'Poor alignment. Customize your achievements to match the role specifications.'
                  }
                </p>
              </div>
            </div>

            {/* Keyword Optimization list */}
            <div>
              <Title level={5} className="!text-xs !font-bold !text-slate-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                <Key size={12} className="text-amber-500" />
                Keyword Adjustments
              </Title>
              {report.keywordOptimization.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {report.keywordOptimization.map((item, idx) => (
                    <Dropdown
                      key={idx}
                      disabled={!currentResume?.data?.skills?.length}
                      menu={{
                        items: (currentResume?.data?.skills || []).map((cat) => ({
                          key: cat.id,
                          label: `Add to "${cat.name}"`,
                          onClick: () => handleAddKeyword(item.keyword, cat.id)
                        }))
                      }}
                      trigger={['click']}
                    >
                      <Tooltip title="Click to inject this keyword directly into your resume skills">
                        <Tag 
                          className="cursor-pointer hover:bg-slate-200 border-slate-300 py-0.5 px-2 flex items-center gap-1 text-slate-700"
                          color={item.action === 'add' ? 'warning' : 'default'}
                        >
                          <Plus size={11} />
                          <span>{item.keyword}</span>
                          {item.frequencyInJob > 1 && (
                            <Badge count={item.frequencyInJob} size="small" style={{ backgroundColor: '#bfbfbf', fontSize: '9px', minWidth: '14px', height: '14px', lineHeight: '14px' }} />
                          )}
                        </Tag>
                      </Tooltip>
                    </Dropdown>
                  ))}
                </div>
              ) : (
                <Alert message="All primary keywords matched!" type="success" showIcon className="py-1 text-xs" />
              )}
            </div>

            {/* Content Gaps list */}
            <div>
              <Title level={5} className="!text-xs !font-bold !text-slate-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                <AlertCircle size={12} className="text-red-500" />
                Experience & Content Gaps
              </Title>
              <List
                size="small"
                bordered
                className="bg-white rounded-lg"
                dataSource={report.contentGaps}
                locale={{ emptyText: 'No content gaps detected!' }}
                renderItem={(item) => (
                  <List.Item className="text-xs text-slate-600 py-1.5">
                    • {item}
                  </List.Item>
                )}
              />
            </div>

            {/* Formatting warnings list */}
            <div>
              <Title level={5} className="!text-xs !font-bold !text-slate-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                <AlertOctagon size={12} className="text-yellow-500" />
                Formatting Warnings
              </Title>
              <List
                size="small"
                bordered
                className="bg-white rounded-lg"
                dataSource={report.formattingWarnings}
                locale={{ emptyText: 'Format is perfect!' }}
                renderItem={(item) => (
                  <List.Item className="text-xs text-slate-600 py-1.5 flex items-start gap-1">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </List.Item>
                )}
              />
            </div>

          </div>
        )}
      </div>
    </Card>
  );
}
