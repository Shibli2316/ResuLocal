import { NextResponse } from 'next/server';
import { getGenAIClientWithKey, getMockCoverLetter } from '../../../../utils/gemini';

export async function POST(req: Request) {
  try {
    const { resumeData, jobDescription } = await req.json();

    if (!resumeData || !jobDescription) {
      return NextResponse.json({ error: 'Missing resumeData or jobDescription' }, { status: 400 });
    }

    const userApiKey = req.headers.get('x-user-api-key');
    const client = getGenAIClientWithKey(userApiKey);

    if (!client) {
      // Fallback Mock Mode matching the new structure
      const mockResult = getMockCoverLetter(
        resumeData.profile?.name || 'John Doe',
        resumeData.profile?.role || 'Software Engineer',
        jobDescription
      );
      return NextResponse.json(mockResult);
    }

    // Call real Gemini API
    const prompt = `
      Act as an expert career advisor and professional writer.
      You are given a candidate's resume details and a target Job Description. 

      Tasks:
      1. Write a highly tailored, metrics-driven cover letter in English (300-400 words) based on the candidate's actual experience and projects. Do not invent details.
      2. Translate this exact English cover letter into professional German.
      3. Extract the name of the company, contact email, and the person responsible from the job description (use "Not Found" if not explicitly mentioned or clearly inferable).
      4. Provide a list of 3-5 specific suggestions for key points the candidate should update, change, or add in their CV (e.g. adding specific technical skills, projects, or metrics) to improve their chances of selection for this specific role.

      Enforce the required JSON Schema:
      - 'coverLetter': The full text of the tailored cover letter in English.
      - 'coverLetterGerman': The full text of the tailored cover letter in German.
      - 'companyName': Name of the company, or "Not Found".
      - 'contactEmail': Contact email, or "Not Found".
      - 'personResponsible': Person responsible, or "Not Found".
      - 'cvSuggestions': Array of actionable recommendations to update in the candidate's CV.

      Candidate Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Target Job Description:
      ${jobDescription}
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            coverLetter: { 
              type: 'STRING',
              description: 'The full text of the tailored cover letter in English.' 
            },
            coverLetterGerman: { 
              type: 'STRING',
              description: 'The full text of the tailored cover letter in German.' 
            },
            companyName: { 
              type: 'STRING',
              description: 'Name of the company or "Not Found".' 
            },
            contactEmail: { 
              type: 'STRING',
              description: 'Contact email or "Not Found".' 
            },
            personResponsible: { 
              type: 'STRING',
              description: 'Name/title of the person responsible or "Not Found".' 
            },
            cvSuggestions: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'List of specific key points to update in the candidate\'s CV.'
            }
          },
          required: ['coverLetter', 'coverLetterGerman', 'companyName', 'contactEmail', 'personResponsible', 'cvSuggestions']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API returned an empty response');
    }

    const report = JSON.parse(text);
    return NextResponse.json(report);

  } catch (error: any) {
    console.error('Cover Letter Endpoint Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
