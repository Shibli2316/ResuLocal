import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ContactLink {
  id: string;
  type: 'email' | 'phone' | 'location' | 'github' | 'linkedin' | 'website' | 'custom';
  label: string;
  url: string;
}

export interface ProfileInfo {
  name: string;
  role: string;
  summary: string;
  links: ContactLink[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  location: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  items: string; // Comma-separated list for easy editing
}

export interface PublicationItem {
  id: string;
  title: string;
}

export interface OrganizationItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface CustomSectionData {
  id: string;
  title: string;
  type: 'entries' | 'pills' | 'text';
  items: CustomSectionItem[];
  pills: string[];
  text: string;
}

export interface ResumeData {
  profile: ProfileInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  publications: PublicationItem[];
  organizations: OrganizationItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  interests: string[];
  customSections: CustomSectionData[];
}

export interface StyleSettings {
  autoFit: boolean;
  maxPages: number;
  fontSize: number;
  lineHeight: number;
  margin: number;
  sectionGap: number;
  primaryColor?: string; // Default: #3f8890
  metaColor?: string; // Default: #5a6c7d
}

export interface ResumeSectionOrder {
  id: string;
  title: string;
  column: 'left' | 'right';
  visible: boolean;
  isCustom?: boolean;
  customType?: 'entries' | 'pills' | 'text';
}

export interface Resume {
  id: string;
  title: string;
  updatedAt: string;
  data: ResumeData;
  style: StyleSettings;
  sections: ResumeSectionOrder[];
}

export interface LibraryItem {
  id: string;
  category: 'bullet' | 'summary' | 'skill';
  content: string;
}

interface ResumeState {
  resumes: Resume[];
  currentResumeId: string | null;
  contentLibrary: LibraryItem[];
  
  // Resume actions
  addResume: (title: string) => string;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  renameResume: (id: string, newTitle: string) => void;
  setCurrentResumeId: (id: string | null) => void;
  updateResumeData: (updater: (data: ResumeData) => void) => void;
  updateResumeStyle: (updater: (style: StyleSettings) => void) => void;
  
  // Section Reordering & Layout templates
  reorderSections: (draggedId: string, targetId: string, targetColumn: 'left' | 'right') => void;
  applyTemplateLayout: (templateId: number) => void;
  
  // Custom Sections
  addCustomSection: (title: string, type: 'entries' | 'pills' | 'text', column: 'left' | 'right') => void;
  deleteCustomSection: (id: string) => void;

