const fs = require('fs');
const path = require('path');

const projects = [
  '/Users/riadh/Desktop/drivo/driveease-frontend',
  '/Users/riadh/Desktop/drivo/drivo-desktop'
];

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

let fixCount = 0;
files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/import \{\nimport \{ API_URL \} from '(.*?)';\n/g, "import { API_URL } from '$1';\nimport {\n");
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${filePath}`);
    fixCount++;
  }
});
console.log(`Fixed ${fixCount} files.`);
