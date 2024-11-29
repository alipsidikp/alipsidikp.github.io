const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const readingTime = require('reading-time');
const { marked } = require('marked');
const Prism = require('prismjs');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-python');
require('prismjs/components/prism-go');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-json');

marked.setOptions({
  highlight: function(code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  }
});

const POSTS_DIR = 'posts';
const OUTPUT_FILE = 'posts.json';

function getAllPosts() {
  const posts = [];
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('Posts directory not found. Creating...');
    fs.mkdirSync(POSTS_DIR);
    return posts;
  }
  
  const files = fs.readdirSync(POSTS_DIR);
  
  files.forEach(filename => {
    if (!filename.endsWith('.md') && !filename.endsWith('.mdx')) return;
    
    const filePath = path.join(POSTS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: markdown } = matter(content);
    
    const readTime = readingTime(markdown);
    const html = marked(markdown);
    
    posts.push({
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      path: `/posts/${filename}`,
      excerpt: data.excerpt || markdown.slice(0, 200) + '...',
      readingTime: readTime.text,
      content: html,
      lastModified: fs.statSync(filePath).mtime.toISOString()
    });
  });
  
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const posts = getAllPosts();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));

const tags = new Set();
posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
fs.writeFileSync('tags.json', JSON.stringify(Array.from(tags), null, 2));
