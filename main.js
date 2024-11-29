// Global variables
let posts = [];
let selectedTags = new Set();
let currentPage = 1;
const POSTS_PER_PAGE = 5;
let author = null;

async function initialize() {
    try {
        const [postsResponse, authorResponse] = await Promise.all([
            fetch('posts.json'),
            fetch('author.json')
        ]);
        
        if (!postsResponse.ok || !authorResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        posts = await postsResponse.json();
        author = await authorResponse.json();
        
        console.log('Posts loaded:', posts.length);
        
        renderAuthor();
        renderPosts();
        renderTags();
        renderPagination();
    } catch (error) {
        console.error('Failed to initialize:', error);
        const container = document.getElementById('postsContainer');
        if (container) {
            container.innerHTML = '<div class="error">Failed to load blog content. Please try again later.</div>';
        }
    }
}

function renderTags() {
    const tags = new Set();
    posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    
    const tagContainer = document.getElementById('tagContainer');
    if (!tagContainer) return;

    tagContainer.innerHTML = Array.from(tags)
        .sort()
        .map(tag => `
            <span class="tag" data-tag="${tag}">
                ${tag}
            </span>
        `).join('');

    // Add click handlers
    tagContainer.querySelectorAll('.tag').forEach(tagElement => {
        tagElement.addEventListener('click', () => toggleTag(tagElement.dataset.tag));
    });
}

function toggleTag(tag) {
    const tagElement = document.querySelector(`[data-tag="${tag}"]`);
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        tagElement?.classList.remove('active');
    } else {
        selectedTags.add(tag);
        tagElement?.classList.add('active');
    }
    currentPage = 1;
    filterAndRenderPosts();
}

function filterAndRenderPosts() {
    const searchInput = document.getElementById('searchInput');
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    
    const filteredPosts = posts.filter(post => {
        const matchesTags = selectedTags.size === 0 || 
            Array.from(selectedTags).every(tag => post.tags.includes(tag));
        const matchesSearch = post.title.toLowerCase().includes(searchText);
        return matchesTags && matchesSearch;
    });

    renderPosts(filteredPosts);
    renderPagination(filteredPosts.length);
}

function renderPosts(filteredPosts = posts) {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    const container = document.getElementById('postsContainer');
    if (!container) return;

    if (postsToShow.length === 0) {
        container.innerHTML = '<div class="no-posts">No posts found</div>';
        return;
    }

    container.innerHTML = postsToShow
        .map(post => `
            <article class="post">
                <h2 class="post-title">
                    <a href="${post.path}">${post.title}</a>
                </h2>
                <div class="post-meta">
                    <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                    <span class="reading-time">${post.readingTime}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `
                        <span class="post-tag" data-tag="${tag}">${tag}</span>
                    `).join('')}
                </div>
            </article>
        `).join('');

    // Add click handlers for tags in posts
    container.querySelectorAll('.post-tag').forEach(tag => {
        tag.addEventListener('click', () => toggleTag(tag.dataset.tag));
    });
}

function renderPagination(totalPosts) {
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    paginationContainer.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
            Previous
        </button>
        ${Array.from({length: totalPages}, (_, i) => i + 1)
            .map(i => `
                <button class="${currentPage === i ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `).join('')}
        <button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
            Next
        </button>
    `;

    // Add click handlers
    paginationContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            if (!button.disabled) {
                changePage(Number(button.dataset.page));
            }
        });
    });
}

function changePage(newPage) {
    currentPage = newPage;
    filterAndRenderPosts();
    window.scrollTo(0, 0);
}

function renderAuthor() {
    if (!author) return;

    const headerElement = document.querySelector('header');
    if (!headerElement) return;

    const authorHTML = `
        <div class="author-section">
            <img src="${author.avatar}" alt="${author.name}" class="author-avatar">
            <div class="author-info">
                <h2>${author.name}</h2>
                ${author.bio ? `<p>${author.bio}</p>` : ''}
                <div class="author-links">
                    <a href="${author.github}" target="_blank">GitHub</a>
                    ${author.blog ? `<a href="${author.blog}" target="_blank">Website</a>` : ''}
                </div>
            </div>
        </div>
    `;
    headerElement.insertAdjacentHTML('afterend', authorHTML);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            filterAndRenderPosts();
        });
    }
    initialize();
});