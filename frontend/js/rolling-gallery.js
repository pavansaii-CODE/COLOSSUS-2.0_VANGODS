// Rolling Gallery Component
document.addEventListener('DOMContentLoaded', function() {
  // Image URLs for the gallery - sign language related images
  const IMGS = [
    "https://images.unsplash.com/photo-1531325082793-ca7c9db6a4c1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Sign language hands
    "https://images.unsplash.com/photo-1508847154043-3dad2d404028?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Hands communicating
    "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2002&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Sign language teaching
    "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Online learning
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Group learning
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Diverse communication
    "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Inclusive education
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Hand gestures
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Communication
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Diverse learning
  ];

  // Initialize the gallery
  initRollingGallery(document.getElementById('rolling-gallery'), IMGS);
});

function initRollingGallery(container, images) {
  if (!container) return;

  // Configuration
  const isScreenSizeSm = window.innerWidth <= 640;
  const itemWidth = 280; // Width of each image
  const itemMargin = 40; // Margin between items (increased gap)
  const visibleItems = isScreenSizeSm ? 1 : 3; // Number of visible items
  const slideAmount = itemWidth + itemMargin; // Amount to slide each time

  // Add a title to the gallery
  const galleryTitle = document.createElement('h3');
  galleryTitle.className = 'gallery-title';
  galleryTitle.textContent = 'Sign Language in Action';
  galleryTitle.style.textAlign = 'center';
  galleryTitle.style.marginBottom = '1rem';
  galleryTitle.style.color = 'var(--primary)';
  container.parentNode.insertBefore(galleryTitle, container);

  // Create gallery elements
  const galleryContent = document.createElement('div');
  galleryContent.className = 'gallery-content';

  const galleryTrack = document.createElement('div');
  galleryTrack.className = 'gallery-track';
  galleryTrack.style.transform = 'translateX(0)';

  // Create gradient overlays
  const leftGradient = document.createElement('div');
  leftGradient.className = 'gallery-gradient gallery-gradient-left';

  const rightGradient = document.createElement('div');
  rightGradient.className = 'gallery-gradient gallery-gradient-right';

  // Add images to the track
  images.forEach((url, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    if (i === 0) item.classList.add('active');

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'gallery';
    img.className = 'gallery-img';

    item.appendChild(img);
    galleryTrack.appendChild(item);
  });

  // Add elements to container
  galleryContent.appendChild(galleryTrack);
  container.appendChild(leftGradient);
  container.appendChild(rightGradient);
  container.appendChild(galleryContent);

  // Drag functionality
  let isDragging = false;
  let startX = 0;
  let startPosition = 0;
  let currentPosition = 0;
  let autoplayInterval = null;
  let currentIndex = 0;

  // Start autoplay
  startAutoplay();

  // Event listeners for drag
  galleryTrack.addEventListener('mousedown', handleDragStart);
  galleryTrack.addEventListener('touchstart', handleDragStart, { passive: true });

  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('touchmove', handleDragMove, { passive: true });

  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('touchend', handleDragEnd);

  // Pause on hover
  galleryTrack.addEventListener('mouseenter', () => {
    stopAutoplay();
  });

  galleryTrack.addEventListener('mouseleave', () => {
    startAutoplay();
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    const newIsScreenSizeSm = window.innerWidth <= 640;
    if (newIsScreenSizeSm !== isScreenSizeSm) {
      // Reload the gallery if screen size category changes
      location.reload();
    }
  });

  function handleDragStart(e) {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startPosition = currentPosition;
    stopAutoplay();

    galleryTrack.style.transition = 'none';
    galleryTrack.style.cursor = 'grabbing';
  }

  function handleDragMove(e) {
    if (!isDragging) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - startX;

    // Calculate new position based on drag distance
    const newPosition = startPosition + deltaX;
    currentPosition = newPosition;

    // Apply the translation
    galleryTrack.style.transform = `translateX(${newPosition}px)`;
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    // Snap to nearest item
    const itemCount = images.length;
    const maxPosition = 0;
    const minPosition = -((itemCount - visibleItems) * slideAmount);

    // If dragged beyond the start (left edge)
    if (currentPosition > maxPosition) {
      currentPosition = maxPosition;
      currentIndex = 0;
    }
    // If dragged beyond the end (right edge)
    else if (currentPosition < minPosition) {
      currentPosition = maxPosition; // Loop back to start
      currentIndex = 0;

      // Apply quick reset without animation
      galleryTrack.style.transition = 'none';
      galleryTrack.style.transform = `translateX(${currentPosition}px)`;
      galleryTrack.offsetHeight; // Force reflow
    }
    else {
      // Calculate the nearest item index
      let nearestIndex = Math.round(-currentPosition / slideAmount);
      nearestIndex = Math.max(0, Math.min(nearestIndex, itemCount - visibleItems));

      // Update current position and index
      currentPosition = -nearestIndex * slideAmount;
      currentIndex = nearestIndex;
    }

    // Apply smooth transition to snap position
    galleryTrack.style.transition = 'transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)';
    galleryTrack.style.transform = `translateX(${currentPosition}px)`;
    galleryTrack.style.cursor = 'grab';

    // Update active items
    updateActiveItems();

    // Start autoplay again after a short delay
    setTimeout(startAutoplay, 2000);
  }

  function startAutoplay() {
    if (autoplayInterval) return;

    autoplayInterval = setInterval(() => {
      // Move to next item
      currentIndex++;

      // If we've reached the end, loop back to the beginning with a quick reset
      if (currentIndex >= images.length - visibleItems + 1) {
        // First complete the animation to the last position
        currentPosition = -(images.length - visibleItems) * slideAmount;
        galleryTrack.style.transition = 'transform 0.8s ease';
        galleryTrack.style.transform = `translateX(${currentPosition}px)`;

        // Then after the animation completes, quickly reset to the beginning without animation
        setTimeout(() => {
          currentIndex = 0;
          currentPosition = 0;
          galleryTrack.style.transition = 'none';
          galleryTrack.style.transform = 'translateX(0)';

          // Force a reflow to ensure the transition is disabled
          galleryTrack.offsetHeight;

          // Update active items for the new position
          updateActiveItems();
        }, 800);

        return;
      }

      // Normal case - just move to the next item
      currentPosition = -currentIndex * slideAmount;

      // Apply smooth transition
      galleryTrack.style.transition = 'transform 0.8s ease';
      galleryTrack.style.transform = `translateX(${currentPosition}px)`;

      // Update active state for items
      updateActiveItems();
    }, 3000);
  }

  function updateActiveItems() {
    // Find which item is currently in view
    const items = galleryTrack.querySelectorAll('.gallery-item');

    items.forEach((item, index) => {
      if (index >= currentIndex && index < currentIndex + visibleItems) {
        item.classList.add('active');
        // Make the middle item more prominent if there are multiple visible items
        if (visibleItems > 1 && index === currentIndex + Math.floor(visibleItems / 2)) {
          item.classList.add('center-active');
        } else {
          item.classList.remove('center-active');
        }
      } else {
        item.classList.remove('active');
        item.classList.remove('center-active');
      }
    });
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }
}
