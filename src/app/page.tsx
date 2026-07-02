'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Plus, Copy, Edit2, Trash2, Sparkles, BookOpen, 
  Settings, Award, Calendar, FileEdit 
} from 'lucide-react';
import { 
  Card, Button, Modal, Input, Space, Divider, message, Popconfirm, Tooltip 
} from 'antd';
import { useResumeStore } from '../store/resumeStore';

export default function Dashboard() {
  const router = useRouter();
  const { resumes, addResume, duplicateResume, deleteResume, renameResume, setCurrentResumeId } = useResumeStore();
  
  const [createModal, setCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  const [renameModal, setRenameModal] = useState<{ visible: boolean; id: string; title: string }>({
    visible: false,
    id: '',
    title: ''
  });

  const handleCreate = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const id = addResume(trimmed);
    setCurrentResumeId(id);
    setNewTitle('');
    setCreateModal(false);
    message.success('Resume created successfully!');
    router.push('/editor');
  };

  const handleRename = () => {
    const trimmed = renameModal.title.trim();
    if (!trimmed) return;
    renameResume(renameModal.id, trimmed);
    setRenameModal({ visible: false, id: '', title: '' });
    message.success('Resume renamed successfully!');
  };

  const startEdit = (id: string) => {
    setCurrentResumeId(id);
    router.push('/editor');
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      {/* Container */}
      <div className="max-w-6xl mx-auto">
        
        {/* Top Premium Hero Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-teal-800 to-cyan-950 text-white p-6 rounded-2xl shadow-md">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 mb-1.5">
              <Sparkles className="text-teal-300 animate-pulse" size={28} />
              <span>Resume & Cover Letter Architect</span>
            </h1>
            <p className="text-teal-100 text-sm">
              Design high-impact, single-page double-column resumes, optimize against ATS scanners, and draft letters instantly using Google Gemini AI.
            </p>
          </div>
          <div>
            <Button 
              type="primary" 
              size="large" 
              icon={<Plus size={18} />} 
              onClick={() => setCreateModal(true)}
              className="!bg-teal-400 !text-slate-900 !border-0 hover:!bg-teal-300 font-bold px-6 shadow-md transition-all"
            >
              Create New Resume
            </Button>
          </div>
        </header>

        {/* Saved Resumes Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <FileText className="text-teal-600" size={20} />
            <span>My Professional Portfolios</span>
            <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
              {resumes.length}
            </span>
          </h2>
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card 
              key={resume.id}
              className="shadow-sm hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between"
              bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
            >
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-teal-700 mb-2.5">
                    <FileText size={24} />
                  </div>
                  {/* Status/Badge */}
                  <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-teal-50 border border-teal-200 text-teal-700 rounded">
                    Double Column
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-slate-800 line-clamp-1 mb-1">
                  {resume.title}
                </h3>
                
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Modified: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                </p>
                
                {/* Summary preview */}
                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {resume.data.profile.summary || 'No professional summary set yet.'}
                </p>
              </div>

              <div>
                <Divider className="my-2.5" />
                <div className="flex justify-between items-center gap-2">
                  <Button 
                    type="primary" 
                    icon={<FileEdit size={14} />} 
                    onClick={() => startEdit(resume.id)}
                    className="flex-1 !bg-teal-700 hover:!bg-teal-600"
                    size="small"
                  >
                    Edit
                  </Button>
                  <Space size="small">
                    <Tooltip title="Duplicate Resume">
                      <Button 
                        size="small"
                        icon={<Copy size={13} />} 
                        onClick={() => {
                          duplicateResume(resume.id);
                          message.success('Duplicated successfully!');
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Rename Resume">
                      <Button 
                        size="small"
                        icon={<Edit2 size={13} />} 
                        onClick={() => setRenameModal({ visible: true, id: resume.id, title: resume.title })}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Delete Resume"
                      description="Are you sure you want to delete this portfolio?"
                      onConfirm={() => {
                        deleteResume(resume.id);
                        message.success('Deleted successfully.');
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Tooltip title="Delete Resume">
                        <Button 
                          size="small"
                          danger
                          icon={<Trash2 size={13} />} 
                        />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Create New Card Button */}
          <div 
            onClick={() => setCreateModal(true)}
            className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col justify-center items-center p-6 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 group transition-all"
          >
            <div className="p-3 bg-slate-100 rounded-full text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-700 mb-3 transition-colors">
              <Plus size={28} />
            </div>
            <h4 className="font-bold text-slate-600 group-hover:text-teal-800 transition-colors">
              Create Blank Portfolio
            </h4>
            <p className="text-xs text-slate-400 max-w-[200px] mt-1">
              Start building a tailored application block-by-block.
            </p>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        title="Create New Portfolio"
        open={createModal}
        onOk={handleCreate}
        onCancel={() => setCreateModal(false)}
        okText="Create"
        okButtonProps={{ disabled: !newTitle.trim(), className: '!bg-teal-700' }}
      >
        <div className="py-3">
          <label className="text-xs text-slate-500 font-bold block mb-1">Portfolio Title</label>
          <Input 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)} 
            placeholder="e.g., John Doe - Machine Learning Lead"
            onPressEnter={handleCreate}
            autoFocus
          />
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        title="Rename Portfolio"
        open={renameModal.visible}
        onOk={handleRename}
        onCancel={() => setRenameModal({ visible: false, id: '', title: '' })}
        okText="Rename"
        okButtonProps={{ disabled: !renameModal.title.trim(), className: '!bg-teal-700' }}
      >
        <div className="py-3">
          <label className="text-xs text-slate-500 font-bold block mb-1">New Portfolio Title</label>
          <Input 
            value={renameModal.title} 
            onChange={(e) => setRenameModal({ ...renameModal, title: e.target.value })} 
            placeholder="e.g., John Doe - Frontend Engineer"
            onPressEnter={handleRename}
            autoFocus
          />
        </div>
      </Modal>
    </main>
  );
}
