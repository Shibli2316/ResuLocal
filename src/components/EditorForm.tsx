'use client';

import React, { useState } from 'react';
import { 
  Plus, Trash2, Bookmark, FolderOpen, AlertCircle, Check, 
  Link2, Eye, EyeOff, LayoutTemplate, PlusCircle 
} from 'lucide-react';
import { 
  Collapse, Input, Button, Form, Card, Space, Tooltip, 
  Select, Modal, List, Tag, Radio, Divider, Alert, Popconfirm 
} from 'antd';
import { 
  useResumeStore, ResumeData, ExperienceItem, EducationItem, 
  ProjectItem, SkillCategory, PublicationItem, OrganizationItem, 
  CertificationItem, LanguageItem, ContactLink, CustomSectionItem 
} from '../store/resumeStore';

const { TextArea } = Input;
const { Panel } = Collapse;

export default function EditorForm() {
  const { 
    resumes, currentResumeId, updateResumeData, 
    contentLibrary, addToLibrary, addCustomSection, deleteCustomSection 
  } = useResumeStore();

  const currentResume = resumes.find(r => r.id === currentResumeId);

  // Interest tags management
  const [interestInput, setInterestInput] = useState('');
  
  // Custom section state
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState<'entries' | 'pills' | 'text'>('entries');
  const [customColumn, setCustomColumn] = useState<'left' | 'right'>('right');
  const [customSectionModal, setCustomSectionModal] = useState(false);

  // Content library modal state
  const [libraryModal, setLibraryModal] = useState<{
    visible: boolean;
    category: 'bullet' | 'summary' | 'skill';
    onSelect: (value: string) => void;
  }>({
    visible: false,
    category: 'bullet',
    onSelect: () => {}
  });

  if (!currentResume) {
    return (
      <Card className="text-center py-8">
        <AlertCircle className="mx-auto text-amber-500 mb-2" size={32} />
        <p className="text-slate-500">No active resume. Please create or select a resume first.</p>
      </Card>
    );
  }

  const data = currentResume.data;
  const sections = currentResume.sections || [];

  // Generic updater helper
  const updateField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    updateResumeData((draft) => {
      draft[key] = value;
    });
  };

  // Profile fields updater
  const updateProfileField = (key: string, value: string) => {
    updateResumeData((draft) => {
      draft.profile = {
        ...draft.profile,
        [key]: value
      };
    });
  };

  // Open library picker
  const openLibraryPicker = (category: 'bullet' | 'summary' | 'skill', onSelect: (value: string) => void) => {
    setLibraryModal({
      visible: true,
      category,
      onSelect
    });
  };

  // Contact links management
  const addContactLink = () => {
    const newLink: ContactLink = {
      id: `lnk-${Date.now()}`,
      type: 'custom',
      label: 'Portfolio Link',
      url: 'myportfolio.com'
    };
    updateResumeData((draft) => {
      if (!draft.profile.links) draft.profile.links = [];
      draft.profile.links.push(newLink);
    });
  };

  const updateContactLink = (id: string, key: 'type' | 'label' | 'url', value: string) => {
    updateResumeData((draft) => {
      if (!draft.profile.links) draft.profile.links = [];
      draft.profile.links = draft.profile.links.map(lnk => 
        lnk.id === id ? { ...lnk, [key]: value } : lnk
      );
    });
  };

  const removeContactLink = (id: string) => {
    updateResumeData((draft) => {
      if (!draft.profile.links) draft.profile.links = [];
      draft.profile.links = draft.profile.links.filter(lnk => lnk.id !== id);
    });
  };

  // Section Visibility toggle
  const toggleSectionVisibility = (sectionId: string) => {
    useResumeStore.setState((state) => ({
      resumes: state.resumes.map((r) => {
        if (r.id === currentResumeId) {
          return {
            ...r,
            sections: r.sections.map(s => 
              s.id === sectionId ? { ...s, visible: !s.visible } : s
            )
          };
        }
        return r;
      })
    }));
  };

  // Custom Section Data helpers
  const handleAddCustomSection = () => {
    const title = customTitle.trim();
    if (!title) return;
    addCustomSection(title, customType, customColumn);
    setCustomTitle('');
    setCustomSectionModal(false);
  };

  const addCustomItem = (sectionId: string) => {
    const newItem: CustomSectionItem = {
      id: `c-item-${Date.now()}`,
      title: 'Item Title',
      subtitle: 'Institution/Role',
      startDate: 'Date Range',
      endDate: '',
      location: '',
      description: ''
    };
    updateResumeData((draft) => {
      const target = draft.customSections.find(c => c.id === sectionId);
      if (target) {
        target.items.push(newItem);
      }
    });
  };

  const updateCustomItemField = (sectionId: string, itemId: string, field: keyof CustomSectionItem, value: string) => {
    updateResumeData((draft) => {
      const target = draft.customSections.find(c => c.id === sectionId);
      if (target) {
        target.items = target.items.map(item => 
          item.id === itemId ? { ...item, [field]: value } : item
        );
      }
    });
  };

  const deleteCustomItem = (sectionId: string, itemId: string) => {
    updateResumeData((draft) => {
      const target = draft.customSections.find(c => c.id === sectionId);
      if (target) {
        target.items = target.items.filter(item => item.id !== itemId);
      }
    });
  };

  // Add Item Helpers for standard sections
  const addEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      location: ''
    };
    updateField('education', [...data.education, newItem]);
  };

  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      location: '',
      highlights: ['']
    };
    updateField('experience', [...data.experience, newItem]);
  };

  const addProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      startDate: '',
      endDate: '',
      highlights: ['']
    };
    updateField('projects', [...data.projects, newItem]);
  };

  const addSkill = () => {
    const newItem: SkillCategory = {
      id: `sk-${Date.now()}`,
      name: '',
      items: ''
    };
    updateField('skills', [...data.skills, newItem]);
  };

  const addPublication = () => {
    const newItem: PublicationItem = {
      id: `pub-${Date.now()}`,
      title: ''
    };
    updateField('publications', [...data.publications, newItem]);
  };

  const addOrganization = () => {
    const newItem: OrganizationItem = {
      id: `org-${Date.now()}`,
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    updateField('organizations', [...data.organizations, newItem]);
  };

  const addCertification = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: ''
    };
    updateField('certifications', [...data.certifications, newItem]);
  };

  const addLanguage = () => {
    const newItem: LanguageItem = {
      id: `lang-${Date.now()}`,
      name: '',
      proficiency: ''
    };
    updateField('languages', [...data.languages, newItem]);
  };

  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !data.interests.includes(trimmed)) {
      updateField('interests', [...data.interests, trimmed]);
      setInterestInput('');
    }
  };

  return (
    <div className="flex flex-col gap-4 max-h-[85vh] overflow-y-auto pr-2">
      <Collapse defaultActiveKey={['profile', 'sections-cfg']} expandIconPosition="end" size="small">
        
        {/* Profile Info */}
        <Panel header={<span className="font-bold text-slate-700">1. Header & Profile Contact</span>} key="profile">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-500 font-semibold block mb-1">Full Name</label>
              <Input 
                value={data.profile.name} 
                onChange={(e) => updateProfileField('name', e.target.value)} 
                placeholder="John Doe"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 font-semibold block mb-1">Target Role / Subheading</label>
              <Input 
                value={data.profile.role} 
                onChange={(e) => updateProfileField('role', e.target.value)} 
                placeholder="Working Student / Software Engineer"
              />
            </div>
          </div>

          <Divider orientation="left" className="!my-2 !text-xs !font-bold !text-slate-500">
            Clickable Contact Links
          </Divider>

          <div className="flex flex-col gap-2 mb-3">
            {data.profile.links && data.profile.links.map((link, idx) => (
              <div key={link.id} className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Link #{idx + 1}</span>
                  <Button 
                    type="text" 
                    danger 
                    size="small" 
                    icon={<Trash2 size={12} />} 
                    onClick={() => removeContactLink(link.id)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Select 
                    value={link.type} 
                    size="small"
                    onChange={(val) => updateContactLink(link.id, 'type', val)}
                    options={[
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                      { value: 'location', label: 'Location' },
                      { value: 'github', label: 'GitHub' },
                      { value: 'linkedin', label: 'LinkedIn' },
                      { value: 'website', label: 'Website' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                  />
                  <Input 
                    placeholder="Display Label" 
                    value={link.label}
                    size="small"
                    onChange={(e) => updateContactLink(link.id, 'label', e.target.value)}
                  />
                  <Input 
                    placeholder="Destination URL" 
                    value={link.url}
                    size="small"
                    onChange={(e) => updateContactLink(link.id, 'url', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button type="dashed" size="small" onClick={addContactLink} icon={<Plus size={12} />}>
              Add Contact Link
            </Button>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-500 font-semibold">Professional Summary (Left-Column Width Limit)</label>
              <Space size="small">
                <Tooltip title="Save active summary to Content Library">
                  <Button 
                    size="small" 
                    icon={<Bookmark size={12} />} 
                    disabled={!data.profile.summary.trim()}
                    onClick={() => {
                      addToLibrary('summary', data.profile.summary);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Insert summary from Content Library">
                  <Button 
                    size="small" 
                    icon={<FolderOpen size={12} />} 
                    onClick={() => openLibraryPicker('summary', (val) => updateProfileField('summary', val))}
                  />
                </Tooltip>
              </Space>
            </div>
            <TextArea 
              rows={3} 
              value={data.profile.summary} 
              onChange={(e) => updateProfileField('summary', e.target.value)} 
              placeholder="Provide a short overview of your core skills and objectives..."
            />
          </div>
        </Panel>

        {/* Section Visibility and Ordering Config */}
        <Panel header={<span className="font-bold text-slate-700">2. Layout Config & Custom Sections</span>} key="sections-cfg">
          <p className="text-[11px] text-slate-500 mb-2">
            Show/hide sections, add custom panels, or select layout templates. Drag sections directly in the right preview canvas to balance columns.
          </p>

          <Divider orientation="left" className="!my-1.5 !text-xs">
            Standard Panels Configuration
          </Divider>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {sections.map((section) => (
              <Button 
                key={section.id} 
                size="small"
                className={`flex items-center justify-between text-left ${section.visible ? 'border-teal-500 text-teal-700' : 'text-slate-400'}`}
                onClick={() => toggleSectionVisibility(section.id)}
                icon={section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              >
                <span className="truncate flex-1 pl-1 text-[11px] font-semibold">{section.title}</span>
              </Button>
            ))}
          </div>

          <Divider orientation="left" className="!my-1.5 !text-xs">
            Create Custom Sections
          </Divider>
          
          <Button 
            type="primary" 
            block 
            icon={<PlusCircle size={14} />} 
            onClick={() => setCustomSectionModal(true)}
            className="!bg-teal-700"
          >
            Create Custom Section
          </Button>
        </Panel>

        {/* Education */}
        <Panel header={<span className="font-bold text-slate-700">Education</span>} key="education">
          {data.education.map((item, index) => (
            <Card key={item.id} size="small" className="mb-3 border-slate-200" title={`Education #${index + 1}`} extra={
              <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => updateField('education', data.education.filter(x => x.id !== item.id))} />
            }>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="University / School" value={item.school} onChange={(e) => {
                  const next = [...data.education]; next[index].school = e.target.value; updateField('education', next);
                }} />
                <Input placeholder="Degree" value={item.degree} onChange={(e) => {
                  const next = [...data.education]; next[index].degree = e.target.value; updateField('education', next);
                }} />
                <Input placeholder="Start Date" value={item.startDate} onChange={(e) => {
                  const next = [...data.education]; next[index].startDate = e.target.value; updateField('education', next);
                }} />
                <Input placeholder="End Date" value={item.endDate} onChange={(e) => {
                  const next = [...data.education]; next[index].endDate = e.target.value; updateField('education', next);
                }} />
                <div className="col-span-2">
                  <Input placeholder="Location" value={item.location} onChange={(e) => {
                    const next = [...data.education]; next[index].location = e.target.value; updateField('education', next);
                  }} />
                </div>
              </div>
            </Card>
          ))}
          <Button type="dashed" block onClick={addEducation} icon={<Plus size={14} />}>Add Education</Button>
        </Panel>

        {/* Experience */}
        <Panel header={<span className="font-bold text-slate-700">Work Experience</span>} key="experience">
          {data.experience.map((item, index) => (
            <Card key={item.id} size="small" className="mb-3 border-slate-200" title={`Work Experience #${index + 1}`} extra={
              <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => updateField('experience', data.experience.filter(x => x.id !== item.id))} />
            }>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input placeholder="Company" value={item.company} onChange={(e) => {
                  const next = [...data.experience]; next[index].company = e.target.value; updateField('experience', next);
                }} />
                <Input placeholder="Role / Position" value={item.position} onChange={(e) => {
                  const next = [...data.experience]; next[index].position = e.target.value; updateField('experience', next);
                }} />
                <Input placeholder="Start Date" value={item.startDate} onChange={(e) => {
                  const next = [...data.experience]; next[index].startDate = e.target.value; updateField('experience', next);
                }} />
                <Input placeholder="End Date" value={item.endDate} onChange={(e) => {
                  const next = [...data.experience]; next[index].endDate = e.target.value; updateField('experience', next);
                }} />
                <div className="col-span-2">
                  <Input placeholder="Location" value={item.location} onChange={(e) => {
                    const next = [...data.experience]; next[index].location = e.target.value; updateField('experience', next);
                  }} />
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-xs text-slate-500 font-bold block mb-1">Highlights</span>
                {item.highlights.map((bullet, bulletIdx) => (
                  <div key={bulletIdx} className="flex gap-1 mb-2 items-center">
                    <Input value={bullet} placeholder="Achieved X by implementing Y..." onChange={(e) => {
                      const next = [...data.experience]; next[index].highlights[bulletIdx] = e.target.value; updateField('experience', next);
                    }} />
                    <Tooltip title="Bookmark bullet">
                      <Button size="small" icon={<Bookmark size={11} />} disabled={!bullet.trim()} onClick={() => addToLibrary('bullet', bullet)} />
                    </Tooltip>
                    <Tooltip title="Insert bullet">
                      <Button size="small" icon={<FolderOpen size={11} />} onClick={() => openLibraryPicker('bullet', (val) => {
                        const next = [...data.experience]; next[index].highlights[bulletIdx] = val; updateField('experience', next);
                      })} />
                    </Tooltip>
                    <Button size="small" type="text" danger icon={<Trash2 size={12} />} onClick={() => {
                      const next = [...data.experience]; next[index].highlights = next[index].highlights.filter((_, bIdx) => bIdx !== bulletIdx); updateField('experience', next);
                    }} />
                  </div>
                ))}
                <Button size="small" type="dashed" icon={<Plus size={11} />} onClick={() => {
                  const next = [...data.experience]; next[index].highlights.push(''); updateField('experience', next);
                }} font-size="small">Add Bullet</Button>
              </div>
            </Card>
          ))}
          <Button type="dashed" block onClick={addExperience} icon={<Plus size={14} />}>Add Experience</Button>
        </Panel>

        {/* Projects */}
        <Panel header={<span className="font-bold text-slate-700">Personal Projects</span>} key="projects">
          {data.projects.map((item, index) => (
            <Card key={item.id} size="small" className="mb-3 border-slate-200" title={`Project #${index + 1}`} extra={
              <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => updateField('projects', data.projects.filter(x => x.id !== item.id))} />
            }>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input placeholder="Project Name" value={item.name} onChange={(e) => {
                  const next = [...data.projects]; next[index].name = e.target.value; updateField('projects', next);
                }} />
                <div className="flex gap-1">
                  <Input placeholder="Start Date" value={item.startDate} onChange={(e) => {
                    const next = [...data.projects]; next[index].startDate = e.target.value; updateField('projects', next);
                  }} />
                  <Input placeholder="End Date" value={item.endDate} onChange={(e) => {
                    const next = [...data.projects]; next[index].endDate = e.target.value; updateField('projects', next);
                  }} />
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                {item.highlights.map((bullet, bulletIdx) => (
                  <div key={bulletIdx} className="flex gap-1 mb-2 items-center">
                    <Input value={bullet} onChange={(e) => {
                      const next = [...data.projects]; next[index].highlights[bulletIdx] = e.target.value; updateField('projects', next);
                    }} />
                    <Button size="small" icon={<Bookmark size={11} />} disabled={!bullet.trim()} onClick={() => addToLibrary('bullet', bullet)} />
                    <Button size="small" icon={<FolderOpen size={11} />} onClick={() => openLibraryPicker('bullet', (val) => {
                      const next = [...data.projects]; next[index].highlights[bulletIdx] = val; updateField('projects', next);
                    })} />
                    <Button size="small" type="text" danger icon={<Trash2 size={12} />} onClick={() => {
                      const next = [...data.projects]; next[index].highlights = next[index].highlights.filter((_, bIdx) => bIdx !== bulletIdx); updateField('projects', next);
                    }} />
                  </div>
                ))}
                <Button size="small" type="dashed" icon={<Plus size={11} />} onClick={() => {
                  const next = [...data.projects]; next[index].highlights.push(''); updateField('projects', next);
                }}>Add Bullet</Button>
              </div>
            </Card>
          ))}
          <Button type="dashed" block onClick={addProject} icon={<Plus size={14} />}>Add Project</Button>
        </Panel>

        {/* Skills */}
        <Panel header={<span className="font-bold text-slate-700">Skills</span>} key="skills">
          {data.skills.map((item, index) => (
            <Card 
              key={item.id} 
              size="small" 
              className="mb-3 border-slate-200 bg-slate-50/50"
            >
              <div className="flex justify-between items-end mb-2">
                <div className="flex-1 mr-3">
                  <label className="text-xs text-slate-500 block mb-1 font-semibold">Skill Category Name</label>
                  <Input 
                    placeholder="e.g. Frontend, Backend, Languages" 
                    value={item.name} 
                    onChange={(e) => {
                      const next = [...data.skills]; next[index].name = e.target.value; updateField('skills', next);
                    }} 
                  />
                </div>
                <Button 
                  danger 
                  type="primary" 
                  size="small"
                  icon={<Trash2 size={12} />}
                  onClick={() => updateField('skills', data.skills.filter(x => x.id !== item.id))}
                >
                  Delete Category
                </Button>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold">Pills tags (comma-separated)</label>
                <Input 
                  placeholder="e.g. React, TypeScript, Node.js" 
                  value={item.items} 
                  onChange={(e) => {
                    const next = [...data.skills]; next[index].items = e.target.value; updateField('skills', next);
                  }} 
                />
              </div>
            </Card>
          ))}
          <Button type="dashed" block onClick={addSkill} icon={<Plus size={14} />}>Add Skill Category</Button>
        </Panel>

        {/* Custom Sections Form rendering */}
        {data.customSections && data.customSections.map((customSec) => {
          const matchingOrderSec = sections.find(s => s.id === customSec.id);
          if (!matchingOrderSec) return null;
          
          return (
            <Panel 
              header={
                <div className="flex justify-between items-center w-full pr-6">
                  <span className="font-bold text-slate-700">Custom: {customSec.title}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">
                    {customSec.type}
                  </span>
                </div>
              } 
              key={customSec.id}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex-1 mr-3">
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Rename Section Title</label>
                  <Input 
                    value={customSec.title} 
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      // Update title in order array too
                      useResumeStore.setState((state) => ({
                        resumes: state.resumes.map(r => 
                          r.id === currentResumeId 
                            ? { ...r, sections: r.sections.map(s => s.id === customSec.id ? { ...s, title: newTitle } : s) } 
                            : r
                        )
                      }));
                      updateResumeData((draft) => {
                        const target = draft.customSections.find(c => c.id === customSec.id);
                        if (target) target.title = newTitle;
                      });
                    }}
                  />
                </div>
                <Popconfirm
                  title="Delete Custom Section"
                  description={`Are you sure you want to delete "${customSec.title}"? All section data will be lost.`}
                  onConfirm={() => deleteCustomSection(customSec.id)}
                  okText="Yes, Delete"
                  cancelText="No"
                  okButtonProps={{ danger: true, className: '!bg-red-600 hover:!bg-red-500' }}
                >
                  <Button 
                    danger 
                    type="primary" 
                    size="small"
                    icon={<Trash2 size={12} />}
                  >
                    Delete Section
                  </Button>
                </Popconfirm>
              </div>

              {/* Text Area Type */}
              {customSec.type === 'text' && (
                <div>
                  <label className="text-xs text-slate-500 block mb-1 font-semibold">Custom Text Content</label>
                  <TextArea 
                    rows={4}
                    value={customSec.text}
                    onChange={(e) => {
                      updateResumeData((draft) => {
                        const target = draft.customSections.find(c => c.id === customSec.id);
                        if (target) target.text = e.target.value;
                      });
                    }}
                    placeholder="Enter paragraphs or statements..."
                  />
                </div>
              )}

              {/* Tag/Pills Cloud Type */}
              {customSec.type === 'pills' && (
                <div>
                  <label className="text-xs text-slate-500 block mb-1 font-semibold">Pills tags (comma-separated)</label>
                  <Input 
                    value={customSec.pills.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map((s, idx, arr) => idx === arr.length - 1 ? s : s.trim());
                      updateResumeData((draft) => {
                        const target = draft.customSections.find(c => c.id === customSec.id);
                        if (target) target.pills = list;
                      });
                    }}
                    placeholder="e.g. OpenCV, Pygame, NumPy"
                  />
                </div>
              )}

              {/* Entries Blocks Type */}
              {customSec.type === 'entries' && (
                <div>
                  {customSec.items.map((item, index) => (
                    <Card 
                      key={item.id} 
                      size="small" 
                      className="mb-3 border-slate-200 bg-slate-50/50" 
                      title={`Entry #${index + 1}`}
                      extra={
                        <Button 
                          type="text" 
                          danger 
                          icon={<Trash2 size={13} />} 
                          onClick={() => deleteCustomItem(customSec.id, item.id)} 
                        />
                      }
                    >
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <Input 
                          placeholder="Title/Headline" 
                          value={item.title} 
                          onChange={(e) => updateCustomItemField(customSec.id, item.id, 'title', e.target.value)}
                        />
                        <Input 
                          placeholder="Subtitle/Institution" 
                          value={item.subtitle} 
                          onChange={(e) => updateCustomItemField(customSec.id, item.id, 'subtitle', e.target.value)}
                        />
                        <Input 
                          placeholder="Start Date" 
                          value={item.startDate} 
                          onChange={(e) => updateCustomItemField(customSec.id, item.id, 'startDate', e.target.value)}
                        />
                        <Input 
                          placeholder="End Date" 
                          value={item.endDate} 
                          onChange={(e) => updateCustomItemField(customSec.id, item.id, 'endDate', e.target.value)}
                        />
                        <div className="col-span-2">
                          <Input 
                            placeholder="Location" 
                            value={item.location} 
                            onChange={(e) => updateCustomItemField(customSec.id, item.id, 'location', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <TextArea 
                            placeholder="Description details..." 
                            rows={3}
                            value={item.description} 
                            onChange={(e) => updateCustomItemField(customSec.id, item.id, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button 
                    type="dashed" 
                    block 
                    onClick={() => addCustomItem(customSec.id)} 
                    icon={<Plus size={13} />}
                  >
                    Add Entry Item
                  </Button>
                </div>
              )}
            </Panel>
          );
        })}

        {/* Miscellaneous sections: Publications, Orgs, Certs, Languages, Interests */}
        <Panel header={<span className="font-bold text-slate-700">Publications & Achievements</span>} key="publications">
          {data.publications.map((item, index) => (
            <div key={item.id} className="flex gap-2 mb-2">
              <Input value={item.title} onChange={(e) => {
                const next = [...data.publications]; next[index].title = e.target.value; updateField('publications', next);
              }} />
              <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => updateField('publications', data.publications.filter(x => x.id !== item.id))} />
            </div>
          ))}
          <Button type="dashed" block onClick={addPublication} icon={<Plus size={14} />}>Add Item</Button>
        </Panel>

        <Panel header={<span className="font-bold text-slate-700">Organizations</span>} key="organizations">
          {data.organizations.map((item, index) => (
            <Card key={item.id} size="small" className="mb-3 border-slate-200" title={`Organization #${index + 1}`} extra={
              <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => updateField('organizations', data.organizations.filter(x => x.id !== item.id))} />
            }>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input placeholder="Club Name" value={item.name} onChange={(e) => {
                  const next = [...data.organizations]; next[index].name = e.target.value; updateField('organizations', next);
                }} />
                <Input placeholder="Role" value={item.role} onChange={(e) => {
                  const next = [...data.organizations]; next[index].role = e.target.value; updateField('organizations', next);
                }} />
                <Input placeholder="Start Date" value={item.startDate} onChange={(e) => {
                  const next = [...data.organizations]; next[index].startDate = e.target.value; updateField('organizations', next);
                }} />
                <Input placeholder="End Date" value={item.endDate} onChange={(e) => {
                  const next = [...data.organizations]; next[index].endDate = e.target.value; updateField('organizations', next);
                }} />
                <div className="col-span-2">
                  <TextArea placeholder="Details..." value={item.description} rows={2} onChange={(e) => {
                    const next = [...data.organizations]; next[index].description = e.target.value; updateField('organizations', next);
                  }} />
                </div>
              </div>
            </Card>
          ))}
          <Button type="dashed" block onClick={addOrganization} icon={<Plus size={14} />}>Add Organization</Button>
        </Panel>

        <Panel header={<span className="font-bold text-slate-700">Certifications</span>} key="certifications">
          {data.certifications.map((item, index) => (
            <div key={item.id} className="grid grid-cols-2 gap-2 mb-2 border border-dashed border-slate-100 p-2 rounded">
              <Input placeholder="Certificate" value={item.name} onChange={(e) => {
                const next = [...data.certifications]; next[index].name = e.target.value; updateField('certifications', next);
              }} />
              <div className="flex gap-2">
                <Input placeholder="Issuer" value={item.issuer} onChange={(e) => {
                  const next = [...data.certifications]; next[index].issuer = e.target.value; updateField('certifications', next);
                }} />
                <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => updateField('certifications', data.certifications.filter(x => x.id !== item.id))} />
              </div>
            </div>
          ))}
          <Button type="dashed" block onClick={addCertification} icon={<Plus size={14} />}>Add Certification</Button>
        </Panel>

        <Panel header={<span className="font-bold text-slate-700">Languages</span>} key="languages">
          {data.languages.map((item, index) => (
            <div key={item.id} className="grid grid-cols-2 gap-2 mb-2 border border-dashed border-slate-100 p-2 rounded">
              <Input placeholder="Language" value={item.name} onChange={(e) => {
                const next = [...data.languages]; next[index].name = e.target.value; updateField('languages', next);
              }} />
              <div className="flex gap-2">
                <Input placeholder="Proficiency" value={item.proficiency} onChange={(e) => {
                  const next = [...data.languages]; next[index].proficiency = e.target.value; updateField('languages', next);
                }} />
                <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => updateField('languages', data.languages.filter(x => x.id !== item.id))} />
              </div>
            </div>
          ))}
          <Button type="dashed" block onClick={addLanguage} icon={<Plus size={14} />}>Add Language</Button>
        </Panel>

        <Panel header={<span className="font-bold text-slate-700">Interests</span>} key="interests">
          <div className="flex gap-2 mb-2">
            <Input placeholder="Hiking" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onPressEnter={addInterest} />
            <Button onClick={addInterest} type="primary">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.interests.map((interest, idx) => (
              <Tag key={idx} closable onClose={() => updateField('interests', data.interests.filter(x => x !== interest))}>
                {interest}
              </Tag>
            ))}
          </div>
        </Panel>

      </Collapse>

      {/* Create Custom Section Modal */}
      <Modal
        title="Create Custom Section"
        open={customSectionModal}
        onOk={handleAddCustomSection}
        onCancel={() => setCustomSectionModal(false)}
        okText="Add Section"
        okButtonProps={{ disabled: !customTitle.trim(), className: '!bg-teal-700' }}
      >
        <div className="flex flex-col gap-3 py-3">
          <div>
            <label className="text-xs text-slate-500 font-bold block mb-1">Section Title</label>
            <Input 
              placeholder="e.g. Volunteer Work, Key Accomplishments" 
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onPressEnter={handleAddCustomSection}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold block mb-1">Layout Presentation Type</label>
            <Radio.Group 
              value={customType} 
              onChange={(e) => setCustomType(e.target.value)}
              className="flex gap-2"
            >
              <Radio.Button value="entries">Sub-Entries (Work/Edu style)</Radio.Button>
              <Radio.Button value="pills">Pill Cloud (Skills style)</Radio.Button>
              <Radio.Button value="text">Paragraph Block (Summary style)</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold block mb-1">Starting Column Placement</label>
            <Radio.Group 
              value={customColumn} 
              onChange={(e) => setCustomColumn(e.target.value)}
            >
              <Radio value="left">Left Column (60% width)</Radio>
              <Radio value="right">Right Column (40% width)</Radio>
            </Radio.Group>
          </div>
        </div>
      </Modal>

      {/* Library Selection Modal */}
      <Modal
        title={`Content Library`}
        open={libraryModal.visible}
        onCancel={() => setLibraryModal(prev => ({ ...prev, visible: false }))}
        footer={null}
      >
        <List
          dataSource={contentLibrary.filter(item => item.category === libraryModal.category)}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="select" size="small" type="primary" icon={<Check size={12} />} onClick={() => {
                  libraryModal.onSelect(item.content);
                  setLibraryModal(prev => ({ ...prev, visible: false }));
                }}>
                  Select
                </Button>
              ]}
            >
              <div className="text-slate-700 pr-4">{item.content}</div>
            </List.Item>
          )}
          locale={{ emptyText: 'No library matches found.' }}
        />
      </Modal>
    </div>
  );
}
