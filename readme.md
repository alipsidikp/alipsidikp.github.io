# Developer Notes (blog)

A minimalist tech blog using GitHub Pages with markdown support, tag filtering, and syntax highlighting.

## Features
- Markdown blog posts
- Tag filtering & search
- Code syntax highlighting
- Reading time estimation
- Author info from GitHub profile
- Dark theme
- Responsive design

## Local Development

### Prerequisites
- Node.js >= 16
- npm

### Setup
```bash
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io
npm install
```

### Run Locally
```bash
npm start
```
Visit http://localhost:3000

## Creating Posts

1. Add markdown files to `posts/` directory:
```
posts/
└── YYYY-MM-DD-post-title.md
```

2. Include frontmatter:
```markdown
---
title: Your Post Title
date: 2024-01-01
tags: [tag1, tag2]
---

Your content here...
```

### Code Blocks
Use triple backticks with language:
```markdown
```python
def hello():
    print("Hello World")
```
```

Supported languages:
- python
- javascript
- typescript
- go
- bash
- json

## Deployment

The blog automatically deploys when you:
1. Push to main branch
2. Create/update posts in `posts/` directory

Changes are deployed to GitHub Pages: https://yourusername.github.io

## Directory Structure

```
.
├── index.html         # Main page
├── style.css         # Styles
├── main.js          # JavaScript
├── posts/           # Blog posts
├── package.json     # Dependencies
└── .github/workflows/deploy.yml
```