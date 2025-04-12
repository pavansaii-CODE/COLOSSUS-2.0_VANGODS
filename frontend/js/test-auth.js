/**
 * Test Authentication Script
 * This script provides test login/logout functionality for demonstration purposes
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add test login/logout buttons to the footer for demonstration
  const footer = document.querySelector('.footer-bottom');
  
  if (footer) {
    const testAuthContainer = document.createElement('div');
    testAuthContainer.className = 'test-auth-container';
    testAuthContainer.style.marginTop = '20px';
    testAuthContainer.style.textAlign = 'center';
    testAuthContainer.style.padding = '10px';
    testAuthContainer.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
    
    testAuthContainer.innerHTML = `
      <p style="margin-bottom: 10px; color: #94a3b8; font-size: 0.9rem;">Test Authentication (Demo Only)</p>
      <div class="test-auth-buttons">
        <button id="testLoginBtn" class="btn btn-sm btn-outline" style="margin-right: 10px;">Test Login</button>
        <button id="testLoginAdminBtn" class="btn btn-sm btn-outline" style="margin-right: 10px;">Test Login as Admin</button>
        <button id="testLogoutBtn" class="btn btn-sm btn-outline">Test Logout</button>
      </div>
    `;
    
    footer.appendChild(testAuthContainer);
    
    // Add event listeners to the test buttons
    document.getElementById('testLoginBtn').addEventListener('click', function() {
      // Create a mock user
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };
      
      // Store mock data in localStorage
      localStorage.setItem('token', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update UI
      if (typeof updateAuthUI === 'function') {
        updateAuthUI();
      } else {
        window.location.reload();
      }
      
      console.log('Test login successful');
    });
    
    document.getElementById('testLoginAdminBtn').addEventListener('click', function() {
      // Create a mock admin user
      const mockAdmin = {
        id: '456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
      
      // Store mock data in localStorage
      localStorage.setItem('token', 'mock-token-456');
      localStorage.setItem('user', JSON.stringify(mockAdmin));
      
      // Update UI
      if (typeof updateAuthUI === 'function') {
        updateAuthUI();
      } else {
        window.location.reload();
      }
      
      console.log('Test admin login successful');
    });
    
    document.getElementById('testLogoutBtn').addEventListener('click', function() {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update UI
      if (typeof updateAuthUI === 'function') {
        updateAuthUI();
      } else {
        window.location.reload();
      }
      
      console.log('Test logout successful');
    });
  }
});
