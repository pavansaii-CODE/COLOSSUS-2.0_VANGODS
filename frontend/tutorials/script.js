// Video data
var videos = [
    {
        id: 1,
        title: "ASL Alphabet Basics",
        description: "Learn the American Sign Language alphabet with clear demonstrations of each letter.",
        category: "alphabet",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=ASL+Alphabet",
        videoUrl:  src="https://www.youtube.com/embed/DBQINq0SsAw" ,
        duration: "8:45",
        featured: true
    },
    {
        id: 2,
        title: "Common Everyday Phrases",
        description: "Master essential everyday phrases in sign language for basic communication.",
        category: "phrases",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Common+Phrases",
        videoUrl: "https://www.youtube.com/embed/nJx-XsxeajQ" ,
        duration: "12:30",
        featured: true
    },
    {
        id: 3,
        title: "Introduction to Sign Language",
        description: "A beginner's guide to sign language with basic hand shapes and movements.",
        category: "basics",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Intro+to+Sign+Language",
        videoUrl: "https://www.youtube.com/embed/6w1ZDaE-whc" ,
        duration: "15:20",
        featured: true
    },
    {
        id: 4,
        title: "Numbers in Sign Language",
        description: "Learn how to sign numbers from 1-100 in American Sign Language.",
        category: "basics",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Numbers",
        videoUrl: "https://www.youtube.com/embed/Y4stD_ypaAI" ,
        duration: "10:15"
    },
    {
        id: 5,
        title: "Family Signs",
        description: "Learn signs for family members including mother, father, sister, brother, and more.",
        category: "phrases",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Family+Signs",
        videoUrl: "https://www.youtube.com/embed/VOnHnaNiVSM",
        duration: "9:50"
    },
    {
        id: 6,
        title: "Conversational Sign Language",
        description: "Practice conversational skills with this intermediate level sign language tutorial.",
        category: "conversation",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Conversation",
        videoUrl: "https://www.youtube.com/embed/CGqXy3JOZRs",
        duration: "18:25"
    },
    {
        id: 7,
        title: "Emergency Signs",
        description: "Important signs for emergency situations that everyone should know.",
        category: "phrases",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Emergency+Signs",
        videoUrl: "<https://www.youtube.com/embed/zht0ia5Vq1U" ,
        duration: "7:35"
    },
    {
        id: 8,
        title: "ASL Grammar Basics",
        description: "Understanding the grammar structure of American Sign Language.",
        category: "basics",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=ASL+Grammar",
        videoUrl: "https://example.com/videos/asl-grammar.mp4",
        duration: "14:10"
    },
    {
        id: 9,
        title: "Telling Time in Sign Language",
        description: "Learn how to express time concepts in American Sign Language.",
        category: "basics",
        thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=Telling+Time",
        videoUrl: "https://www.youtube.com/embed/IxZtbUTnb70" ,
        duration: "11:45"
    }
];

// DOM Elements
const featuredVideosGrid = document.querySelector('.video-grid.featured');
const allVideosGrid = document.querySelector('.video-grid.all');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('videoModal');
const modalTitle = document.getElementById('modalTitle');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const modalDescription = document.getElementById('modalDescription');
const videoPlayer = document.getElementById('videoPlayer');
const closeModalBtn = document.querySelector('.close-modal');
const currentYearSpan = document.getElementById('current-year');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

// Set current year in footer
currentYearSpan.textContent = new Date().getFullYear();

// Create video card element
function createVideoCard(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.dataset.category = video.category;
    
    videoCard.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="video-overlay">
                <button class="play-btn" aria-label="Play video">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                </button>
            </div>
            <div class="video-duration">${video.duration}</div>
        </div>
        <div class="video-content">
            <div class="video-category">${video.category}</div>
            <h3 class="video-title">${video.title}</h3>
            <p class="video-description">${video.description}</p>
        </div>
    `;
    
    // Add click event to play the video
    videoCard.addEventListener('click', () => {
        openVideoModal(video);
    });
    
    return videoCard;
}

// Populate featured videos
function populateFeaturedVideos() {
    const featuredVideos = videos.filter(video => video.featured);
    
    featuredVideos.forEach(video => {
        featuredVideosGrid.appendChild(createVideoCard(video));
    });
}

// Populate all videos
function populateAllVideos(category = 'all') {
    // Clear existing videos
    allVideosGrid.innerHTML = '';
    
    // Filter videos by category if needed
    const filteredVideos = category === 'all' 
        ? videos 
        : videos.filter(video => video.category === category);
    
    // Add videos to the grid
    filteredVideos.forEach(video => {
        allVideosGrid.appendChild(createVideoCard(video));
    });
}

function openVideoModal(video) {
    modalTitle.textContent = video.title;
    modalVideoTitle.textContent = video.title;
    modalDescription.textContent = video.description;

    // Clear previous video source (if any)
    videoPlayer.innerHTML = '';

    if (video.videoUrl.includes('youtube.com/embed')) {
        // YouTube Embed Logic
        const iframe = document.createElement('iframe');
        iframe.src = video.videoUrl;
        iframe.width = '100%';
        iframe.height = '360';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        videoPlayer.appendChild(iframe);
    } else {
        // MP4 or other direct file logic
        const source = document.createElement('source');
        source.src = video.videoUrl;
        source.type = 'video/mp4'; // Change this if using other formats like .webm
        videoPlayer.appendChild(source);
        videoPlayer.load(); // Load the new video
    }

    // Show the modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}


// Close video modal
function closeVideoModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Pause the video
    videoPlayer.pause();
}

// Filter videos by category
function filterVideos() {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get category from data attribute
            const category = button.dataset.category;
            
            // Update videos grid
            populateAllVideos(category);
        });
    });
}

// Mobile menu toggle (simplified for this example)
function setupMobileMenu() {
    mobileMenuBtn.addEventListener('click', () => {
        alert('Mobile menu would open here in a full implementation');
    });
}

// Newsletter form submission
function setupNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input').value;
        
        if (email) {
            alert(`Thank you for subscribing with ${email}! You'll receive our latest sign language video updates.`);
            form.reset();
        }
    });
}

// Close modal when clicking the close button
closeModalBtn.addEventListener('click', closeVideoModal);

// Close modal when clicking outside the content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeVideoModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeVideoModal();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    populateFeaturedVideos();
    populateAllVideos();
    filterVideos();
    setupMobileMenu();
    setupNewsletterForm();
});