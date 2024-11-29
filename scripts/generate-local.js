const fs = require('fs');
const matter = require('gray-matter');
const readingTime = require('reading-time');
const { marked } = require('marked');
const path = require('path');

const author = {
    name: "Local Developer",
    avatar: "https://github.com/github.png",
    bio: "Local development environment",
    github: "https://github.com",
    blog: "",
    followers: 0
};

function getAllPosts() {
    const posts = [];
    const POSTS_DIR = 'posts';

    if (!fs.existsSync(POSTS_DIR)) {
        fs.mkdirSync(POSTS_DIR);
        fs.writeFileSync(path.join(POSTS_DIR, '2024-11-29-sample.md'), `---
title: Sample Post
date: 2024-11-29
tags: [sample, test]
---

This is a sample post for local development.

## Code Example

\`\`\`javascript
console.log("Hello, World!");
\`\`\`
`);
    }

    const files = fs.readdirSync(POSTS_DIR);
    files.forEach(filename => {
        if (!filename.endsWith('.md')) return;
        
        const content = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8');
        const { data, content: markdown } = matter(content);
        
        posts.push({
            title: data.title,
            date: data.date,
            tags: data.tags || [],
            path: `/posts/${filename}`,
            excerpt: data.excerpt || markdown.slice(0, 200) + '...',
            readingTime: readingTime(markdown).text,
            content: marked.parse(markdown)
        });
    });

    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Generate files
fs.writeFileSync('author.json', JSON.stringify(author, null, 2));
fs.writeFileSync('posts.json', JSON.stringify(getAllPosts(), null, 2));

console.log('Generated local files successfully');