import { GoogleGenAI } from '@google/genai';

// Expose a client helper to dynamically create a GoogleGenAI instance using either client key or server env fallback
export const getGenAIClientWithKey = (userApiKey?: string | null) => {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const genAI = getGenAIClientWithKey();

export function isAiEnabled(): boolean {
  return !!genAI;
}

// Fallback Mock Data for ATS Simulation
export const getMockAtsReport = (resumeName: string, jobTitle: string) => {
  return {
    matchScore: 78,
    formattingWarnings: [
      "Ensure all project dates include months (e.g. 02/2023 instead of just 2023).",
      "Add your LinkedIn profile link to the contact details section.",
      "Check that your GPA is listed if requested by the university recruiter."
    ],
    contentGaps: [
      `Your summary does not highlight the specific interest in the "${jobTitle || 'target'}" role.`,
      "The work highlights at Göttingen Digital Academy lack clear percentage-based quantitative metrics (e.g., 'improved query performance by 40%').",
      "Mention your experience with CI/CD tools or pipeline deployment if applying for a cloud-heavy role."
    ],
    keywordOptimization: [
      { keyword: "CI/CD", frequencyInJob: 3, action: "add" },
      { keyword: "Docker", frequencyInJob: 4, action: "add" },
      { keyword: "Kubernetes", frequencyInJob: 2, action: "add" },
      { keyword: "RESTful APIs", frequencyInJob: 3, action: "rephrase" },
      { keyword: "Unit Testing", frequencyInJob: 2, action: "add" }
    ]
  };
};

// Fallback Mock Data for Cover Letter
export const getMockCoverLetter = (name: string, role: string, jobDesc: string) => {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const englishText = `${name}
Berlin, Germany
john.doe@example.com | +49 123 4567890

${date}

Hiring Manager
Recruitment Committee

Subject: Application for ${role || 'Software Engineer'} Position

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${role || 'Software Developer'} position. As a Master's student in Computer Science at the Technical University of Berlin specializing in software development, machine learning, and database management, my background aligns perfectly with your team's current initiatives.

During my tenure at Tech Innovations GmbH, I actively contributed to a cloud-based web application. By optimizing database query performance and page load latency, I significantly enhanced indexing efficiency. Additionally, I spearheaded the frontend overhaul of the customer dashboard, creating a modern, streamlined user workflow. These experiences sharpened my skills in Python, React, databases, and responsive UI design.

Your job description highlights a need for developers who are comfortable bridging backend optimization with elegant user interfaces. In my role as contributor for the Open Source Community, I managed end-to-end design of modern web services. I am eager to apply this rigorous full-stack expertise to your engineering projects.

Thank you for your time and consideration. I look forward to the possibility of discussing how my technical background and proactive approach can contribute to your team.

Sincerely,

${name}`;

  const germanText = `${name}
Berlin, Deutschland
john.doe@example.com | +49 123 4567890

${date}

Personalabteilung
Auswahlkommission

Betreff: Bewerbung als ${role || 'Softwareentwickler'}

Sehr geehrte Damen und Herren,

ich schreibe Ihnen, um mein großes Interesse an der Position als ${role || 'Softwareentwickler'} zu bekunden. Als Masterstudent der Informatik an der Technische Universität Berlin mit Schwerpunkt Softwareentwicklung, maschinelles Lernen und Datenbankmanagement passt mein Profil ideal zu den aktuellen Projekten Ihres Teams.

Während meiner Tätigkeit bei der Tech Innovations GmbH habe ich aktiv an einer cloudbasierten Webanwendung mitgewirkt. Durch die Optimierung der Datenbankleistung konnte ich die Effizienz steigern. Darüber hinaus leitete ich die Überarbeitung des Kunden-Dashboards, um ein modernes und benutzerfreundliches Frontend zu schaffen.

Vielen Dank für Ihre Zeit und Berücksichtigung. Ich freue mich darauf, in einem persönlichen Gespräch zu erörtern, wie mein technischer Hintergrund Ihr Team verstärken kann.

Mit freundlichen Grüßen

${name}`;

  return {
    coverLetter: englishText,
    coverLetterGerman: germanText,
    companyName: "Tech Innovations Academy",
    contactEmail: "recruitment@techinnovations.de",
    personResponsible: "Hiring Manager",
    cvSuggestions: [
      "Add direct percentage metrics to your Tech Innovations experience descriptions.",
      "Incorporate key matching keywords like database query performance and front-end optimization directly into your Skills section.",
      "List AWS and Kubernetes under your Technical Skills section as they are explicitly requested."
    ]
  };
};

export const getMockTesterReport = (userLetter: string, jobTitle: string) => {
  return {
    score: 85,
    grammarErrors: [
      {
        original: "thier",
        correction: "their",
        reason: "Spelling error: 'thier' should be spelled 'their'."
      },
      {
        original: "i am writing",
        correction: "I am writing",
        reason: "Capitalization: Pronoun 'I' should always be capitalized."
      }
    ],
    improvementPoints: [
      "Incorporate more quantitative metrics or percentage-based outcomes from your past roles.",
      `Tailor the introduction to highlight your specific interest in the ${jobTitle || 'target'} position.`,
      "Use bullet points for lists of projects or key accomplishments to improve layout readability."
    ],
    formattedLetter: `**John Doe**
Berlin, Germany
john.doe@example.com | +49 123 4567890

Hiring Manager
Recruitment Committee

Subject: Application for **${jobTitle || 'Software Developer'}**

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the **${jobTitle || 'Software Developer'}** position. With my strong background in developing scalable web applications and optimizing database query performance, my background aligns perfectly with your team's current initiatives.

During my tenure at **Tech Innovations GmbH**, I contributed to a cloud-based web application, optimizing search query speeds by 40% and improving page load latency. I also spearheaded the frontend overhaul of the customer dashboard using React, Tailwind CSS, and Next.js, significantly improving UI/UX responsiveness.

I look forward to the possibility of discussing how my technical background and proactive approach can contribute to your team.

Sincerely,

John Doe`
  };
};
