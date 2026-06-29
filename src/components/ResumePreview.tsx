'use client';

import React, { useRef, useLayoutEffect, useState } from 'react';
import { 
  Mail, Phone, MapPin, Github, Linkedin, Globe, 
  GraduationCap, Briefcase, Code, FileText, 
  Users, Award, Languages, Heart, AlertTriangle, GripVertical
} from 'lucide-react';
import { 
  ResumeData, StyleSettings, ResumeSectionOrder, useResumeStore 
} from '../store/resumeStore';
import '../styles/resumeTemplate.css';

interface ResumePreviewProps {
  data: ResumeData;
  style: StyleSettings;
  sections?: ResumeSectionOrder[]; // Optional override, otherwise read from store
  isEditable?: boolean; // Toggles drag-and-drop overlays
  onLayoutCalculated?: (report: LayoutReport) => void;
}

export interface LayoutReport {
  actualPages: number;
  isOverflown: boolean;
  fitsOnePage: boolean;
  didAutoShrink: boolean;
  shrinkLevels: {
    fontSize: number;
    margin: number;
    sectionGap: number;
    lineHeight: number;
  };
}

export default function ResumePreview({ 
  data, 
  style, 
  sections: propSections, 
  isEditable = false, 
  onLayoutCalculated 
}: ResumePreviewProps) {
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { reorderSections, currentResumeId, resumes } = useResumeStore();
  
  // Read section layout from store if not provided as props
  const activeResume = resumes.find(r => r.id === currentResumeId);
  const sections = propSections || activeResume?.sections || [];

  // Destructure data with safety fallbacks to prevent undefined map crashes
  const {
    profile = { name: '', role: '', summary: '', links: [] },
    education = [],
    experience = [],
    projects = [],
    skills = [],
    publications = [],
    organizations = [],
    certifications = [],
    languages = [],
    interests = [],
    customSections = []
  } = data || {};

  // Drag and drop state
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  const [layoutState, setLayoutState] = useState<LayoutReport>({
    actualPages: 1,
    isOverflown: false,
    fitsOnePage: true,
    didAutoShrink: false,
    shrinkLevels: {
      fontSize: style.fontSize,
      margin: style.margin,
      sectionGap: style.sectionGap,
      lineHeight: style.lineHeight,
    }
  });

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    // Apply baseline custom colors and styling constraints
    const primaryColor = style.primaryColor || '#3f8890';
    const metaColor = style.metaColor || '#5a6c7d';

    el.style.setProperty('--resume-primary-color', primaryColor);
    el.style.setProperty('--resume-meta-color', metaColor);
    el.style.setProperty('--resume-font-size', `${style.fontSize}px`);
    el.style.setProperty('--resume-margin', `${style.margin}px`);
    el.style.setProperty('--resume-section-gap', `${style.sectionGap}px`);
    el.style.setProperty('--resume-line-height', `${style.lineHeight}`);

    const PAGE_HEIGHT_PX = 1122; 
    const TWO_PAGE_HEIGHT_PX = 2245;

    let currentFontSize = style.fontSize;
    let currentMargin = style.margin;
    let currentSectionGap = style.sectionGap;
    let currentLineHeight = style.lineHeight;

    const applyVars = (fs: number, m: number, sg: number, lh: number) => {
      el.style.setProperty('--resume-font-size', `${fs}px`);
      el.style.setProperty('--resume-margin', `${m}px`);
      el.style.setProperty('--resume-section-gap', `${sg}px`);
      el.style.setProperty('--resume-line-height', `${lh}`);
    };

    let actualScrollHeight = el.scrollHeight;
    let fitsOnePage = actualScrollHeight <= PAGE_HEIGHT_PX;
    let didAutoShrink = false;

    if (style.autoFit) {
      if (actualScrollHeight > PAGE_HEIGHT_PX) {
        didAutoShrink = true;
        for (let step = 1; step <= 10; step++) {
          currentFontSize = style.fontSize - (step * 0.35);
          currentMargin = style.margin - (step * 1.2);
          currentSectionGap = style.sectionGap - (step * 0.6);
          currentLineHeight = style.lineHeight - (step * 0.015);

          currentFontSize = Math.max(9.5, currentFontSize);
          currentMargin = Math.max(12, currentMargin);
          currentSectionGap = Math.max(8, currentSectionGap);
          currentLineHeight = Math.max(1.15, currentLineHeight);

          applyVars(currentFontSize, currentMargin, currentSectionGap, currentLineHeight);
          
          actualScrollHeight = el.scrollHeight;
          if (actualScrollHeight <= PAGE_HEIGHT_PX) {
            fitsOnePage = true;
            break;
          }
        }
      }
    }

    let actualPages = 1;
    let isOverflown = false;

    if (actualScrollHeight > PAGE_HEIGHT_PX) {
      fitsOnePage = false;
      if (style.maxPages === 2 || style.autoFit) {
        actualPages = 2;
        if (actualScrollHeight > TWO_PAGE_HEIGHT_PX) {
          isOverflown = true;
        }
      } else {
        isOverflown = true;
      }
    }

    const report: LayoutReport = {
      actualPages,
      isOverflown,
      fitsOnePage,
      didAutoShrink,
      shrinkLevels: {
        fontSize: Number(currentFontSize.toFixed(2)),
        margin: Number(currentMargin.toFixed(2)),
        sectionGap: Number(currentSectionGap.toFixed(2)),
        lineHeight: Number(currentLineHeight.toFixed(2))
      }
    };

    setLayoutState(report);
    if (onLayoutCalculated) {
      onLayoutCalculated(report);
    }

  }, [data, style, sections, onLayoutCalculated]);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditable) return;
    setDraggedSectionId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isEditable) return;
    e.preventDefault();
    if (draggedSectionId === id) return;
    setDragOverSectionId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetColumn: 'left' | 'right') => {
    if (!isEditable) return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetId) return;

    reorderSections(draggedId, targetId, targetColumn);
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  const handleDragEnd = () => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  // Profile icon helper
  const renderLinkIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={12} />;
      case 'phone': return <Phone size={12} />;
      case 'location': return <MapPin size={12} />;
      case 'github': return <Github size={12} />;
      case 'linkedin': return <Linkedin size={12} />;
      case 'website': return <Globe size={12} />;
      default: return <Globe size={12} />;
    }
  };

  // Check URL formatting and add prefix if missing
  const formatUrl = (url: string, type: string) => {
    if (!url) return '#';
    if (type === 'email' && !url.startsWith('mailto:')) return `mailto:${url}`;
    if (type === 'phone' && !url.startsWith('tel:')) return `tel:${url}`;
    if (type !== 'email' && type !== 'phone' && !/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  // Section Render Router
  const renderSectionContent = (sectionId: string, isCustom?: boolean, customType?: 'entries' | 'pills' | 'text') => {
    if (isCustom) {
      const customData = customSections.find(c => c.id === sectionId);
      if (!customData) return null;

      if (customType === 'text') {
        return <div className="resume-custom-text">{customData.text}</div>;
      }

      if (customType === 'pills') {
        return (
          <div className="skills-pills-list">
            {(customData.pills || []).map((pill, idx) => (
              <span key={idx} className="skill-pill">
                {pill}
              </span>
            ))}
          </div>
        );
      }

      if (customType === 'entries') {
        return (
          <div>
            {(customData.items || []).map((item) => (
              <div key={item.id} className="resume-entry">
                <div className="resume-entry-header">
                  <span>{item.title}</span>
                  <span className="font-normal text-slate-500">{item.startDate} - {item.endDate}</span>
                </div>
                <div className="resume-entry-sub">
                  <span>{item.subtitle}</span>
                  <span className="resume-entry-location">{item.location}</span>
                </div>
                {item.description && (
                  <p className="mt-1.5 text-slate-700 text-[11.5px] leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      }
      return null;
    }

    // Standard pre-defined sections
    switch (sectionId) {
      case 'education':
        return education.map((item) => (
          <div key={item.id} className="resume-entry">
            <div className="resume-entry-header">
              <span>{item.degree}</span>
              <span className="font-normal text-slate-500">{item.startDate} - {item.endDate}</span>
            </div>
            <div className="resume-entry-sub">
              <span>{item.school}</span>
              <span className="resume-entry-location">{item.location}</span>
            </div>
          </div>
        ));

      case 'experience':
        return experience.map((item) => (
          <div key={item.id} className="resume-entry">
            <div className="resume-entry-header">
              <span>{item.position}</span>
              <span className="font-normal text-slate-500">{item.startDate} - {item.endDate}</span>
            </div>
            <div className="resume-entry-sub">
              <span>{item.company}</span>
              <span className="resume-entry-location">{item.location}</span>
            </div>
            {item.highlights && item.highlights.length > 0 && (
              <ul className="resume-entry-highlights">
                {item.highlights.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        ));

      case 'projects':
        return projects.map((item) => (
          <div key={item.id} className="resume-entry">
            <div className="resume-entry-header">
              <span>{item.name}</span>
              <span className="font-normal text-slate-500">{item.startDate} - {item.endDate}</span>
            </div>
            {item.highlights && item.highlights.length > 0 && (
              <ul className="resume-entry-highlights">
                {item.highlights.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        ));

      case 'skills':
        return (
          <div className="skills-container">
            {skills.map((item) => (
              <div key={item.id} className="skill-category-block">
                <span className="skill-category-name">{item.name}</span>
                <div className="skills-pills-list">
                  {(item.items || '').split(',').map((skill, idx) => {
                    const trimSkill = skill.trim();
                    if (!trimSkill) return null;
                    return (
                      <span key={idx} className="skill-pill">
                        {trimSkill}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'publications':
        return publications.map((item) => (
          <p key={item.id} className="simple-list-item">
            • {item.title}
          </p>
        ));

      case 'organizations':
        return organizations.map((item) => (
          <div key={item.id} className="resume-entry">
            <div className="resume-entry-header">
              <span>{item.name}</span>
            </div>
            <div className="resume-entry-sub">
              <span>{item.role}</span>
              <span className="font-normal text-slate-500">{item.startDate} - {item.endDate}</span>
            </div>
            {item.description && (
              <p className="mt-1 text-slate-600 text-xs italic leading-snug">
                {item.description}
              </p>
            )}
          </div>
        ));

      case 'certifications':
        return certifications.map((item) => (
          <p key={item.id} className="simple-list-item">
            <strong>{item.name}</strong> | {item.issuer}
          </p>
        ));

      case 'languages':
        return languages.map((item) => (
          <div key={item.id} className="language-item">
            <span className="language-name">{item.name}</span>
            <span className="language-proficiency">{item.proficiency}</span>
          </div>
        ));

      case 'interests':
        return (
          <div className="interest-pills">
            {interests.map((interest, idx) => (
              <span key={idx} className="interest-pill skill-pill">
                {interest}
              </span>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Filter sections by column
  const leftSections = sections.filter(s => s.column === 'left' && s.visible);
  const rightSections = sections.filter(s => s.column === 'right' && s.visible);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div 
        ref={canvasRef} 
        className={`resume-page-canvas ${layoutState.actualPages === 2 ? 'two-pages' : ''}`}
      >
        {/* Header Section */}
        <header className="resume-header">
          <div className="resume-header-left">
            <h1 className="resume-name">{profile.name || 'Your Name'}</h1>
            <p className="resume-role">{profile.role || 'Your Target Role'}</p>
            {profile.summary && (
              <p className="resume-summary-text">{profile.summary}</p>
            )}
          </div>
          
          <div className="resume-header-right">
            {profile.links && profile.links.map((link) => (
              <a 
                key={link.id} 
                href={formatUrl(link.url, link.type)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-item-link"
              >
                <span>{link.label || link.url}</span>
                {renderLinkIcon(link.type)}
              </a>
            ))}
          </div>
        </header>

        {/* Double-Column Layout */}
        <div className="resume-body-grid">
          
          {/* Left Column */}
          <div className="resume-column-left">
            {leftSections.map((section) => {
              const isOver = dragOverSectionId === section.id;
              return (
                <div
                  key={section.id}
                  draggable={isEditable}
                  onDragStart={(e) => handleDragStart(e, section.id)}
                  onDragOver={(e) => handleDragOver(e, section.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, section.id, 'left')}
                  className={`resume-section ${isEditable ? 'draggable-section draggable-section-active-hover' : ''} ${isOver ? 'drag-over-section' : ''}`}
                >
                  {isEditable && (
                    <div className="absolute right-2 top-2 opacity-0 hover:opacity-100 drag-handle-overlay transition-opacity z-10 bg-white shadow p-0.5 rounded cursor-grab">
                      <GripVertical size={12} className="text-slate-400" />
                    </div>
                  )}
                  <h2 className="resume-section-title">
                    <span>{section.title}</span>
                  </h2>
                  <div>
                    {renderSectionContent(section.id, section.isCustom, section.customType)}
                  </div>
                </div>
              );
            })}
            
            {/* Left dropzone when dragging */}
            {isEditable && draggedSectionId && (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'empty-left', 'left')}
                className="empty-drop-zone hover:drag-over"
              >
                Drop section here
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="resume-column-right">
            {rightSections.map((section) => {
              const isOver = dragOverSectionId === section.id;
              return (
                <div
                  key={section.id}
                  draggable={isEditable}
                  onDragStart={(e) => handleDragStart(e, section.id)}
                  onDragOver={(e) => handleDragOver(e, section.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, section.id, 'right')}
                  className={`resume-section ${isEditable ? 'draggable-section draggable-section-active-hover' : ''} ${isOver ? 'drag-over-section' : ''}`}
                >
                  {isEditable && (
                    <div className="absolute right-2 top-2 opacity-0 hover:opacity-100 drag-handle-overlay transition-opacity z-10 bg-white shadow p-0.5 rounded cursor-grab">
                      <GripVertical size={12} className="text-slate-400" />
                    </div>
                  )}
                  <h2 className="resume-section-title">
                    <span>{section.title}</span>
                  </h2>
                  <div>
                    {renderSectionContent(section.id, section.isCustom, section.customType)}
                  </div>
                </div>
              );
            })}

            {/* Right dropzone when dragging */}
            {isEditable && draggedSectionId && (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'empty-right', 'right')}
                className="empty-drop-zone hover:drag-over"
              >
                Drop section here
              </div>
            )}
          </div>
          
        </div>

        {layoutState.actualPages === 2 && (
          <>
            <div className="page-break-line" />
            <div className="page-break-label">PAGE 2 BEGINS</div>
          </>
        )}
      </div>
    </div>
  );
}
