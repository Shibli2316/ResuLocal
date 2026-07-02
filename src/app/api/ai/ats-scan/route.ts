import { NextResponse } from 'next/server';
import { getGenAIClientWithKey, getMockAtsReport } from '../../../../utils/gemini';

export async function POST(req: Request) {
  try {
    const { resumeData, jobDescription } = await req.json();

    if (!resumeData || !jobDescription) {
      return NextResponse.json({ error: 'Missing resumeData or jobDescription' }, { status: 400 });
    }

    const userApiKey = req.headers.get('x-user-api-key');
    const client = getGenAIClientWithKey(userApiKey);

    if (!client) {
      // Fallback Mock Mode
      const mockReport = getMockAtsReport(
        resumeData.profile?.name || 'John Doe',
        jobDescription.substring(0, 40)
      );
      return NextResponse.json(mockReport);
    }

    // Call real Gemini API
    const prompt = `
      Act as a strict Applicant Tracking System (ATS) scanner and recruiter.
      Analyze the candidate's resume details and cross-reference them against the target Job Description.

      Candidate Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Target Job Description:
      ${jobDescription}

      Evaluate alignment, keywords, potential formatting problems, and content gaps. Enforce the required JSON Schema.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            matchScore: { 
              type: 'INTEGER',
              description: 'Overall match rating from 0 to 100 percentage points.' 
            },
            formattingWarnings: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Formatting, contact link, or date syntax suggestions (e.g. use MM/YYYY date structure).'
            },
            contentGaps: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Critical gaps in experience, metrics, or technologies that recruiter needs to see.'
            },
            keywordOptimization: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  keyword: { type: 'STRING', description: 'The exact tech keyword or competency name.' },
                  frequencyInJob: { type: 'INTEGER', description: 'Approximate occurrences in job listing.' },
                  action: { 
                    type: 'STRING', 
                    enum: ['add', 'rephrase'], 
                    description: 'Whether to add this keyword or rephrase existing references.' 
                  }
                },
                required: ['keyword', 'frequencyInJob', 'action']
              },
              description: 'List of relevant keywords from job posting that are missing or sparse in the resume.'
            }
          },
          required: ['matchScore', 'formattingWarnings', 'contentGaps', 'keywordOptimization']
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
    console.error('ATS Scan Endpoint Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
