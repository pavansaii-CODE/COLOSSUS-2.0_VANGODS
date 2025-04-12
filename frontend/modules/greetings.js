const signExamples = [
    {
        word: "hello",
        instructions: [
            "Hand Shape: Extend your fingers and keep them together.",
            "Move your hand away from your forehead in a small wave motion."
        ],
        category: "greeting",
        image: "images/hello.webp"
    },
    {
        word: "goodbye",
        instructions: [
            "Hand Shape: Extend your fingers and keep them together.",
            "Move your hand in a waving motion side-to-side."
        ],
        category: "greeting",
        image: "images/goodbye.jpg"
    },
    {
        word: "morning",
        instructions: [
            "Hand Shape: Place one hand in the crook of your opposite elbow.",
            "Raise your opposite forearm up as if imitating the sun rising."
        ],
        category: "time",
        image: "images/morning.webp"
    },
    {
        word: "thank you",
        instructions: [
            "Hand Shape: Place the fingers of one hand on your chin.",
            "Move your hand forward and slightly down as if blowing a kiss."
        ],
        category: "greeting",
        image: "images/thank_u.jpg"
    },
    {
        word: "good night",
        instructions: [
            "Hand Shape: Bring one hand to your chin, palm down.",
            "Move your hand forward and lower it as if signaling rest."
        ],
        category: "time",
        image: "images/good_night.webp"
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