// Global variables
let allPosts = [];
let filteredPosts = [];
let searchSuggestions = [];
let currentFilters = {
    title: '',
    minViews: 0,
    maxViews: 10000
};

// DOM elements
const searchInput = document.getElementById('searchInput');
const suggestionsContainer = document.getElementById('suggestions');
const minViewsSlider = document.getElementById('minViewsSlider');
const maxViewsSlider = document.getElementById('maxViewsSlider');
const minViewsValue = document.getElementById('minViewsValue');
const maxViewsValue = document.getElementById('maxViewsValue');
const clearFiltersBtn = document.getElementById('clearFilters');
const postsContainer = document.getElementById('postsContainer');
const totalPostsSpan = document.getElementById('totalPosts');
const filteredPostsSpan = document.getElementById('filteredPosts');
const avgViewsSpan = document.getElementById('avgViews');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadAllPosts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search input events
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', showSuggestions);
    searchInput.addEventListener('blur', hideSuggestions);

    // Slider events
    minViewsSlider.addEventListener('input', handleMinViewsChange);
    maxViewsSlider.addEventListener('input', handleMaxViewsChange);

    // Clear filters button
    clearFiltersBtn.addEventListener('click', clearAllFilters);

    // Prevent suggestions from closing when clicking on them
    suggestionsContainer.addEventListener('mousedown', function(e) {
        e.preventDefault();
    });
}

// Load all posts from server using fetch
async function loadAllPosts() {
    try {
        showLoading();
        const response = await fetch('http://localhost:3000/posts');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allPosts = await response.json();
        filteredPosts = [...allPosts];
        
        updateStats();
        renderPosts();
        generateSearchSuggestions();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        showError('Failed to load posts. Please check if the server is running.');
    }
}

// Handle search input with debouncing
let searchTimeout;
function handleSearchInput(e) {
    const query = e.target.value.trim();
    currentFilters.title = query;
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // Debounce search to avoid too many API calls
    searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
            searchPosts(query);
        } else if (query.length === 0) {
            // If search is cleared, show all posts
            filteredPosts = [...allPosts];
            applyFilters();
        }
        updateSuggestions(query);
    }, 300);
}

// Search posts using server API
async function searchPosts(query) {
    try {
        const response = await fetch(`http://localhost:3000/posts?title_like=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const searchResults = await response.json();
        filteredPosts = searchResults;
        applyFilters();
        
    } catch (error) {
        console.error('Error searching posts:', error);
        // Fallback to client-side search
        filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase())
        );
        applyFilters();
    }
}

// Generate search suggestions from all posts
function generateSearchSuggestions() {
    const titles = allPosts.map(post => post.title);
    const uniqueTitles = [...new Set(titles)];
    
    searchSuggestions = uniqueTitles.map(title => ({
        title: title,
        count: allPosts.filter(post => post.title === title).length
    }));
}

// Update suggestions based on current input
function updateSuggestions(query) {
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    const filteredSuggestions = searchSuggestions.filter(suggestion =>
        suggestion.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Show max 5 suggestions
    
    if (filteredSuggestions.length > 0) {
        showSuggestions(filteredSuggestions);
    } else {
        hideSuggestions();
    }
}

// Show suggestions dropdown
function showSuggestions(suggestions = null) {
    if (!suggestions) {
        suggestions = searchSuggestions.slice(0, 5);
    }
    
    suggestionsContainer.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" data-title="${suggestion.title}">
            <strong>${highlightMatch(suggestion.title, currentFilters.title)}</strong>
            <span style="color: #6c757d; font-size: 0.9em;">(${suggestion.count} posts)</span>
        </div>
    `).join('');
    
    // Add click handlers to suggestions
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const title = this.dataset.title;
            searchInput.value = title;
            currentFilters.title = title;
            searchPosts(title);
            hideSuggestions();
        });
    });
    
    suggestionsContainer.style.display = 'block';
}

// Hide suggestions dropdown
function hideSuggestions() {
    setTimeout(() => {
        suggestionsContainer.style.display = 'none';
    }, 200);
}

// Highlight matching text in suggestions
function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: #ffeb3b; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

// Handle min views slider change
function handleMinViewsChange(e) {
    const value = parseInt(e.target.value);
    currentFilters.minViews = value;
    minViewsValue.textContent = value;
    
    // Ensure min doesn't exceed max
    if (value > currentFilters.maxViews) {
        maxViewsSlider.value = value;
        maxViewsValue.textContent = value;
        currentFilters.maxViews = value;
    }
    
    applyFilters();
}

// Handle max views slider change
function handleMaxViewsChange(e) {
    const value = parseInt(e.target.value);
    currentFilters.maxViews = value;
    maxViewsValue.textContent = value;
    
    // Ensure max doesn't go below min
    if (value < currentFilters.minViews) {
        minViewsSlider.value = value;
        minViewsValue.textContent = value;
        currentFilters.minViews = value;
    }
    
    applyFilters();
}

// Apply all filters
function applyFilters() {
    let filtered = [...allPosts];
    
    // Apply title filter
    if (currentFilters.title) {
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(currentFilters.title.toLowerCase())
        );
    }
    
    // Apply views range filter
    filtered = filtered.filter(post =>
        post.views >= currentFilters.minViews && post.views <= currentFilters.maxViews
    );
    
    filteredPosts = filtered;
    updateStats();
    renderPosts();
}

// Clear all filters
function clearAllFilters() {
    searchInput.value = '';
    currentFilters.title = '';
    currentFilters.minViews = 0;
    currentFilters.maxViews = 10000;
    
    minViewsSlider.value = 0;
    maxViewsSlider.value = 10000;
    minViewsValue.textContent = '0';
    maxViewsValue.textContent = '10000';
    
    filteredPosts = [...allPosts];
    hideSuggestions();
    updateStats();
    renderPosts();
}

// Render posts to the DOM
function renderPosts() {
    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">?</div>
                <h3>No posts found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = `
        <div class="posts-grid">
            ${filteredPosts.map(post => createPostCard(post)).join('')}
        </div>
    `;
}

// Create individual post card
function createPostCard(post) {
    return `
        <div class="post-card">
            <div class="post-id">#${post.id}</div>
            <div class="post-title">${post.title}</div>
            <div class="post-views">
                <span>${post.views.toLocaleString()} views</span>
            </div>
        </div>
    `;
}

// Update statistics
function updateStats() {
    totalPostsSpan.textContent = allPosts.length;
    filteredPostsSpan.textContent = filteredPosts.length;
    
    if (filteredPosts.length > 0) {
        const avgViews = Math.round(
            filteredPosts.reduce((sum, post) => sum + post.views, 0) / filteredPosts.length
        );
        avgViewsSpan.textContent = avgViews.toLocaleString();
    } else {
        avgViewsSpan.textContent = '0';
    }
}

// Show loading state
function showLoading() {
    postsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading posts...</p>
        </div>
    `;
}

// Show error state
function showError(message) {
    postsContainer.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">!</div>
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="loadAllPosts()" style="margin-top: 20px; padding: 10px 20px; background: white; color: black; border: 2px solid black; border-radius: 8px; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
}

// Utility function to format numbers
function formatNumber(num) {
    return num.toLocaleString();
}

// Export functions for global access
window.loadAllPosts = loadAllPosts;
