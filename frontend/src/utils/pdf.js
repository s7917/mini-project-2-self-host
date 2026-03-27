function escapePdfText(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLines(text, maxChars = 78) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function buildPdfBlob(title, bodyLines) {
  const allLines = [title, '', ...bodyLines].flatMap((line) => wrapLines(line));
  const safeLines = allLines.slice(0, 44);
  const content = [
    'BT',
    '/F1 12 Tf',
    '50 790 Td',
    ...safeLines.map((line, index) => `${index === 0 ? '' : '0 -16 Td'} (${escapePdfText(line)}) Tj`).filter(Boolean),
    'ET'
  ].join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadCoursePdf(course) {
  const sections = [
    `Category: ${course.category || 'General'}`,
    `Instructor: ${course.instructor_name || 'Unknown'}`,
    course.description || 'No course description available.',
    ...(course.modules || []).flatMap((moduleItem, moduleIndex) => [
      '',
      `Module ${moduleIndex + 1}: ${moduleItem.module_name}`,
      ...(moduleItem.lessons || []).map((lesson, lessonIndex) => `  Lesson ${lessonIndex + 1}: ${lesson.lesson_name}`)
    ])
  ];

  triggerDownload(`${course.title || 'course'}-overview.pdf`, buildPdfBlob(course.title || 'Course Overview', sections));
}

export function downloadModulePdf(course, moduleItem) {
  const sections = [
    `Course: ${course?.title || 'Course'}`,
    `Module: ${moduleItem?.module_name || 'Module'}`,
    ...(moduleItem?.lessons || []).flatMap((lesson, index) => [
      '',
      `Lesson ${index + 1}: ${lesson.lesson_name}`,
      lesson.content || 'No detailed content available.'
    ])
  ];

  triggerDownload(`${moduleItem?.module_name || 'module'}-resources.pdf`, buildPdfBlob(moduleItem?.module_name || 'Module Resources', sections));
}

export function downloadCertificatePdf({ learnerName, courseTitle, completedDate }) {
  const sections = [
    `This certifies that ${learnerName} successfully completed ${courseTitle}.`,
    `Completion date: ${completedDate}`,
    'Issued by Sigverse.'
  ];

  triggerDownload(`${courseTitle || 'course'}-certificate.pdf`, buildPdfBlob('Sigverse Certificate', sections));
}

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
