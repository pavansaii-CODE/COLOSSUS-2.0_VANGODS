
const signExamples = [
   
    // Numbers 0-9
    {
        number: "0",
        instructions: [
            "Hand Shape: Create an O shape with your fingers and thumb.",
            "Positioning: Keep your palm facing outward."
        ],
        category: "numbers",
        image: "images/img_O.jpg" // Add the image URL if available
    },
    {
        number: "1",
        instructions: [
            "Hand Shape: Extend your index finger upward.",
            "Positioning: Keep your other fingers curled into your palm."
        ],
        category: "numbers",
        image: "images/img_1.jpg" // Add the image URL if available
    },
    {
        number: "2",
        instructions: [
            "Hand Shape: Extend your index and middle fingers upward.",
            "Positioning: Keep the remaining fingers curled into your palm."
        ],
        category: "numbers",
        image: "images/img_2.jpg" // Add the image URL if available
    },
    {
        number: "3",
        instructions: [
            "Hand Shape: Extend your thumb, index finger, and middle finger upward.",
            "Positioning: Keep your ring and pinky fingers curled into your palm."
        ],
        category: "numbers",
        image: "images/img_3.jpg" // Add the image URL if available
    },
    {
        number: "4",
        instructions: [
            "Hand Shape: Extend your index, middle, ring, and pinky fingers upward.",
            "Positioning: Keep your thumb tucked against your palm."
        ],
        category: "numbers",
        image: "images/img_4.jpg" // Add the image URL if available
    },
    {
        number: "5",
        instructions: [
            "Hand Shape: Spread all five fingers upward.",
            "Positioning: Keep your palm facing outward."
        ],
        category: "numbers",
        image: "images/img_5.jpg" // Add the image URL if available
    },
    {
        number: "6",
        instructions: [
            "Hand Shape: Touch your thumb to your pinky finger.",
            "Positioning: Keep the remaining three fingers extended upward."
        ],
        category: "numbers",
        image: "images/img_6.jpg" // Add the image URL if available
    },
    {
        number: "7",
        instructions: [
            "Hand Shape: Touch your thumb to your ring finger.",
            "Positioning: Keep the other fingers extended upward."
        ],
        category: "numbers",
        image: "images/img_7.jpg" // Add the image URL if available
    },
    {
        number: "8",
        instructions: [
            "Hand Shape: Touch your thumb to your middle finger.",
            "Positioning: Keep the other fingers extended upward."
        ],
        category: "numbers",
        image: "images/img_8.jpg" // Add the image URL if available
    },
    {
        number: "9",
        instructions: [
            "Hand Shape: Touch your thumb to your index finger.",
            "Positioning: Keep the remaining three fingers extended upward."
        ],
        category: "numbers",
        image: "images/img_9.jpg" // Add the image URL if available
    }
];





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
            const matchesSearch = example.alphabet.toLowerCase().includes(searchTerm);
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
                            <h2>${example.alphabet}</h2>
                        </div>
                        <span class="category-tag">${example.category}</span>
                    </div>
                    <div class="sign-content">
                        <img src="${example.image || 'placeholder.png'}" alt="${example.alphabet} sign" class="sign-image">
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