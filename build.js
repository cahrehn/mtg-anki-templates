const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'demo', 'config.json'), 'utf8'));

// Clean and create dist directory
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });
fs.mkdirSync(path.join(DIST, 'images'), { recursive: true });

// Copy images to dist
const imagesDir = path.join(ROOT, 'demo', 'images');
for (const file of fs.readdirSync(imagesDir)) {
  fs.copyFileSync(path.join(imagesDir, file), path.join(DIST, 'images', file));
}

// Copy CSS files referenced by config
const cssFiles = new Set();
for (const section of CONFIG.sections) {
  if (section.css) cssFiles.add(section.css);
}
for (const cssFile of cssFiles) {
  fs.copyFileSync(path.join(ROOT, cssFile), path.join(DIST, cssFile));
}

// Process Anki tags in template HTML
function processAnkiTags(html, cardData, clozeState) {
  // Replace {{UUID}} with actual UUID
  html = html.replace(/\{\{UUID\}\}/g, cardData.id);

  // Replace {{Front}} and {{cloze:Text}} with card name (these are in hidden divs)
  html = html.replace(/\{\{Front\}\}/g, cardData.name);
  html = html.replace(/\{\{cloze:Text\}\}/g, cardData.name);

  if (clozeState === 'c1') {
    // Show c1 content, strip c2
    html = html.replace(/\{\{#c1\}\}([\s\S]*?)\{\{\/c1\}\}/g, '$1');
    html = html.replace(/\{\{#c2\}\}[\s\S]*?\{\{\/c2\}\}/g, '');
  } else if (clozeState === 'c2') {
    // Show c2 content, strip c1
    html = html.replace(/\{\{#c1\}\}[\s\S]*?\{\{\/c1\}\}/g, '');
    html = html.replace(/\{\{#c2\}\}([\s\S]*?)\{\{\/c2\}\}/g, '$1');
  } else if (clozeState === 'revealed') {
    // Strip all cloze content (no occlusions)
    html = html.replace(/\{\{#c1\}\}[\s\S]*?\{\{\/c1\}\}/g, '');
    html = html.replace(/\{\{#c2\}\}[\s\S]*?\{\{\/c2\}\}/g, '');
  } else {
    // No cloze — show all content
    html = html.replace(/\{\{#c1\}\}([\s\S]*?)\{\{\/c1\}\}/g, '$1');
    html = html.replace(/\{\{#c2\}\}([\s\S]*?)\{\{\/c2\}\}/g, '$1');
  }

  return html;
}

// Replace Scryfall fetch calls with pre-loaded data
function injectCardData(html, cardData) {
  const dataJson = JSON.stringify(cardData);

  // Replace the var url + fetch block with direct data injection.
  // All templates follow this pattern:
  //   var url = 'https://api.scryfall.com/cards/' + "UUID" + '?format=json';
  //   \n\n?fetch(url)\n    .then(response => response.json())\n    .then(data => {
  //
  // We replace everything from "var url" through the fetch chain with:
  //   var __cardData = {...};
  //   Promise.resolve(__cardData).then(data => {

  html = html.replace(
    /var url = ['"]https:\/\/api\.scryfall\.com\/cards\/['"].*?;\s*\n+\s*fetch\(url\)\s*\n\s*\.then\(response\s*=>\s*response\.json\(\)\)\s*\n\s*\.then\(/g,
    `var __cardData = ${dataJson};\n\nPromise.resolve(__cardData).then(`
  );

  // Also handle the resize handler in split-front which does:
  //   fetch(url).then(response => response.json()).then(data => setOcclusions(data))
  // Since we removed `url`, replace any remaining fetch(url) calls
  html = html.replace(
    /fetch\(url\)\s*\n\s*\.then\(response\s*=>\s*response\.json\(\)\)\s*\n\s*\.then\(data\s*=>\s*(\w+\(data\))\)/g,
    'Promise.resolve(__cardData).then(data => $1)'
  );

  return html;
}

// Wrap a template fragment in a full HTML document
function wrapInDocument(templateHtml, cssFile) {
  const cssLink = cssFile ? `<link rel="stylesheet" href="${cssFile}">` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${cssLink}
</head>
<body>
<div class="card">
${templateHtml}
</div>
</body>
</html>`;
}

// Build a single template variant and write to dist
function buildTemplate(sectionId, templateKey, templateFile, cardData, cssFile, clozeState) {
  const suffix = (clozeState && clozeState !== 'revealed') ? `-${clozeState}` : '';
  const outputName = `${sectionId}-${templateKey}${suffix}.html`;

  let html = fs.readFileSync(path.join(ROOT, templateFile), 'utf8');
  html = processAnkiTags(html, cardData, clozeState);
  html = injectCardData(html, cardData);
  html = wrapInDocument(html, cssFile);

  fs.writeFileSync(path.join(DIST, outputName), html);
  return outputName;
}

// Build all templates and generate index.html
function build() {
  const template = fs.readFileSync(path.join(ROOT, 'demo', 'template.html'), 'utf8');
  let sectionsHtml = '';

  for (const section of CONFIG.sections) {
    const cardData = JSON.parse(fs.readFileSync(path.join(ROOT, section.data), 'utf8'));
    const frontFile = section.templates.front;
    const iframeClass = frontFile.includes('split') ? 'split-iframe' : frontFile.includes('dfc') ? 'dfc-iframe' : 'card-iframe';

    let sectionContent = '';
    sectionContent += `<section class="template-demo" id="${section.id}">\n`;
    sectionContent += `  <h2>${section.title}</h2>\n`;
    sectionContent += `  <p>${section.description}</p>\n`;
    sectionContent += `  <div class="demo-viewer">\n`;

    if (section.cloze) {
      // Build front variants for each cloze
      const frontSrcs = {};
      for (const cloze of ['c1', 'c2']) {
        const outputName = buildTemplate(section.id, 'front', frontFile, cardData, section.css || null, cloze);
        frontSrcs[cloze] = outputName;
      }

      // Build back/revealed variant
      let backSrc;
      if (section.templates.back) {
        backSrc = buildTemplate(section.id, 'back', section.templates.back, cardData, section.css || null, null);
      } else {
        // No back template (e.g. adventure) — build front with all cloze stripped as the revealed version
        backSrc = buildTemplate(section.id, 'revealed', frontFile, cardData, section.css || null, 'revealed');
      }

      // Initial iframe shows c1 front
      sectionContent += `    <iframe class="${iframeClass}" id="${section.id}-iframe" src="${frontSrcs.c1}"></iframe>\n`;
      sectionContent += `    <div class="demo-controls">\n`;
      sectionContent += `      <div class="cloze-toggle">\n`;
      sectionContent += `        <button class="cloze-btn active" onclick="selectCloze('${section.id}', 'c1', this)">Cloze 1</button>\n`;
      sectionContent += `        <button class="cloze-btn" onclick="selectCloze('${section.id}', 'c2', this)">Cloze 2</button>\n`;
      sectionContent += `      </div>\n`;
      sectionContent += `      <button class="reveal-btn" onclick="toggleReveal('${section.id}', this)">Show Answer</button>\n`;
      sectionContent += `    </div>\n`;
      sectionContent += `    <script>initSection('${section.id}', ${JSON.stringify(frontSrcs)}, '${backSrc}');</script>\n`;
    } else {
      // No cloze — build front and back
      const frontOutput = buildTemplate(section.id, 'front', frontFile, cardData, section.css || null, null);
      const backOutput = buildTemplate(section.id, 'back', section.templates.back, cardData, section.css || null, null);

      sectionContent += `    <iframe class="${iframeClass}" id="${section.id}-iframe" src="${frontOutput}"></iframe>\n`;
      sectionContent += `    <div class="demo-controls">\n`;
      sectionContent += `      <button class="reveal-btn" onclick="toggleReveal('${section.id}', this)">Show Answer</button>\n`;
      sectionContent += `    </div>\n`;
      sectionContent += `    <script>initSection('${section.id}', {'default': '${frontOutput}'}, '${backOutput}');</script>\n`;
    }

    sectionContent += `  </div>\n`;
    sectionContent += `</section>\n`;
    sectionsHtml += sectionContent;
  }

  const indexHtml = template.replace('{{SECTIONS}}', sectionsHtml);
  fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml);

  console.log('Build complete. Output in dist/');
  console.log('Files:');
  for (const file of fs.readdirSync(DIST).sort()) {
    const stat = fs.statSync(path.join(DIST, file));
    if (stat.isFile()) {
      console.log(`  ${file}`);
    }
  }
}


build();
