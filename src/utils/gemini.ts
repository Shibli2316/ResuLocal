import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI client if the API key is present
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined. AI features will run in Mock Mode.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const genAI = getGenAIClient();

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
Göttingen, Germany
arshibli19@gmail.com | 015214990547

${date}

Hiring Manager
Recruitment Committee

Subject: Application for ${role || 'Working Student / Software Engineer'} Position

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${role || 'Software Developer'} position. As a Master's student in Applied Computer Science at the University of Göttingen specializing in software development, machine learning, and database management, my background aligns perfectly with your team's current initiatives.

During my tenure at the Göttingen Digital Academy, I actively contributed to the digitization of historical papal charters. By implementing geocoding features and optimizing database query performance, I significantly enhanced archival data indexing efficiency. Additionally, I spearheaded the frontend overhaul of the LiMoST bibliographical interface, creating a modern, streamlined user workflow. These experiences sharpened my skills in Python, React, databases, and responsive UI design.

Your job description highlights a need for developers who are comfortable bridging backend optimization with elegant user interfaces. In my role as Web Lead for the SS AMU SAT satellite operation software, I managed end-to-end design of telemetry pipelines and collaborating across hardware domains. I am eager to apply this rigorous full-stack expertise to your engineering projects.

Thank you for your time and consideration. I look forward to the possibility of discussing how my technical background and proactive working student approach can contribute to your team.

Sincerely,

${name}`;

  const germanText = `${name}
Göttingen, Deutschland
arshibli19@gmail.com | 015214990547

${date}

Personalabteilung
Auswahlkommission

Betreff: Bewerbung als ${role || 'Werkstudent / Softwareentwickler'}

Sehr geehrte Damen und Herren,

ich schreibe Ihnen, um mein großes Interesse an der Position als ${role || 'Softwareentwickler'} zu bekunden. Als Masterstudent der Angewandten Informatik an der Universität Göttingen mit Schwerpunkt Softwareentwicklung, maschinelles Lernen und Datenbankmanagement passt mein Profil ideal zu den aktuellen Projekten Ihres Teams.

Während meiner Tätigkeit an der Göttinger Akademie der Wissenschaften habe ich aktiv an der Digitalisierung historischer Papsturkunden mitgewirkt. Durch die Implementierung von Geocodierungsfunktionen und die Optimierung der Datenbankleistung konnte ich die Effizienz der Datenindizierung erheblich steigern. Darüber hinaus leitete ich die Überarbeitung des LiMoST-Bibliotheks-Interfaces, um ein modernes und benutzerfreundliches Frontend zu schaffen.

Vielen Dank für Ihre Zeit und Berücksichtigung. Ich freue mich darauf, in einem persönlichen Gespräch zu erörtern, wie mein technischer Hintergrund Ihr Team verstärken kann.

Mit freundlichen Grüßen

${name}`;

  return {
    coverLetter: englishText,
    coverLetterGerman: germanText,
    companyName: "Göttingen Academy of Sciences",
    contactEmail: "recruitment@goettingen-academy.de",
    personResponsible: "Hiring Manager",
    cvSuggestions: [
      "Add direct percentage metrics to your Göttingen Academy experience descriptions.",
      "Incorporate key matching keywords like geocoding, database query performance, and front-end optimization directly into your Skills section.",
      "List Git and Docker under your Technical Skills section as they are explicitly requested."
    ]
  };
};
