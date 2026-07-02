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

  // Custom API key state and actions
  userApiKey: string | null;
  isUserApiKeyVerified: boolean;
  setUserApiKey: (key: string | null) => void;
  setApiKeyVerified: (verified: boolean) => void;

  // Authentication state and actions
  user: { name: string; email: string; avatarUrl?: string } | null;
  loginUser: (name: string, email: string, avatarUrl?: string) => void;
  logoutUser: () => void;
}

const defaultDummyData: ResumeData = {
  profile: {
    name: 'John Doe',
    role: 'Software Engineer',
    summary: 'Detail-oriented Software Engineer with a strong background in developing scalable web applications, machine learning integration, and frontend systems. Passionate about writing clean, maintainable code and solving complex technical challenges.',
    links: [
      { id: 'lnk-1', type: 'email', label: 'john.doe@example.com', url: 'mailto:john.doe@example.com' },
      { id: 'lnk-2', type: 'phone', label: '+49 123 4567890', url: 'tel:+491234567890' },
      { id: 'lnk-3', type: 'location', label: 'Berlin, Germany', url: 'https://maps.google.com/?q=Berlin,%20Germany' },
      { id: 'lnk-4', type: 'github', label: 'github.com/johndoe', url: 'https://github.com/johndoe' }
    ]
  },
  education: [
    {
      id: 'edu-1',
      school: 'Technical University of Berlin',
      degree: 'Masters In Computer Science',
      startDate: '10/2024',
      endDate: 'Present',
      location: 'Berlin, Germany'
    },
    {
      id: 'edu-2',
      school: 'State University',
      degree: 'Bachelors in Computer Applications',
      startDate: '08/2020',
      endDate: '07/2023',
      location: 'Munich, Germany'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Innovations GmbH',
      position: 'Software Developer',
      startDate: '11/2025',
      endDate: 'Present',
      location: 'Berlin, Germany',
      highlights: [
        'Contributed to a cloud-based web application, optimizing database search query speeds by 40% and improving page load latency.',
        'Developed a modernization prototype for the customer dashboard using React, Tailwind CSS, and Next.js, significantly improving UI/UX responsiveness.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Alpha Web Solutions',
      position: 'Web Lead',
      startDate: '10/2023',
      endDate: '05/2024',
      location: 'Munich, Germany',
      highlights: [
        'Led front-end development of multiple responsive web interfaces, collaborating with design and product teams to deliver high-quality user experiences.',
        'Integrated third-party RESTful APIs, securing authentication and authorization mechanisms using OAuth 2.0.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Smart Home IoT Dashboard',
      startDate: '02/2023',
      endDate: '02/2023',
      highlights: [
        'Co-developed a real-time smart home monitoring dashboard using React, Node.js, and WebSocket connection for low-latency updates.'
      ]
    },
    {
      id: 'proj-2',
      name: 'Task Management Web App',
      startDate: '09/2022',
      endDate: '11/2022',
      highlights: [
        'Developed a full-stack task management system with user authentication, custom categorization, and drag-and-drop workflow functionality.'
      ]
    }
  ],
  skills: [
    { id: 'sk-1', name: 'Languages', items: 'Python, JavaScript, TypeScript, Go, C++' },
    { id: 'sk-2', name: 'Databases', items: 'PostgreSQL, MongoDB, Redis, MySQL' },
    { id: 'sk-3', name: 'Frameworks & Libraries', items: 'React, Next.js, Express, Tailwind CSS, Redux' },
    { id: 'sk-4', name: 'Cloud & DevOps', items: 'Docker, Kubernetes, AWS, Git' }
  ],
  publications: [
    { id: 'pub-1', title: 'A Comparative Study on Microservices Architecture and Monolithic Applications.' },
    { id: 'pub-2', title: 'Designing Secure API Gateways for Modern Web Services.' }
  ],
  organizations: [
    {
      id: 'org-1',
      name: 'Open Source Community',
      role: 'Contributor',
      startDate: '04/2021',
      endDate: '10/2024',
      description: 'Mentored new contributors, maintained documentation, and contributed features to popular open-source packages.'
    }
  ],
  certifications: [
    { id: 'cert-1', name: 'Certified Solutions Architect', issuer: 'AWS' },
    { id: 'cert-2', name: 'Full Stack Developer Certification', issuer: 'Meta' }
  ],
  languages: [
    { id: 'lang-1', name: 'English', proficiency: 'Native or Bilingual Proficiency' },
    { id: 'lang-2', name: 'German', proficiency: 'Limited Working Proficiency' },
    { id: 'lang-3', name: 'Spanish', proficiency: 'Professional Working Proficiency' }
  ],
  interests: ['Open Source Contribution', 'Hiking', 'Reading'],
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
          id: 'dummy-resume',
          title: 'Default Professional Resume',
          updatedAt: new Date().toISOString(),
          data: defaultDummyData,
          style: defaultStyle,
          sections: [...defaultSectionsOrder]
        }
      ],
      currentResumeId: 'dummy-resume',
      contentLibrary: [
        {
          id: 'lib-1',
          category: 'summary',
          content: 'Detail-oriented computer science student with hands-on experience in full-stack software development, machine learning algorithms, and embedding IoT solutions.'
        },
        {
          id: 'lib-2',
          category: 'bullet',
          content: 'Implemented RESTful APIs and modern frontend architectures, improving rendering efficiency and data fetching latency by 30%'
        }
      ],
      userApiKey: null,
      isUserApiKeyVerified: false,
      setUserApiKey: (key) => set({ userApiKey: key }),
      setApiKeyVerified: (verified) => set({ isUserApiKeyVerified: verified }),

      // Auth state initializers
      user: null,
      loginUser: (name, email, avatarUrl) => set({ user: { name, email, avatarUrl } }),
      logoutUser: () => set({ user: null }),

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
