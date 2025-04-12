/**
 * Global Beams Interaction Script
 * Adds interactive beam effects throughout the page
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add navbar beam effect that follows the mouse
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    navbar.addEventListener('mousemove', function(e) {
      // Get position relative to the navbar
      const rect = navbar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update the position of the beam effect
      navbar.style.setProperty('--beam-x', `${x}px`);
      navbar.style.setProperty('--beam-y', `${y}px`);
    });
  }
  // Add section-specific beam effects on scroll
  const sections = document.querySelectorAll('.background-beams-container, .features, .about, .footer');

  // Track scroll position for parallax effects
  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;

    // Apply parallax effect to each section
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionMiddle = sectionTop + sectionHeight / 2;

      // Calculate distance from middle of viewport
      const viewportMiddle = scrollY + window.innerHeight / 2;
      const distanceFromMiddle = Math.abs(sectionMiddle - viewportMiddle);

      // Only apply effects when section is near viewport
      if (distanceFromMiddle < window.innerHeight) {
        // Calculate intensity based on proximity to middle (closer = stronger effect)
        const intensity = 1 - (distanceFromMiddle / window.innerHeight);

        // Apply subtle transform to section's pseudo-elements
        if (section.classList.contains('background-beams-container')) {
          section.style.setProperty('--beam-intensity', intensity.toFixed(2));
        } else if (section.classList.contains('features')) {
          section.style.setProperty('--beam-intensity', intensity.toFixed(2));
        } else if (section.classList.contains('about')) {
          section.style.setProperty('--beam-intensity', intensity.toFixed(2));
        } else if (section.classList.contains('footer')) {
          section.style.setProperty('--beam-intensity', intensity.toFixed(2));
        }
      }
    });
  });

  // Create additional beam elements on mouse movement
  document.addEventListener('mousemove', function(e) {
    // Only create a beam occasionally to avoid performance issues
    if (Math.random() > 0.97) {
      createBeamParticle(e.clientX, e.clientY);
    }
  });

  // Create beam particles on click
  document.addEventListener('click', function(e) {
    // Create multiple particles for a more dramatic effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createBeamParticle(e.clientX, e.clientY);
      }, i * 100);
    }
  });

  /**
   * Creates a beam particle at the specified position
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   */
  function createBeamParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('beam-particle');

    // Define our color palette
    const colors = [
      [79, 70, 229],   // indigo-600
      [124, 58, 237],  // violet-600
      [139, 92, 246],  // purple-500
      [167, 139, 250], // purple-400
      [224, 231, 255]  // indigo-100
    ];

    // Get a random color from our palette
    const colorIndex = Math.floor(Math.random() * colors.length);
    const [r, g, b] = colors[colorIndex];

    // Set particle position
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    // Randomize particle properties
    particle.style.width = `${Math.random() * 15 + 5}px`;
    particle.style.height = particle.style.width;

    // Set particle appearance
    particle.style.background = `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, 0.9) 0%, transparent 70%)`;
    particle.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px rgba(${r}, ${g}, ${b}, 0.7)`;

    // Add random animation duration
    particle.style.animationDuration = `${0.8 + Math.random() * 0.7}s`;

    // Add to document
    document.body.appendChild(particle);

    // Remove particle after animation completes
    setTimeout(() => {
      if (particle.parentNode === document.body) {
        document.body.removeChild(particle);
      }
    }, 1500);
  }

  // Add parallax effect to global beams
  const beams = document.querySelectorAll('.global-beam-1, .global-beam-2, .global-beam-3');

  document.addEventListener('mousemove', function(e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    beams.forEach((beam, index) => {
      const depth = (index + 1) * 10;
      const moveX = (mouseX - 0.5) * depth;
      const moveY = (mouseY - 0.5) * depth;

      beam.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
});
