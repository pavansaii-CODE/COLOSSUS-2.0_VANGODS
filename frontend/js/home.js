// Home page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile sidebar functionality
  const sidebarTrigger = document.getElementById('sidebarTrigger');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  
  if (sidebarTrigger && sidebar && sidebarClose) {
    // Open sidebar
    sidebarTrigger.addEventListener('click', function() {
      sidebar.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    });
    
    // Close sidebar
    sidebarClose.addEventListener('click', function() {
      sidebar.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
      if (sidebar.classList.contains('active') && 
          !sidebar.contains(event.target) && 
          !sidebarTrigger.contains(event.target)) {
        sidebar.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close sidebar if open
        if (sidebar && sidebar.classList.contains('active')) {
          sidebar.classList.remove('active');
          document.body.style.overflow = '';
        }
        
        // Scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Form submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const formValues = Object.fromEntries(formData.entries());
      
      // Simple validation
      if (!formValues.name || !formValues.email || !formValues.message) {
        alert('Please fill in all fields');
        return;
      }
      
      // Here you would normally send the data to a server
      console.log('Form submitted:', formValues);
      
      // Show success message
      alert('Thank you for your message! We will get back to you soon.');
      
      // Reset form
      contactForm.reset();
    });
  }
});
