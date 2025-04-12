/**
 * Features Animation Script
 * Handles the animation of feature cards when they come into view
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add data-number attributes to feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.setAttribute('data-number', `0${index + 1}`);
  });
  
  // Function to check if an element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
      rect.bottom >= 0
    );
  }
  
  // Function to handle scroll animation
  function handleScrollAnimation() {
    featureCards.forEach(card => {
      if (isInViewport(card)) {
        card.classList.add('animate');
      }
    });
  }
  
  // Initial check on page load
  handleScrollAnimation();
  
  // Check on scroll
  window.addEventListener('scroll', handleScrollAnimation);
});
