// Module content data
const moduleContent = {
    beginner: {
        title: 'Beginner Modules',
        modules: [
            { name: 'Alphabet', description: 'Learn the sign language alphabet', page: 'alphabet.html' },
            { name: 'Numbers', description: 'Learn numbers in sign language', page: 'numbers.html' }
        ]
    },
    intermediate: {
        title: 'Intermediate Modules',
        modules: [
            { name: 'Basic Conversations', description: 'Learn simple conversations', page: 'basic-conversations.html' },
            { name: 'Greetings', description: 'Learn common greetings in sign language', page: 'greetings.html' }
        ]
    },
    advanced: {
        title: 'Advanced Modules',
        modules: [
            { name: 'Advanced Grammar', description: 'Master grammar in sign language', page: 'advanced-grammar.html' },
            { name: 'Complex Conversations', description: 'Handle complex scenarios', page: 'complex-conversations.html' }
        ]
    }
};

// DOM Elements
const difficultyCards = document.querySelectorAll('.difficulty-card');
const modulesSection = document.getElementById('modules-section');
const contentSection = document.getElementById('content-section');
const contentTitle = document.getElementById('content-title');
const contentGrid = document.getElementById('content-grid');
const backButton = document.getElementById('back-button');

// Event Listeners for Difficulty Levels
difficultyCards.forEach(card => {
    card.addEventListener('click', () => {
        const level = card.dataset.level; // Get the selected level
        const selectedContent = moduleContent[level]; // Fetch the module data for the level

        if (selectedContent) {
            showModules(selectedContent); // Show the modules for the selected level
        } else {
            alert('This feature is not available yet. Please check back later!');
        }
    });
});

// Event Listener for Back Button
backButton.addEventListener('click', () => {
    contentSection.classList.add('hidden');
    modulesSection.classList.remove('hidden');
});

// Function to Show Modules for Selected Level
function showModules(content) {
    modulesSection.innerHTML = ''; // Clear any previous modules
    contentSection.classList.add('hidden'); // Hide content section if visible

    // Set the title
    const title = document.createElement('h2');
    title.textContent = content.title;
    modulesSection.appendChild(title);

    // Add module cards
    content.modules.forEach(module => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.innerHTML = `
            <h3>${module.name}</h3>
            <p>${module.description}</p>
        `;

        // Add click listener for navigation
        card.addEventListener('click', () => {
            if (module.page) {
                window.location.href = module.page; // Redirect to the respective page
            } else {
                alert('This feature is not yet implemented!');
            }
        });

        modulesSection.appendChild(card);
    });

    // Display the modules section
    document.querySelector('.difficulty-selection').classList.add('hidden');
    modulesSection.classList.remove('hidden');
}
