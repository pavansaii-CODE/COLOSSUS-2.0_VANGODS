const signExamples = [
    {
        digit: "0",
        instructions: [
            "Hand Shape: Form a circle with all your fingers touching at the tips."
        ],
        category: "number",
        image: "images/img_O.jpg"
    },
    {
        digit: "1",
        instructions: [
            "Hand Shape: Raise your index finger.",
            "Keep other fingers curled into your palm."
        ],
        category: "number",
        image: "images/img_1.jpg"
    },
    {
        digit: "2",
        instructions: [
            "Hand Shape: Raise your index and middle fingers.",
            "Keep other fingers curled."
        ],
        category: "number",
        image: "images/img_2.jpg"
    },
    {
        digit: "3",
        instructions: [
            "Hand Shape: Raise your thumb, index, and middle fingers.",
            "Curl your ring and pinky fingers."
        ],
        category: "number",
        image: "images/img_3.jpg"
    },
    {
        digit: "4",
        instructions: [
            "Hand Shape: Raise all fingers except the thumb."
        ],
        category: "number",
        image: "images/img_4.jpg"
    },
    {
        digit: "5",
        instructions: [
            "Hand Shape: Raise all five fingers and spread them slightly."
        ],
        category: "number",
        image: "images/img_5.jpg"
    },
    {
        digit: "6",
        instructions: [
            "Hand Shape: Touch your pinky to your thumb.",
            "Extend the other three fingers."
        ],
        category: "number",
        image: "images/img_6.jpg"
    },
    {
        digit: "7",
        instructions: [
            "Hand Shape: Touch your ring finger to your thumb.",
            "Extend the other three fingers."
        ],
        category: "number",
        image: "images/img_7.jpg"
    },
    {
        digit: "8",
        instructions: [
            "Hand Shape: Touch your middle finger to your thumb.",
            "Extend the other three fingers."
        ],
        category: "number",
        image: "images/img_8.jpg"
    },
    {
        digit: "9",
        instructions: [
            "Hand Shape: Touch your index finger to your thumb.",
            "Extend the other three fingers."
        ],
        category: "number",
        image: "images/img_9.jpg"
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
            const matchesSearch = example.digit.toLowerCase().includes(searchTerm);
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
                            <h2>${example.digit}</h2>
                        </div>
                        <span class="category-tag">${example.category}</span>
                    </div>
                    <div class="sign-content">
                        <img src="${example.image || 'placeholder.png'}" alt="${example.digit} sign" class="sign-image">
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