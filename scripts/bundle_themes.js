const fs = require('fs');
const path = require('path');

const themeDir = path.join(__dirname, '../theme');
const output = path.join(__dirname, '../src/theme_data.js');
const files = fs.readdirSync(themeDir).filter(f => f.endsWith('.css') && f !== 'reset.css' && f !== 'index.ts');

let content = 'export const THEMES = {\n';
files.forEach(f => {
    const name = f.replace('.css', '');
    // Read file and replace selector #bm-md with .markdown-body
    let css = fs.readFileSync(path.join(themeDir, f), 'utf8');
    
    // Replace #bm-md with #preview-md.markdown-body for CSS specificity
    // (beats #preview-md background/color in editor.css.js)
    css = css.replace(/#bm-md/g, '#preview-md.markdown-body, #preview-plain.markdown-body');
    
    // Escape for JS string
    const escapedCss = css.replace(/\r/g, '').replace(/\n/g, '\\n').replace(/'/g, "\\'");
    
    content += `    '${name}': '${escapedCss}',\n`;
});
content += '};\n';

fs.writeFileSync(output, content);
console.log('Themes bundled with selector fix!');
