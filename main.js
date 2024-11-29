// Global variables
let posts = [];
let selectedTags = new Set();
let currentPage = 1;
const POSTS_PER_PAGE = 5;
let author = null;

// Fetch both posts and author info
async function initialize() {
    const [postsResponse, authorResponse] = await Promise.all([
        fetch('posts.json'),
        fetch('author.json')
    ]);
    
    posts = await postsResponse.json();
    author = await authorResponse.json();
    
    renderAuthor();
    renderPosts();
    renderTags();
    renderPagination();
}

function renderAuthor() {
    const headerElement = document.querySelector('header');
    const authorHTML = `
        <div class="author-section">
            <img src="${author.avatar}" alt="${author.name}" class="author-avatar">
            <div class="author-info">
                <h2>${author.name}</h2>
                <p>${author.bio || ''}</p>
                <div class="author-links">
                    <a href="${author.github}" target="_blank">GitHub</a>
                    ${author.blog ? `<a href="${author.blog}" target="_blank">Website</a>` : ''}
                </div>
            </div>
        </div>
    `;
    headerElement.insertAdjacentHTML('afterend', authorHTML);
}

function filterPosts() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    return posts.filter(post => {
        const matchesTags = selectedTags.size === 0 || 
            Array.from(selectedTags).every(tag => post.tags.includes(tag));
        const matchesSearch = post.title.toLowerCase().includes(searchText);
        return matchesTags && matchesSearch;
    });
}

function renderPosts() {
    const filteredPosts = filterPosts();
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    const container = document.getElementById('postsContainer');
    container.innerHTML = postsToShow
        .map(post => `
            <article class="post">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-date">
                    ${new Date(post.date).toLocaleDateString()}
                    <span class="reading-time">${post.readingTime}</span>
                </div>
                <div class="post-excerpt">${post.excerpt}</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `
                        <span class="post-tag">${tag}</span>
                    `).join('')}
                </div>
            </article>
        `).join('');
    
    renderPagination(filteredPosts.length);
}

function renderPagination(totalPosts) {
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button 
            onclick="changePage(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}
        >Previous</button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button 
                onclick="changePage(${i})"
                class="${currentPage === i ? 'active' : ''}"
            >${i}</button>
        `;
    }
    
    paginationHTML += `
        <button 
            onclick="changePage(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}
        >Next</button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(newPage) {
    currentPage = newPage;
    renderPosts();
    window.scrollTo(0, 0);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    renderPosts();
});

// Initialize the blog
initialize();