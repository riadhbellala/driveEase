const fs = require('fs');
const path = require('path');

const projects = [
  '/Users/riadh/Desktop/drivo/driveease-frontend',
  '/Users/riadh/Desktop/drivo/drivo-desktop'
];

// Copy logo to src/assets
projects.forEach(p => {
  const assetsDir = path.join(p, 'src', 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.copyFileSync('/Users/riadh/Desktop/drivo/driveease-frontend/public/drivologos/logodblack.webp', path.join(assetsDir, 'logo.webp'));
  }
});

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'build', 'release', 'dist-electron'].includes(file)) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (/\.(jsx?|tsx?|html|json)$/.test(file)) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

let files = [];
projects.forEach(p => {
  files = files.concat(walkSync(p));
});

let fixCount = 0;
files.forEach(filePath => {
  if (filePath.includes('package-lock.json')) return; // skip lock files
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace text
  newContent = newContent.replace(/DriveEase/g, 'Drivo');
  newContent = newContent.replace(/driveease/g, 'drivo'); // Note: could replace folder references if we aren't careful, but these are relative paths or text
  // Fix specifically the CSS class or imports if any got messed up? Usually safe.

  // Replace image imports
  newContent = newContent.replace(/import carLogo from '.*?carlogo\.png';/g, "import carLogo from '../assets/logo.webp';");
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Rebranded ${filePath}`);
    fixCount++;
  }
});
console.log(`Rebranded ${fixCount} files.`);
