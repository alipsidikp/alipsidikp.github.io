const fetch = require('node-fetch');
const fs = require('fs');

async function fetchGithubProfile() {
  const username = process.env.GITHUB_REPOSITORY.split('/')[0];
  const response = await fetch(`https://api.github.com/users/${username}`);
  const data = await response.json();
  
  const author = {
    name: data.name || username,
    avatar: data.avatar_url,
    bio: data.bio,
    location: data.location,
    github: data.html_url,
    blog: data.blog,
    followers: data.followers
  };
  
  fs.writeFileSync('author.json', JSON.stringify(author, null, 2));
}

fetchGithubProfile().catch(console.error);
