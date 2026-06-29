const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walkDir(srcDir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('new PrismaClient()')) {
    // Remove import { PrismaClient } from "@prisma/client"
    content = content.replace(/import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"];?\n?/g, '');
    
    // Replace const prisma = new PrismaClient() with import prisma from "@/lib/prisma"
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\)?;?\n?/g, 'import prisma from "@/lib/prisma";\n');
    
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
