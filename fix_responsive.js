const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Grid layouts
  // Change grid-cols-2 -> grid-cols-1 md:grid-cols-2
  content = content.replace(/grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
  // Change grid-cols-3 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  content = content.replace(/grid-cols-3/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
  // Change grid-cols-4 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-4
  content = content.replace(/grid-cols-4/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
  
  // Clean up any double additions (e.g. if it was already md:grid-cols-2)
  content = content.replace(/grid-cols-1 md:grid-cols-1 md:grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
  content = content.replace(/grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
  content = content.replace(/md:grid-cols-1 md:grid-cols-2/g, 'md:grid-cols-2');
  content = content.replace(/lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3/g, 'lg:grid-cols-3');
  content = content.replace(/lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-4/g, 'lg:grid-cols-4');
  // Remove duplicates
  content = content.replace(/grid-cols-1\s+md:grid-cols-2\s+lg:grid-cols-4/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4');

  // 2. Headings (h2)
  content = content.replace(/<h2 className="text-3xl font-bold/g, '<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold');
  content = content.replace(/<h2 className="text-2xl font-bold/g, '<h2 className="text-xl md:text-2xl lg:text-3xl font-bold');
  // Clean double additions
  content = content.replace(/text-xl md:text-2xl lg:text-3xl font-bold md:text-3xl lg:text-4xl/g, 'text-2xl md:text-3xl lg:text-4xl font-bold');
  content = content.replace(/text-xl md:text-xl md:text-2xl lg:text-3xl font-bold/g, 'text-xl md:text-2xl lg:text-3xl font-bold');

  // 3. Modals and Buttons
  // If we see <div className="flex gap-4"> change to <div className="flex flex-col sm:flex-row gap-4 w-full">
  // but only safely where it might be action areas (like buttons).
  // I will just use regex for "flex gap-X" if it contains buttons, but let's just do it manually for known cases.

  // 4. Tables
  // Replace <div className="overflow-x-auto"> with <div className="overflow-x-auto w-full">
  content = content.replace(/<div className="overflow-x-auto">/g, '<div className="overflow-x-auto w-full">');

  // Any table that doesn't have min-w-max whitespace-nowrap, let's add it.
  content = content.replace(/<table className="([^"]*)"/g, (match, classes) => {
    let newClasses = classes;
    if (!newClasses.includes('min-w-max')) {
      newClasses += ' min-w-max';
    }
    if (!newClasses.includes('whitespace-nowrap')) {
      newClasses += ' whitespace-nowrap';
    }
    if (!newClasses.includes('w-full')) {
      newClasses += ' w-full';
    }
    return `<table className="${newClasses.trim()}"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

processDir(dir);
