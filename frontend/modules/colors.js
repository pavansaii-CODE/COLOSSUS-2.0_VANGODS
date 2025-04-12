const signExamples = [
    {
        word: "black",
        instructions: [
            "Hand Shape: Make a fist with your dominant hand.",
            "Rub your knuckles across your forehead."
        ],
        image: "images/black.gif"
    },
    {
        word: "white",
        instructions: [
            "Hand Shape: Start with your hand open, touching your chest.",
            "Pull your hand outward while closing it slightly."
        ],
        image: "images/white.gif"
    },
    {
        word: "red",
        instructions: [
            "Hand Shape: Extend your index finger.",
            "Touch your lips with the tip of your finger and pull downward."
        ],
        image: "images/red.jpeg"
    },
    {
        word: "blue",
        instructions: [
            "Hand Shape: Extend all fingers and shake your hand slightly.",
            "Position your hand at shoulder level."
        ],
        image: "images/blue.webp"
    },
    {
        word: "brown",
        instructions: [
            "Hand Shape: Make a 'B' shape with your dominant hand.",
            "Place your hand against your cheek and slide it downward."
        ],
        image: "images/brown.webp"
    },
    {
        word: "gold",
        instructions: [
            "Hand Shape: Extend your index finger and middle finger.",
            "Make a small circular motion near your ear, then pull downward."
        ],
        image: "images/gold.webp"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const signExamplesContainer = document.getElementById('signExamples');
    const noResults = document.getElementById('noResults');

    // Filter and render examples
    function filterAndRenderExamples() {
        const searchTerm = searchInput.value.toLowerCase();

        const filteredExamples = signExamples.filter(example => {
            return example.word.toLowerCase().includes(searchTerm);
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