  // Library actions
  addToLibrary: (category: 'bullet' | 'summary' | 'skill', content: string) => void;
  removeFromLibrary: (id: string) => void;
}

const defaultAhmadData: ResumeData = {
  profile: {
    name: 'Ahmad Raza Shibli',
    role: 'Working Student',
    summary: 'Master’s student in Applied CS at Georg-August Universität Göttingen specializing in software development, ML, and freelance projects. Proficient in Python and C++, and passionate about video editing, reading, and traveling.',
    links: [
      { id: 'lnk-1', type: 'email', label: 'arshibli19@gmail.com', url: 'mailto:arshibli19@gmail.com' },
      { id: 'lnk-2', type: 'phone', label: '015214990547', url: 'tel:015214990547' },
      { id: 'lnk-3', type: 'location', label: 'Gottingen, Germany', url: 'https://maps.google.com/?q=Gottingen,%20Germany' },
      { id: 'lnk-4', type: 'github', label: 'github.com/Shibli2316', url: 'https://github.com/Shibli2316' }
    ]
  },
  education: [
    {
      id: 'edu-1',
      school: 'University of Gottingen',
      degree: 'Masters In Applied Computer Science',
      startDate: '04/2024',
      endDate: 'Present',
      location: 'Gottingen, Germany'
    },
    {
      id: 'edu-2',
      school: 'Aligarh Muslim University',
      degree: 'Bachelors in Computer Applications',
      startDate: '08/2020',
      endDate: '07/2023',
      location: 'Aligarh, India'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Göttingen Digital Academy',
      position: 'Software Developer',
      startDate: '10/2025',
      endDate: 'Present',
      location: 'Göttingen, Germany',
      highlights: [
        'Contributed to the digitalization of historical papal charters by implementing geocoding features and optimizing database filtering and query performance for efficient archival data management and visualization.',
        'Developed LiMoST, a modernized end-to-end web interface for the Motiv-, Stoff- und Themenbibliographie system, improving the original 2002 platform through enhanced UI/UX, frontend integration, and streamlined user navigation.'
      ]
    },
    {
      id: 'exp-2',
      company: 'SS AMU SAT',
      position: 'Web Lead',
      startDate: '10/2023',
      endDate: '05/2024',
      location: 'Aligarh, India',
      highlights: [
        'Led end-to-end development of satellite operations software, including backend systems, database design, and responsive front-end interfaces using modern web technologies.',
        'Built secure and optimized systems for telemetry and mission-control data management, while collaborating with interdisciplinary teams to integrate software with satellite hardware and ground systems.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Driver Drowsiness Detection System',
      startDate: '02/2023',
      endDate: '02/2023',
      highlights: [
        'Co-developed a Driver Drowsiness Detection System using OpenCV and Pygame. Implemented real-time eye monitoring, customizable alert thresholds, and automated audio alerts with an intuitive user interface.'
      ]
    },
    {
      id: 'proj-2',
      name: 'SMART (Student Management and Retention Technology)',
      startDate: '09/2022',
      endDate: '11/2022',
      highlights: [
        'Developed a LAMP-based web application to manage the complete student lifecycle, from admission to alumni transition. Integrated Arduino-powered dynamic timetables, course selection, study material access, and responsive UI design using Tailwind CSS.'
      ]
    }
  ],
  skills: [
    { id: 'sk-1', name: 'Languages', items: 'Python, C++, Java, Bash(Linux)' },
    { id: 'sk-2', name: 'Databases', items: 'MySQL, PostgreSQL, MongoDB, Firebase' },
    { id: 'sk-3', name: 'Machine Learning/Deep Learning', items: 'NumPy, Terraform, OpenCV' },
    { id: 'sk-4', name: 'Frontend', items: 'React, Tailwind, JavaScript, Material UI, Redux' },
    { id: 'sk-5', name: 'Backend', items: 'Laravel, JS, Flask, PHP' },
    { id: 'sk-6', name: 'Version Control and Automation', items: 'Git, n8n' },
    { id: 'sk-7', name: 'IoT', items: 'Arduino, Raspberry Pi, ESP32, Hailo-8L' },
    { id: 'sk-8', name: 'Cloud', items: 'Google Cloud, Heroku' }
  ],
  publications: [
    { id: 'pub-1', title: 'Diagnosing coronaviruses (COVID-19) using machine learning.' },
    { id: 'pub-2', title: 'Machine Learning-Based Predictive Modeling of Student Counseling Gratification: A Case Study of AMU.' },
    { id: 'pub-3', title: 'A Novel Approach to Key Exchange: Dual-Secured Diffie-Hellman with RSA Integration.' },
    { id: 'pub-4', title: 'Ubiquitous Computing with Radio Frequency Identification Tags.' }
  ],
  organizations: [
    {
      id: 'org-1',
      name: 'Google Students Developer Club',
      role: 'ML Lead and Mentor',
      startDate: '04/2021',
      endDate: '10/2024',
      description: 'Organized and mentored multiple technical events, serving in leadership roles including ML Lead and Mentor during the final year.'
    }
  ],
  certifications: [
    { id: 'cert-1', name: 'Python for Data Science, AI & Development', issuer: 'IBM' },
    { id: 'cert-2', name: 'Developing AI Applications with Python and Flask', issuer: 'IBM' }
  ],
  languages: [
    { id: 'lang-1', name: 'English', proficiency: 'Native or Bilingual Proficiency' },
    { id: 'lang-2', name: 'German', proficiency: 'Limited Working Proficiency' },
    { id: 'lang-3', name: 'Hindi', proficiency: 'Native or Bilingual Proficiency' },
    { id: 'lang-4', name: 'Urdu', proficiency: 'Native or Bilingual Proficiency' }
  ],
  interests: ['Traveling', 'Hiking', 'Reading'],
  customSections: []
};

const defaultStyle: StyleSettings = {
  autoFit: true,
  maxPages: 1,
  fontSize: 13,
  lineHeight: 1.3,
  margin: 24,
  sectionGap: 14,
  primaryColor: '#3f8890',
  metaColor: '#5a6c7d'
};

const defaultSectionsOrder: ResumeSectionOrder[] = [
  { id: 'education', title: 'Education', column: 'left', visible: true },
  { id: 'experience', title: 'Work Experience', column: 'left', visible: true },
  { id: 'skills', title: 'Skills', column: 'right', visible: true },
  { id: 'projects', title: 'Personal Projects', column: 'right', visible: true },
  { id: 'organizations', title: 'Organizations', column: 'right', visible: true },
  { id: 'certifications', title: 'Certifications', column: 'right', visible: true },
  { id: 'publications', title: 'Publications', column: 'right', visible: true },
  { id: 'languages', title: 'Languages', column: 'right', visible: true },
  { id: 'interests', title: 'Interests', column: 'right', visible: true }
];

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [
        {
          id: 'ahmad-student',
          title: 'Ahmad - Working Student',
          updatedAt: new Date().toISOString(),
          data: defaultAhmadData,
          style: defaultStyle,
          sections: [...defaultSectionsOrder]
        }
      ],
      currentResumeId: 'ahmad-student',
      contentLibrary: [
        {
          id: 'lib-1',
          category: 'summary',
          content: 'Detail-oriented computer science student with hands-on experience in full-stack software development, machine learning algorithms, and embedding IoT solutions.'
        },
        {
          id: 'lib-2',
          category: 'bullet',
          content: 'Implemented RESTful APIs and modern frontend architectures, improving rendering efficiency and data fetching latency by 30%.'
        }
      ],

      addResume: (title) => {
        const id = `resume-${Date.now()}`;
        const newResume: Resume = {
          id,
          title,
          updatedAt: new Date().toISOString(),
          data: {
            profile: { name: '', role: '', summary: '', links: [] },
            education: [],
            experience: [],
            projects: [],
            skills: [],
            publications: [],
            organizations: [],
            certifications: [],
            languages: [],
            interests: [],
            customSections: []
          },
          style: { ...defaultStyle },
          sections: [...defaultSectionsOrder]
        };
        set((state) => ({
          resumes: [...state.resumes, newResume],
          currentResumeId: id
        }));
        return id;
      },

      duplicateResume: (id) => {
        const target = get().resumes.find((r) => r.id === id);
        if (!target) return;
        const newId = `resume-${Date.now()}`;
        const duplicate: Resume = {
          ...target,
          id: newId,
          title: `${target.title} (Copy)`,
          updatedAt: new Date().toISOString(),
          data: JSON.parse(JSON.stringify(target.data)), // Deep copy
          style: { ...target.style },
          sections: JSON.parse(JSON.stringify(target.sections))
        };
        set((state) => ({
          resumes: [...state.resumes, duplicate],
          currentResumeId: newId
        }));
      },

      deleteResume: (id) => {
        set((state) => {
          const filtered = state.resumes.filter((r) => r.id !== id);
          let nextActive = state.currentResumeId;
          if (state.currentResumeId === id) {
            nextActive = filtered.length > 0 ? filtered[0].id : null;
          }
          return {
            resumes: filtered,
            currentResumeId: nextActive
          };
        });
      },

      renameResume: (id, newTitle) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, title: newTitle, updatedAt: new Date().toISOString() } : r
          )
        }));
      },

      setCurrentResumeId: (id) => {
        set({ currentResumeId: id });
      },

      updateResumeData: (updater) => {
        const { currentResumeId, resumes } = get();
        if (!currentResumeId) return;
        
        set({
          resumes: resumes.map((r) => {
            if (r.id === currentResumeId) {
              const freshData = JSON.parse(JSON.stringify(r.data)); // Deep clone
              updater(freshData);
              return {
                ...r,
                data: freshData,
                updatedAt: new Date().toISOString()
              };
            }
            return r;
          })
        });
      },

      updateResumeStyle: (updater) => {
        const { currentResumeId, resumes } = get();
        if (!currentResumeId) return;
        
        set({
          resumes: resumes.map((r) => {
            if (r.id === currentResumeId) {
              const freshStyle = { ...r.style };
              updater(freshStyle);
              return {
                ...r,
                style: freshStyle,
                updatedAt: new Date().toISOString()
              };
            }
            return r;
          })
        });
      },

      // HTML5 Drag and Drop Reordering
      reorderSections: (draggedId, targetId, targetColumn) => {
        const { currentResumeId, resumes } = get();
        if (!currentResumeId) return;

        set({
          resumes: resumes.map((r) => {
            if (r.id === currentResumeId) {
              const sections = [...r.sections];
              const draggedIndex = sections.findIndex((s) => s.id === draggedId);
              if (draggedIndex === -1) return r;

              const draggedItem = { ...sections[draggedIndex], column: targetColumn };
              sections.splice(draggedIndex, 1);

              if (targetId.startsWith('empty-')) {
                // Dragged to empty column dropzone
                const col = targetId.split('-')[1] as 'left' | 'right';
                draggedItem.column = col;
                sections.push(draggedItem);
              } else {
                let targetIndex = sections.findIndex((s) => s.id === targetId);
                if (targetIndex === -1) {
                  sections.push(draggedItem);
                } else {
                  sections.splice(targetIndex, 0, draggedItem);
                }
              }

              return {
                ...r,
                sections,
                updatedAt: new Date().toISOString()
              };
            }
            return r;
          })
        });
      },

      // Apply Layout Templates
      applyTemplateLayout: (templateId) => {
        const { currentResumeId, resumes } = get();
        if (!currentResumeId) return;

        let newOrder: ResumeSectionOrder[] = [];

        if (templateId === 1) {
          newOrder = [
            { id: 'education', title: 'Education', column: 'left', visible: true },
            { id: 'experience', title: 'Work Experience', column: 'left', visible: true },
            { id: 'skills', title: 'Skills', column: 'right', visible: true },
            { id: 'projects', title: 'Personal Projects', column: 'right', visible: true },
            { id: 'organizations', title: 'Organizations', column: 'right', visible: true },
            { id: 'certifications', title: 'Certifications', column: 'right', visible: true },
            { id: 'languages', title: 'Languages', column: 'right', visible: true },
            { id: 'interests', title: 'Interests', column: 'right', visible: true }
          ];
        } else if (templateId === 2) {
          newOrder = [
            { id: 'education', title: 'Education', column: 'left', visible: true },
            { id: 'experience', title: 'Work Experience', column: 'left', visible: true },
            { id: 'organizations', title: 'Organizations', column: 'left', visible: true },
            { id: 'skills', title: 'Skills', column: 'right', visible: true },
            { id: 'projects', title: 'Personal Projects', column: 'right', visible: true },
            { id: 'certifications', title: 'Certifications', column: 'right', visible: true },
            { id: 'publications', title: 'Publications', column: 'right', visible: true },
            { id: 'languages', title: 'Languages', column: 'right', visible: true },
            { id: 'interests', title: 'Interests', column: 'right', visible: true }
          ];
        } else if (templateId === 3) {
          newOrder = [
            { id: 'education', title: 'Education', column: 'left', visible: true },
            { id: 'projects', title: 'Personal Projects', column: 'left', visible: true },
            { id: 'experience', title: 'Work Experience', column: 'left', visible: true },
            { id: 'skills', title: 'Skills', column: 'right', visible: true },
            { id: 'publications', title: 'Publications', column: 'right', visible: true },
            { id: 'organizations', title: 'Organizations', column: 'right', visible: true },
            { id: 'certifications', title: 'Certifications', column: 'right', visible: true },
            { id: 'languages', title: 'Languages', column: 'right', visible: true },
            { id: 'interests', title: 'Interests', column: 'right', visible: true }
          ];
        }

        set({
          resumes: resumes.map((r) => {
            if (r.id === currentResumeId) {
              // Maintain any custom sections that aren't defined in standard layouts
              const customSections = r.sections.filter(s => s.isCustom);
              // Append custom sections to the right column by default
              const combinedOrder = [
                ...newOrder,
                ...customSections.map(s => ({ ...s, column: 'right' as const }))
              ];

              return {
                ...r,
                sections: combinedOrder,
                updatedAt: new Date().toISOString()
              };
            }
            return r;
          })
        });
      },

      // Add Custom Sections
      addCustomSection: (title, type, column) => {
        const { currentResumeId, resumes } = get();
        if (!currentResumeId) return;

        const customId = `custom-${Date.now()}`;
        const newOrderSection: ResumeSectionOrder = {
          id: customId,
          title,
          column,
          visible: true,
          isCustom: true,
          customType: type
        };

        const newCustomData: CustomSectionData = {
          id: customId,
          title,
          type,
          items: [],
          pills: [],
          text: ''
        };

        set({
          resumes: resumes.map((r) => {
            if (r.id === currentResumeId) {
              return {
                ...r,
                sections: [...r.sections, newOrderSection],
                data: {
                  ...r.data,
                  customSections: [...r.data.customSections, newCustomData]
                },
                updatedAt: new Date().toISOString()
              };
            }
            return r;
          })
        });
      },

      // Delete Custom Sections
      deleteCustomSection: (id) => {
        const { currentResumeId, resumes } = get();
        if (!currentResumeId) return;

        set({
          resumes: resumes.map((r) => {
            if (r.id === currentResumeId) {
              return {
                ...r,
                sections: r.sections.filter(s => s.id !== id),
                data: {
                  ...r.data,
                  customSections: r.data.customSections.filter(c => c.id !== id)
                },
                updatedAt: new Date().toISOString()
              };
            }
            return r;
          })
        });
      },

      addToLibrary: (category, content) => {
        const item: LibraryItem = {
          id: `lib-item-${Date.now()}`,
          category,
          content: content.trim()
        };
        const duplicates = get().contentLibrary.some((i) => i.category === category && i.content === item.content);
        if (duplicates) return;
        
        set((state) => ({
          contentLibrary: [...state.contentLibrary, item]
        }));
      },

      removeFromLibrary: (id) => {
        set((state) => ({
          contentLibrary: state.contentLibrary.filter((item) => item.id !== id)
        }));
      }
    }),
    {
      name: 'resume-builder-store',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (persistedState && Array.isArray(persistedState.resumes)) {
          persistedState.resumes = persistedState.resumes.map((r: any) => {
            const data = r.data || {};
            const profile = data.profile || {};
            const style = r.style || {};
            
            // Build clickable links array from old static properties if links is empty
            const links = profile.links || [];
            if (links.length === 0) {
              if (profile.email) links.push({ id: 'lnk-email', type: 'email', label: profile.email, url: `mailto:${profile.email}` });
              if (profile.phone) links.push({ id: 'lnk-phone', type: 'phone', label: profile.phone, url: `tel:${profile.phone}` });
              if (profile.location) links.push({ id: 'lnk-loc', type: 'location', label: profile.location, url: `https://maps.google.com/?q=${profile.location}` });
              if (profile.github) links.push({ id: 'lnk-git', type: 'github', label: profile.github, url: `https://${profile.github}` });
              if (profile.linkedin) links.push({ id: 'lnk-link', type: 'linkedin', label: 'LinkedIn', url: `https://${profile.linkedin}` });
              if (profile.website) links.push({ id: 'lnk-web', type: 'website', label: 'Website', url: `https://${profile.website}` });
            }

            return {
              ...r,
              sections: r.sections || [
                { id: 'education', title: 'Education', column: 'left', visible: true },
                { id: 'experience', title: 'Work Experience', column: 'left', visible: true },
                { id: 'skills', title: 'Skills', column: 'right', visible: true },
                { id: 'projects', title: 'Personal Projects', column: 'right', visible: true },
                { id: 'organizations', title: 'Organizations', column: 'right', visible: true },
                { id: 'certifications', title: 'Certifications', column: 'right', visible: true },
                { id: 'publications', title: 'Publications', column: 'right', visible: true },
                { id: 'languages', title: 'Languages', column: 'right', visible: true },
                { id: 'interests', title: 'Interests', column: 'right', visible: true }
              ],
              style: {
                primaryColor: '#3f8890',
                metaColor: '#5a6c7d',
                ...style
              },
              data: {
                education: [],
                experience: [],
                projects: [],
                skills: [],
                publications: [],
                organizations: [],
                certifications: [],
                languages: [],
                interests: [],
                customSections: [],
                ...data,
                profile: {
                  name: '',
                  role: '',
                  summary: '',
                  ...profile,
                  links
                }
              }
            };
          });
        }
        return persistedState;
      }
    }
  )
);
