/**
 * Google Docs & Drive Export Service
 */

function convertMarkdownToHtml(markdown: string, title: string): string {
  // Simple, highly effective parser that converts markdown to clean inline-styled HTML
  let html = markdown;
  
  // Replace headers (###, ##, #)
  // Pre-process headers to prevent nested replacements
  html = html.replace(/^### (.*?)$/gm, '<h3 style="font-size: 13pt; font-family: Arial, sans-serif; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; color: #111111;">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 style="font-size: 15pt; font-family: Arial, sans-serif; font-weight: bold; margin-top: 16pt; margin-bottom: 6pt; color: #222222; border-bottom: 1px solid #eeeeee; padding-bottom: 3pt;">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 style="font-size: 18pt; font-family: Arial, sans-serif; font-weight: bold; text-align: center; margin-top: 20pt; margin-bottom: 12pt; color: #000000; text-transform: uppercase;">$1</h1>');

  // Replace bold text (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Replace italic text (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Replace blockquotes (> text)
  html = html.replace(/^> (.*?)$/gm, '<div style="background-color: #f9f9f9; border-left: 4px solid #cccccc; padding: 8pt 12pt; margin: 12pt 0; color: #555555; font-style: italic;">$1</div>');

  // Replace list items (- item or * item)
  html = html.replace(/^\- (.*?)$/gm, '<li style="margin-left: 20pt; font-size: 11pt; line-height: 1.5; color: #333333; margin-bottom: 4pt; font-family: Arial, sans-serif;">$1</li>');
  html = html.replace(/^\* (.*?)$/gm, '<li style="margin-left: 20pt; font-size: 11pt; line-height: 1.5; color: #333333; margin-bottom: 4pt; font-family: Arial, sans-serif;">$1</li>');

  // Replace ordered list items (1. item)
  html = html.replace(/^(\d+)\. (.*?)$/gm, '<li style="margin-left: 20pt; list-style-type: decimal; font-size: 11pt; line-height: 1.5; color: #333333; margin-bottom: 4pt; font-family: Arial, sans-serif;">$2</li>');

  // Handle double line breaks and paragraphs - preserve existing list elements or header blocks
  const paragraphs = html.split('\n\n');
  const finishedParagraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<div') || trimmed.startsWith('<li') || trimmed.startsWith('<p')) {
      return trimmed;
    }
    return `<p style="font-size: 11pt; line-height: 1.6; font-family: Arial, sans-serif; color: #303030; margin-bottom: 10pt; text-align: justify;">${trimmed}</p>`;
  });

  html = finishedParagraphs.join('\n');

  // Replace single newlines that are not enclosed in tags with custom line breaks
  html = html.replace(/\n/g, '<br/>');

  return `
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333333;">
        ${html}
      </body>
    </html>
  `;
}

interface ExportResult {
  docId: string;
  alternateLink: string;
}

export async function exportToGoogleDocs(title: string, markdown: string, token: string): Promise<ExportResult> {
  const htmlContent = convertMarkdownToHtml(markdown, title);
  
  const boundary = '314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document'
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    htmlContent +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google API returned ${response.status}: ${errText}`);
  }

  const result = await response.json();
  return {
    docId: result.id,
    alternateLink: `https://docs.google.com/document/d/${result.id}/edit`
  };
}
