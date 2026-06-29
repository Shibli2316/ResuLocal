'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Copy, Check, FileText, ClipboardList, Code } from 'lucide-react';
import { Card, Tabs, Input, Button, List, Space, Tooltip, message } from 'antd';
import { useResumeStore, LibraryItem } from '../store/resumeStore';

const { TextArea } = Input;

export default function ContentLibrary() {
  const { contentLibrary, addToLibrary, removeFromLibrary } = useResumeStore();
  const [activeTab, setActiveTab] = useState<'bullet' | 'summary' | 'skill'>('bullet');
  const [newContent, setNewContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;
    
    addToLibrary(activeTab, trimmed);
    setNewContent('');
    message.success('Saved to Content Library!');
  };

  const handleCopy = (item: LibraryItem) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    message.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = contentLibrary.filter(item => item.category === activeTab);

  return (
    <Card 
      title={<span className="font-bold text-slate-700">Central Content Library</span>} 
      size="small" 
      className="shadow-sm border-slate-200 h-full flex flex-col"
      bodyStyle={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <p className="text-xs text-slate-500 mb-3">
        Save bullet points, summaries, and skill taglists here to quickly copy-paste or insert them while tailoring your resumes.
      </p>

      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => setActiveTab(key as any)}
        size="small"
        items={[
          {
            key: 'bullet',
            label: (
              <span className="flex items-center gap-1.5 text-xs">
                <ClipboardList size={12} />
                Bullet Points
              </span>
            ),
          },
          {
            key: 'summary',
            label: (
              <span className="flex items-center gap-1.5 text-xs">
                <FileText size={12} />
                Summaries
              </span>
            ),
          },
          {
            key: 'skill',
            label: (
              <span className="flex items-center gap-1.5 text-xs">
                <Code size={12} />
                Skill Lists
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col gap-2 mt-2 flex-1">
        {/* Add item interface */}
        <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded border border-slate-100 mb-2">
          <TextArea 
            rows={2} 
            value={newContent} 
            onChange={(e) => setNewContent(e.target.value)} 
            placeholder={
              activeTab === 'bullet' 
                ? 'Type a high-impact achievement bullet...' 
                : activeTab === 'summary' 
                ? 'Type a target profile summary...' 
                : 'Type comma-separated skills list (e.g. React, Next.js, Redux)...'
            }
            className="text-xs"
          />
          <Button 
            type="primary" 
            size="small" 
            icon={<Plus size={12} />} 
            onClick={handleAdd} 
            disabled={!newContent.trim()}
            block
          >
            Add to Library
          </Button>
        </div>

        {/* Library Items List */}
        <div className="overflow-y-auto max-h-[45vh] flex-1">
          <List
            size="small"
            dataSource={filteredItems}
            locale={{ emptyText: 'No saved items in this category' }}
            renderItem={(item) => (
              <List.Item
                className="hover:bg-slate-50 rounded px-2 py-2 border-b border-slate-100 last:border-0"
                actions={[
                  <Tooltip key="copy" title="Copy to clipboard">
                    <Button 
                      size="small" 
                      type="text" 
                      onClick={() => handleCopy(item)}
                      icon={copiedId === item.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    />
                  </Tooltip>,
                  <Tooltip key="delete" title="Remove from library">
                    <Button 
                      size="small" 
                      type="text" 
                      danger 
                      onClick={() => {
                        removeFromLibrary(item.id);
                        message.info('Removed from library.');
                      }}
                      icon={<Trash2 size={13} />}
                    />
                  </Tooltip>
                ]}
              >
                <div className="text-slate-600 text-xs text-left leading-relaxed pr-2 whitespace-pre-line">
                  {item.content}
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </Card>
  );
}
