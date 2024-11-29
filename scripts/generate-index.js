const fs = require('fs');
const matter = require('gray-matter');
const readingTime = require('reading-time');
const { marked } = require('marked');
const path = require('path');
const fetch = require('node-fetch');

async function fetchAuthorInfo() {
  const username = process.env.GITHUB_REPOSITORY.split('/')[0];
  const response = await fetch(`https://api.github.com/users/${username}`);
  const data = await response.json();
  
  return {
    name: data.name || username,
    avatar: data.avatar_url,
    bio: data.bio,
    github: data.html_url,
  };
}

async function generateFiles() {
  const BUILD_DIR = 'build';
  const POSTS_DIR = 'posts';

  if (!fs.existsSync(path.join(BUILD_DIR, 'posts'))) {
    fs.mkdirSync(path.join(BUILD_DIR, 'posts'), { recursive: true });
  }

  const posts = [];
  const files = fs.readdirSync(POSTS_DIR);
  
  files.forEach(filename => {
    if (!filename.endsWith('.md')) return;
    
    const content = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8');
    const { data, content: markdown } = matter(content);
    const html = marked.parse(markdown);
    
    // Generate HTML file for each post
    const htmlFilename = filename.replace('.md', '.html');
    const postHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${data.title}</title>
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <div class="container">
        <article class="post">
            <h1>${data.title}</h1>
            <div class="post-meta">
                <span class="post-date">${new Date(data.date).toLocaleDateString()}</span>
            </div>
            ${html}
        </article>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(BUILD_DIR, 'posts', htmlFilename), postHtml);
    
    posts.push({
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      path: `/posts/${htmlFilename}`,
      excerpt: data.excerpt || markdown.slice(0, 200) + '...',
      readingTime: readingTime(markdown).text,
      content: html
    });
  });

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const author = await fetchAuthorInfo();

  fs.writeFileSync(path.join(BUILD_DIR, 'posts.json'), JSON.stringify(posts, null, 2));
  fs.writeFileSync(path.join(BUILD_DIR, 'author.json'), JSON.stringify(author, null, 2));
}

generateFiles().catch(console.error);