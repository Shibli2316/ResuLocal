import { NextResponse } from 'next/server';
import { getGenAIClientWithKey, getMockTesterReport } from '../../../../utils/gemini';

export async function POST(req: Request) {
  try {
    const { coverLetter, jobDescription } = await req.json();

    if (!coverLetter) {
      return NextResponse.json({ error: 'Missing coverLetter' }, { status: 400 });
    }

    const userApiKey = req.headers.get('x-user-api-key');
    const client = getGenAIClientWithKey(userApiKey);

    if (!client) {
      // Fallback Mock Mode
      const mockReport = getMockTesterReport(
        coverLetter,
        jobDescription ? jobDescription.substring(0, 40) : 'Software Engineer'
      );
      return NextResponse.json(mockReport);
    }

    // Call real Gemini API
    const prompt = `
      Act as an expert recruiter, proofreader, and career advisor.
      You are given a candidate's drafted Cover Letter and a target Job Description. 

      Tasks:
      1. Review the cover letter for spelling, typos, and grammatical issues. Highlight specific corrections with explanations.
      2. Evaluate how well the cover letter aligns with the job description and assign a score (0 to 100).
      3. List 3-4 specific styling or content improvement points (e.g. adding metrics, correcting tone, adjusting paragraph lengths).
      4. Rewrite the letter into a professionally formatted, corrected, and polished version. Make sure to use markdown double asterisks ** to bold critical details (like company name, role, candidate's name, or key impact metrics). Ensure clean line breaks and paragraphs.

      Target Job Description:
      ${jobDescription || 'Not Provided'}

      Candidate's Cover Letter:
      ${coverLetter}

      Enforce the required JSON Schema:
      - 'score': Overall match and quality rating from 0 to 100.
      - 'grammarErrors': Array of objects. Each has:
        - 'original': The exact mistyped or grammatically incorrect phrase from the letter.
        - 'correction': The corrected version.
        - 'reason': Short explanation of the spelling/grammar issue.
      - 'improvementPoints': Array of actionable recommendations to make the letter more impactful.
      - 'formattedLetter': The rewritten, fully polished, and formatted cover letter in English, incorporating markdown double asterisks ** for bold text.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            score: { 
              type: 'INTEGER',
              description: 'Overall match and quality rating from 0 to 100.' 
            },
            grammarErrors: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  original: { type: 'STRING' },
                  correction: { type: 'STRING' },
                  reason: { type: 'STRING' }
                },
                required: ['original', 'correction', 'reason']
              },
              description: 'List of spelling and grammatical errors.'
            },
            improvementPoints: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'List of stylistic and content optimization points.'
            },
            formattedLetter: { 
              type: 'STRING',
              description: 'The polished, corrected, and formatted cover letter in Markdown.' 
            }
          },
          required: ['score', 'grammarErrors', 'improvementPoints', 'formattedLetter']
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
    console.error('Test Cover Letter Endpoint Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
