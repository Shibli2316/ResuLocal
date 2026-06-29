import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  let browser = null;
  try {
    const { resumeData, styleSettings, sections } = await req.json();

    if (!resumeData || !styleSettings) {
      return NextResponse.json({ error: 'Missing resumeData or styleSettings' }, { status: 400 });
    }

    // Configure launcher options for Puppeteer
    // Enforce no-sandbox arguments which are required for running inside Docker
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };

    // If running in Docker, chromium executable path will be injected via env variables
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Define the host URL. In Docker, the container can call localhost if next is running inside the same container.
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    // Navigate to the clean preview page. Wait until network is idle
    await page.goto(`${appUrl}/preview`, { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });

    // Inject active data using evaluate
    await page.evaluate((data, style, sectionsList) => {
      if ((window as any).renderResume) {
        (window as any).renderResume(data, style, sectionsList);
      }
    }, resumeData, styleSettings, sections);

    // Wait a brief moment for React state update and layout calculation
    await page.waitForSelector('.resume-page-canvas', { timeout: 5000 });
    
    // Print to PDF with exact A4 and zero border margins
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
      }
    });

    await browser.close();
    browser = null;

    // Stream PDF buffer response back
    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error: any) {
    console.error('PDF Export Endpoint Error:', error);
    if (browser) {
      try {
        await (browser as any).close();
      } catch (e) {}
    }
    return NextResponse.json({ error: error.message || 'Failed to compile PDF' }, { status: 500 });
  }
}
