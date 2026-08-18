const fs = require('fs');
const path = require('path');

const projects = [
  '/Users/riadh/Desktop/drivo/driveease-frontend',
  '/Users/riadh/Desktop/drivo/drivo-desktop'
];

const configContent = `export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';\n`;

projects.forEach(project => {
  const configPath = path.join(project, 'src', 'config.js');
  fs.writeFileSync(configPath, configContent);
});

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('dist') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

let files = [];
projects.forEach(p => {
  files = files.concat(walkSync(path.join(p, 'src')));
});

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('http://localhost:4000')) return;

  const srcDir = filePath.includes('driveease-frontend') 
    ? '/Users/riadh/Desktop/drivo/driveease-frontend/src' 
    : '/Users/riadh/Desktop/drivo/drivo-desktop/src';
  
  const rel = path.relative(path.dirname(filePath), srcDir);
  let importPath = rel === '' ? './config' : `${rel}/config`;

  if (!content.includes('API_URL')) {
    const lines = content.split('\n');
    let lastImportIdx = -1;
    for(let i=0; i<lines.length; i++) {
      if (lines[i].startsWith('import ')) lastImportIdx = i;
    }
    lines.splice(lastImportIdx + 1, 0, `import { API_URL } from '${importPath}';`);
    content = lines.join('\n');
  }

  // replace 'http://localhost:4000/...' with `${API_URL}/...`
  content = content.replace(/'http:\/\/localhost:4000([^']*)'/g, '`${API_URL}$1`');
  // replace `http://localhost:4000/...` with `${API_URL}/...`
  content = content.replace(/`http:\/\/localhost:4000([^`]*)`/g, '`${API_URL}$1`');
  // replace "http://localhost:4000/..." with `${API_URL}/...`
  content = content.replace(/"http:\/\/localhost:4000([^"]*)"/g, '`${API_URL}$1`');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
});
console.log('Done.');
