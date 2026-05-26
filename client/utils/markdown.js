const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeAttribute = (value) =>
  escapeHtml(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isSafeImageUrl = (url) => {
  const trimmed = String(url || '').trim();
  return /^(https?:\/\/|\/(?!\/)|data:image\/(?:png|jpe?g|gif|webp);base64,)/i.test(trimmed);
};

export const parseMarkdown = (markdown) => {
  if (!markdown) return '';

  let html = escapeHtml(markdown);

  html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    if (!isSafeImageUrl(url)) {
      return escapeHtml(alt);
    }

    return `<img src="${escapeAttribute(url.trim())}" alt="${escapeAttribute(alt)}" class="rich-desc-img" />`;
  });

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let inList = false;
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^[\s]*[\*-]\s+(.*)$/);

    if (match) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${match[1]}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  if (inList) {
    processedLines.push('</ul>');
  }
  html = processedLines.join('\n');

  const blocks = html.split(/\n\s*\n/);
  const wrappedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|ul|img)/i.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
  });

  return wrappedBlocks.join('\n');
};
