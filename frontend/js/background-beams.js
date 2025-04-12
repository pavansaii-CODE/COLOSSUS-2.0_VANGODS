/**
 * Background Beams with Collision Effect
 * Creates an interactive background with beams that respond to user clicks
 */

document.addEventListener('DOMContentLoaded', function() {
  const beamsContainer = document.querySelector('.background-beams-container');

  if (!beamsContainer) return;

  // Create additional beam elements for a more dynamic effect
  // Define our color palette
  const colors = [
    [79, 70, 229],   // indigo-600
    [124, 58, 237],  // violet-600
    [139, 92, 246],  // purple-500
    [167, 139, 250], // purple-400
    [99, 102, 241]   // indigo-500
  ];

  for (let i = 0; i < 8; i++) {
    const beam = document.createElement('div');
    beam.classList.add('beam');
    beam.style.width = `${Math.random() * 300 + 100}px`;
    beam.style.height = `${Math.random() * 300 + 100}px`;
    beam.style.left = `${Math.random() * 100}%`;
    beam.style.top = `${Math.random() * 100}%`;

    // Get a random color from our palette
    const colorIndex = Math.floor(Math.random() * colors.length);
    const [r, g, b] = colors[colorIndex];

    beam.style.background = `radial-gradient(circle at center,
      rgba(${r}, ${g}, ${b}, ${Math.random() * 0.3 + 0.3}) 0%,
      transparent 70%)`;
    beam.style.borderRadius = '50%';
    beam.style.position = 'absolute';
    beam.style.filter = 'blur(15px)';
    beam.style.opacity = `${Math.random() * 0.3 + 0.4}`;

    // Add random animation
    const duration = Math.random() * 25 + 15;
    beam.style.animation = `beam-movement ${duration}s infinite linear`;
    beam.style.animationDelay = `${Math.random() * -20}s`;

    beamsContainer.querySelector('.background-beams').appendChild(beam);
  }

  // Add click event to create explosion effect
  beamsContainer.addEventListener('click', function(e) {
    createParticles(e.clientX, e.clientY);
  });

  function createParticles(x, y) {
    // Create multiple particles for explosion effect
    // Define our color palette for particles
    const particleColors = [
      [79, 70, 229],   // indigo-600
      [124, 58, 237],  // violet-600
      [139, 92, 246],  // purple-500
      [167, 139, 250], // purple-400
      [224, 231, 255]  // indigo-100 (for some bright particles)
    ];

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.classList.add('beam-particle');

      // Calculate position relative to the container
      const rect = beamsContainer.getBoundingClientRect();
      const posX = x - rect.left;
      const posY = y - rect.top;

      particle.style.left = `${posX}px`;
      particle.style.top = `${posY}px`;

      // Randomize particle properties
      particle.style.width = `${Math.random() * 12 + 5}px`;
      particle.style.height = particle.style.width;

      // Get a random color from our palette
      const colorIndex = Math.floor(Math.random() * particleColors.length);
      const [r, g, b] = particleColors[colorIndex];

      particle.style.background = `radial-gradient(circle at center,
        rgba(${r}, ${g}, ${b}, 0.9) 0%,
        transparent 70%)`;

      // Add random animation delay and duration
      particle.style.animationDelay = `${Math.random() * 0.2}s`;
      particle.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;

      // Add glow effect
      particle.style.boxShadow = `0 0 ${Math.random() * 8 + 4}px rgba(${r}, ${g}, ${b}, 0.7)`;

      beamsContainer.appendChild(particle);

      // Remove particle after animation completes
      setTimeout(() => {
        if (particle.parentNode === beamsContainer) {
          beamsContainer.removeChild(particle);
        }
      }, 1500);
    }
  }
});
