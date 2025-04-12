const signExamples = [
    {
        word: "what",
        instructions: [
            "Hand Shape: Hold both hands in front, palms facing upward.",
            "Move your hands slightly side-to-side as if asking a question."
        ],
        category: "question",
        image: "images/what.jpg"
    },
    {
        word: "when",
        instructions: [
            "Hand Shape: Extend your index finger on your dominant hand.",
            "Draw a small circle near your other index finger."
        ],
        category: "question",
        image: "images/when.jpg"
    },
    {
        word: "who",
        instructions: [
            "Hand Shape: Form an 'L' shape with your dominant hand.",
            "Place your thumb on your chin and wiggle your index finger."
        ],
        category: "question",
        image: "images/who.jpg"
    },
    {
        word: "where",
        instructions: [
            "Hand Shape: Extend your index finger.",
            "Move your hand side-to-side as if searching for something."
        ],
        category: "question",
        image: "images/where.jpg"
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