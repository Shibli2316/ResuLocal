'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Plus, Copy, Edit2, Trash2, Sparkles, BookOpen, 
  Settings, Award, Calendar, FileEdit 
} from 'lucide-react';
import { 
  Card, Button, Modal, Input, Space, Divider, message, Popconfirm, Tooltip 
} from 'antd';
import { useResumeStore } from '../store/resumeStore';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const { resumes, addResume, duplicateResume, deleteResume, renameResume, setCurrentResumeId, user, loginUser } = useResumeStore();
  
  const [createModal, setCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  const [renameModal, setRenameModal] = useState<{ visible: boolean; id: string; title: string }>({
    visible: false,
    id: '',
    title: ''
  });

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { name, email, avatarUrl } = event.data;
        loginUser(name, email, avatarUrl);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [loginUser]);

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/login-google-popup',
      'Google Sign-In',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
    } else {
      message.error('Popup blocker active. Please allow popups for ResuLocal.');
    }
  };

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

  // Render Premium landing page if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto z-10">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-950/40 text-teal-300 text-xs font-semibold mb-6 shadow-inner">
              <Sparkles size={14} className="text-teal-400" />
              <span>Version 2.0 Local-First Edition</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
              Craft High-Impact Resumes{' '}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                Optimized by AI
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              ResuLocal is a local-first CV & Cover Letter Architect. Powered by Google Gemini, it helps you build stunning double-column resumes, run real-time ATS scans, and generate professional cover letters directly inside your browser.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                type="primary" 
                size="large"
                onClick={handleGoogleLogin}
                className="w-full sm:w-auto !bg-teal-500 hover:!bg-teal-400 !border-0 text-slate-950 font-bold h-12 px-8 rounded-xl shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Get Started for Free
              </Button>
              <Button 
                type="default" 
                size="large"
                onClick={handleGoogleLogin}
                className="w-full sm:w-auto !bg-slate-900 !border-slate-800 hover:!border-slate-700 text-slate-200 font-bold h-12 px-8 rounded-xl hover:!bg-slate-850 active:scale-[0.98] transition-all"
              >
                Sign In with Google
              </Button>
            </div>

            {/* Hero App Mockup */}
            <div className="relative mx-auto max-w-[800px] border border-slate-800/80 rounded-2xl p-2.5 bg-slate-900/40 backdrop-blur-sm shadow-2xl shadow-teal-500/5 hover:border-slate-700/60 transition-colors">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/80 bg-slate-950/80 rounded-t-xl text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <div className="ml-4 text-[10px] tracking-wider uppercase font-bold text-slate-600 bg-slate-900 px-3 py-0.5 rounded border border-slate-800/60">
                  resulocal.app/editor
                </div>
              </div>
              <div className="bg-slate-950/50 p-6 rounded-b-xl min-h-[300px] flex flex-col justify-center items-center text-slate-400 border border-slate-900/60">
                <div className="flex flex-col items-center gap-4 max-w-sm">
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/50 text-teal-400">
                    <FileEdit size={32} />
                  </div>
                  <h3 className="text-white font-bold text-base mt-2">Interactive CV Builder & ATS Optimizer</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sign in to customize double-column layouts, change spacing presets, configure Gemini API keys, and download print-ready A4 resumes instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-950/40 border-y border-slate-900/80 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Engineered with Cutting-Edge Features
              </h2>
              <p className="text-sm text-slate-500 max-w-lg mx-auto">
                ResuLocal focuses on high efficiency, data privacy, and premium typography designs to give you an unfair advantage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Award className="text-teal-400" size={24} />,
                  title: 'Auto-Fit Engine',
                  desc: 'Dynamically shrinks font size, spacing, and line heights to fit all content on exactly 1 page automatically.'
                },
                {
                  icon: <Sparkles className="text-teal-400" size={24} />,
                  title: 'Gemini Proofreader',
                  desc: 'Review and optimize your cover letter layouts against grammar rules, styling guides, and spelling mistakes.'
                },
                {
                  icon: <BookOpen className="text-teal-400" size={24} />,
                  title: 'ATS Scoring Analyzer',
                  desc: 'Import job descriptions and scan your resume structure to calculate key keyword density scores.'
                },
                {
                  icon: <Settings className="text-teal-400" size={24} />,
                  title: 'Local-First Privacy',
                  desc: 'All resumes are saved directly in your browser. No server storage, no data tracking. Fully secure.'
                }
              ].map((feat, idx) => (
                <div key={idx} className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl hover:border-slate-800 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-850 mb-4">
                    {feat.icon}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-900/60 py-10 text-center text-xs text-slate-500 px-6">
          <p>© {new Date().getFullYear()} ResuLocal. Local-First Premium CV Architect.</p>
          <p className="mt-1 text-slate-600 font-medium">Built using Next.js, Puppeteer, Ant Design, and Google Gemini.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4 md:px-8">
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
    </div>
  );
}
