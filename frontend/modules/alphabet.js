const signExamples = [
    {
        alphabet: "A",
        instructions: [
            "Hand Shape: Form a fist with your hand.",
            "Thumb Placement: Position your thumb so it's resting on the side of your fist."
        ],
        category: "alphabet",
        image: "images/img_A.webp" // Add the image URL if available
    },
    {
        alphabet: "B",
        instructions: [
            "Hand Shape: Hold your hand upright with your fingers fully extended and pressed together.",
            "Thumb Placement: Tuck your thumb across your palm or to the side."
        ],
        category: "alphabet",
        image: "images/img_B.jpg" // Add the image URL if available
    },
    {
        alphabet: "C",
        instructions: [
            "Hand Shape: Curve your fingers to form a C shape.",
            "Thumb Placement: Keep your thumb and fingers creating a semicircle."
        ],
        category: "alphabet",
        image: "images/img_c.webp" // Add the image URL if available
    },
    {
        alphabet: "D",
        instructions: [
            "Hand Shape: Extend your index finger while keeping the other fingers curled into your palm.",
            "Thumb Placement: Position your thumb against the side of your index finger."
        ],
        category: "alphabet",
        image: "images/img_D.webp" // Add the image URL if available
    },
    {
        alphabet: "E",
        instructions: [
            "Hand Shape: Curl your fingers into your palm.",
            "Thumb Placement: Position your thumb across your curled fingers."
        ],
        category: "alphabet",
        image: "images/img_e.webp"
    },
    {
        alphabet: "F",
        instructions: [
            "Hand Shape: Bring your index finger and thumb together to form a circle.",
            "Keep the remaining fingers extended and upright."
        ],
        category: "alphabet",
        image: "images/img_f.webp"
    },
    {
        alphabet: "G",
        instructions: [
            "Hand Shape: Extend your thumb and index finger horizontally.",
            "Keep the remaining fingers curled."
        ],
        category: "alphabet",
        image: "images/img_g.webp"
    },
    {
        alphabet: "H",
        instructions: [
            "Hand Shape: Extend your index and middle fingers horizontally.",
            "Keep the remaining fingers curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_h.webp"
    },
    {
        alphabet: "I",
        instructions: [
            "Hand Shape: Raise your pinky finger while curling the other fingers into your palm."
        ],
        category: "alphabet",
        image: "images/img_i.webp"
    },
    {
        alphabet: "J",
        instructions: [
            "Hand Shape: Start with the I sign (raise your pinky finger).",
            "Motion: Draw a J shape in the air with your pinky."
        ],
        category: "alphabet",
        image: "images/img_j.webp"
    },
    {
        alphabet: "K",
        instructions: [
            "Hand Shape: Extend your index and middle fingers upward.",
            "Thumb Placement: Position your thumb between the index and middle fingers."
        ],
        category: "alphabet",
        image: "images/img_k.webp"
    },
    {
        alphabet: "L",
        instructions: [
            "Hand Shape: Extend your index finger and thumb to form an L shape.",
            "Keep the other fingers curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_l.webp"
    },
    {
        alphabet: "M",
        instructions: [
            "Hand Shape: Place your thumb under three fingers resting on your palm.",
            "Keep your pinky finger extended."
        ],
        category: "alphabet",
        image: "images/img_m.webp"
    },
    {
        alphabet: "N",
        instructions: [
            "Hand Shape: Place your thumb under two fingers resting on your palm.",
            "Keep the remaining fingers extended."
        ],
        category: "alphabet",
        image: "images/img_n.webp"
    },
    {
        alphabet: "O",
        instructions: [
            "Hand Shape: Curve your fingers to form an O shape.",
            "Keep your thumb and fingers touching to form a circle."
        ],
        category: "alphabet",
        image: "images/img_o.webp"
    },
    {
        alphabet: "P",
        instructions: [
            "Hand Shape: Make a K sign (index and middle fingers extended with thumb between them).",
            "Positioning: Tilt your hand downward so the P is facing outward."
        ],
        category: "alphabet",
        image: "images/img_p.webp"
    },
    {
        alphabet: "Q",
        instructions: [
            "Hand Shape: Make a G sign (thumb and index finger extended horizontally).",
            "Positioning: Tilt your hand downward so the Q is facing outward."
        ],
        category: "alphabet",
        image: "images/img_q.webp"
    },
    {
        alphabet: "R",
        instructions: [
            "Hand Shape: Cross your index and middle fingers.",
            "Keep the remaining fingers curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_r.webp"
    },
    {
        alphabet: "S",
        instructions: [
            "Hand Shape: Form a fist with your thumb resting across your curled fingers."
        ],
        category: "alphabet",
        image: "images/img_s.webp"
    },
    {
        alphabet: "T",
        instructions: [
            "Hand Shape: Form a fist with your thumb tucked between your index and middle fingers."
        ],
        category: "alphabet",
        image: "images/img_t.webp"
    },
    {
        alphabet: "U",
        instructions: [
            "Hand Shape: Extend your index and middle fingers upward and together.",
            "Keep the remaining fingers curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_u.webp"
    },
    {
        alphabet: "V",
        instructions: [
            "Hand Shape: Extend your index and middle fingers upward to form a V shape.",
            "Keep the remaining fingers curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_v.webp"
    },
    {
        alphabet: "W",
        instructions: [
            "Hand Shape: Extend your index, middle, and ring fingers upward.",
            "Keep your thumb and pinky curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_w.webp"
    },
    {
        alphabet: "X",
        instructions: [
            "Hand Shape: Bend your index finger to form a hook shape.",
            "Keep the other fingers curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_x.webp"
    },
    {
        alphabet: "Y",
        instructions: [
            "Hand Shape: Extend your thumb and pinky finger.",
            "Keep the other fingers curled into your palm."
        ],
        category: "alphabet",
        image: "images/img_y.webp"
    },
    {
        alphabet: "Z",
        instructions: [
            "Hand Shape: Extend your index finger.",
            "Motion: Draw a Z shape in the air with your extended finger."
        ],
        category: "alphabet",
        image: "images/img_z.webp"
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
//commit