const fs = require('fs');
const matter = require('gray-matter');
const readingTime = require('reading-time');
const { marked } = require('marked');
const path = require('path');
const fetch = require('node-fetch');

const postHtmlTemplate = (data, html) => `<!DOCTYPE html>
<html>
<head>
    <title>${data.title}</title>
    <link rel="stylesheet" href="../../style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div class="container">
        <header class="header-content">
            <h1><a href="/" style="text-decoration: none; color: inherit;">Developer Notes</a></h1>
        </header>
        <article class="post">
            <h1>${data.title}</h1>
            <div class="post-meta">
                <span class="post-date">${new Date(data.date).toLocaleDateString()}</span>
            </div>
            ${html}
            <div class="post-footer">
                <a href="/" class="back-link">← Back to posts</a>
            </div>
        </article>
    </div>
</body>
</html>`;

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
        const htmlFilename = filename.replace('.md', '.html');
        
        fs.writeFileSync(
            path.join(BUILD_DIR, 'posts', htmlFilename),
            postHtmlTemplate(data, html)
        );
        
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