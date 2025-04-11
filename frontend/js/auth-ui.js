// Authentication UI handler
document.addEventListener('DOMContentLoaded', function() {
  // Update UI based on authentication state
  function updateAuthUI() {
    const isAuthenticated = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();
    
    // Get all auth-related elements
    const authButtons = document.querySelectorAll('.auth-buttons');
    const userMenus = document.querySelectorAll('.user-menu');
    const userNameElements = document.querySelectorAll('.user-name');
    const authRequiredElements = document.querySelectorAll('.auth-required');
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    
    if (isAuthenticated && currentUser) {
      // User is logged in
      
      // Show user menu, hide auth buttons
      authButtons.forEach(el => el.classList.add('hidden'));
      userMenus.forEach(el => el.classList.remove('hidden'));
      
      // Update user name in UI
      userNameElements.forEach(el => {
        el.textContent = currentUser.name;
      });
      
      // Show auth-required elements
      authRequiredElements.forEach(el => {
        el.classList.remove('hidden');
      });
      
      // Hide guest-only elements
      guestOnlyElements.forEach(el => {
        el.classList.add('hidden');
      });
      
      // Show/hide admin elements based on role
      adminOnlyElements.forEach(el => {
        if (currentUser.role === 'admin') {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    } else {
      // User is not logged in
      
      // Hide user menu, show auth buttons
      authButtons.forEach(el => el.classList.remove('hidden'));
      userMenus.forEach(el => el.classList.add('hidden'));
      
      // Hide auth-required elements
      authRequiredElements.forEach(el => {
        el.classList.add('hidden');
      });
      
      // Show guest-only elements
      guestOnlyElements.forEach(el => {
        el.classList.remove('hidden');
      });
      
      // Hide admin elements
      adminOnlyElements.forEach(el => {
        el.classList.add('hidden');
      });
    }
  }
  
  // Handle logout button clicks
  const logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      AuthService.logout();
      updateAuthUI();
      
      // Redirect to home page after logout
      window.location.href = '/';
    });
  });
  
  // Check authentication on page load
  async function checkAuth() {
    try {
      // If we have a token, verify it and update user data
      if (AuthService.isAuthenticated()) {
        const isValid = await AuthService.verifyToken();
        
        if (isValid) {
          // Token is valid, fetch latest user data
          await AuthService.fetchCurrentUser();
        } else {
          // Token is invalid, log out
          AuthService.logout();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, clear auth data
      AuthService.logout();
    } finally {
      // Update UI regardless of outcome
      updateAuthUI();
    }
  }
  
  // Initialize
  checkAuth();
});
