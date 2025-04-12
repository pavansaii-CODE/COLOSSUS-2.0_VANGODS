const signExamples = [
    {
        word: "eat",
        instructions: [
            "Hand Shape: Bring your fingers together to form a flat 'O' shape.",
            "Tap your fingertips to your lips as if bringing food to your mouth."
        ],
        category: "action",
        image: "images/eat.jpeg"
    },
    {
        word: "drink",
        instructions: [
            "Hand Shape: Form a 'C' shape with your hand as if holding a cup.",
            "Tilt your hand back toward your mouth as if taking a drink."
        ],
        category: "action",
        image: "images/drink.gif"
    },
    {
        word: "catch",
        instructions: [
            "Hand Shape: Start with your hands open and palms facing forward.",
            "Quickly bring your hands together as if catching a ball."
        ],
        category: "action",
        image: "images/catch.webp"
    },
    {
        word: "better",
        instructions: [
            "Hand Shape: Place your flat hand near your chin, palm facing inward.",
            "Move your hand upward slightly, as if showing improvement."
        ],
        category: "action",
        image: "images/better.jpeg"
    },
    {
        word: "art",
        instructions: [
            "Hand Shape: Extend your pinky and index fingers on your dominant hand.",
            "Move your hand in a wavy motion over the palm of your non-dominant hand."
        ],
        category: "action",
        image: "images/art.webp"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const signExamplesContainer = document.getElementById('signExamples');
    const noResults = document.getElementById('noResults');

    // Populate category filter
    const categories = [...new Set(signExamples.map(example => example.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Filter and render examples
    function filterAndRenderExamples() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredExamples = signExamples.filter(example => {
            const matchesSearch = example.word.toLowerCase().includes(searchTerm);
            const matchesCategory = !selectedCategory || example.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderExamples(filteredExamples);
    }

    // Render examples
    function renderExamples(examples) {
        signExamplesContainer.innerHTML = '';

        if (examples.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');

            examples.forEach(example => {
                const card = document.createElement('div');
                card.className = 'sign-card';

                card.innerHTML = `
                    <div class="sign-header" onclick="toggleExample(this)">
                        <div class="sign-title">
                            <h2>${example.word}</h2>
                        </div>
                        <span class="category-tag">${example.category}</span>
                    </div>
                    <div class="sign-content">
                        <img src="${example.image || 'placeholder.png'}" alt="${example.word} sign" class="sign-image">
                        <h3 class="instructions-title">Instructions:</h3>
                        <ol class="instructions-list">
                            ${example.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                        </ol>
                    </div>
                `;

                signExamplesContainer.appendChild(card);
            });
        }
    }

    // Event listeners
    searchInput.addEventListener('input', filterAndRenderExamples);
    categoryFilter.addEventListener('change', filterAndRenderExamples);

    // Initial render
    filterAndRenderExamples();
});

// Toggle example content
function toggleExample(header) {
    const content = header.nextElementSibling;

    // Toggle the content visibility
    const isActive = content.classList.contains('active');
    document.querySelectorAll('.sign-content.active').forEach(el => el.classList.remove('active'));
    if (!isActive) {
        content.classList.add('active');
    }
}