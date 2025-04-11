// Sign Recognition API Integration with Video Streaming
const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
let startSigningBtn;
let conversionStatus;
let conversionResult;
let conversionPlaceholder;
let videoElement;

// State variables
let isRecording = false;
let resultPollingInterval = null;

// Initialize the sign recognition functionality
function initSignRecognition() {
  // Get DOM elements
  startSigningBtn = document.getElementById("startSigningBtn");
  conversionStatus = document.getElementById("conversionStatus");
  conversionResult = document.getElementById("conversionResult");
  conversionPlaceholder = document.getElementById("conversionPlaceholder");

  if (!startSigningBtn) {
    console.error("Start Signing button not found");
    return;
  }

  // Create video element for the webcam feed
  createVideoElement();

  // Remove the onclick attribute that was added for testing
  startSigningBtn.removeAttribute("onclick");

  // Add event listener to the Start Signing button
  startSigningBtn.addEventListener("click", toggleSignRecognition);

  // Make sure the Start Signing button is visible
  startSigningBtn.disabled = false;
  startSigningBtn.style.display = "block";
  startSigningBtn.style.position = "absolute";
  startSigningBtn.style.bottom = "20px";
  startSigningBtn.style.left = "50%";
  startSigningBtn.style.transform = "translateX(-50%)";
  startSigningBtn.style.zIndex = "20";
  startSigningBtn.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  console.log("Sign recognition initialized with video streaming");
}

// Create video element for the webcam feed
function createVideoElement() {
  // Check if the placeholder exists
  if (!conversionPlaceholder) {
    console.error("Conversion placeholder not found");
    return;
  }

  // Create iframe if it doesn't exist
  if (!document.getElementById("webcamFrame")) {
    console.log("Creating new webcam iframe");

    // Make sure the placeholder has position relative for proper sizing
    conversionPlaceholder.style.position = "relative";
    conversionPlaceholder.style.minHeight = "300px"; // Ensure minimum height

    // Create a container for the iframe
    const videoContainer = document.createElement("div");
    videoContainer.id = "webcamContainer";
    videoContainer.style.width = "100%";
    videoContainer.style.height = "100%";
    videoContainer.style.position = "absolute";
    videoContainer.style.top = "0";
    videoContainer.style.left = "0";
    videoContainer.style.display = "none"; // Initially hidden
    videoContainer.style.zIndex = "1"; // Place above other content
    videoContainer.style.overflow = "hidden"; // Prevent content overflow
    videoContainer.style.backgroundColor = "#000"; // Black background
    videoContainer.style.borderRadius = "var(--radius)";

    // Create the iframe for the webcam feed
    const iframe = document.createElement("iframe");
    iframe.id = "webcamFrame";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.allowFullscreen = true;
    iframe.allow = "camera *; microphone *";
    iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");

    // Store the iframe as the video element for consistency with existing code
    videoElement = iframe;

    // Add the iframe to the container
    videoContainer.appendChild(iframe);

    // Insert the video container at the beginning of the placeholder
    conversionPlaceholder.insertBefore(videoContainer, conversionPlaceholder.firstChild);

    // Add a loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "videoLoadingIndicator";
    loadingIndicator.style.position = "absolute";
    loadingIndicator.style.top = "50%";
    loadingIndicator.style.left = "50%";
    loadingIndicator.style.transform = "translate(-50%, -50%)";
    loadingIndicator.style.zIndex = "2";
    loadingIndicator.style.display = "none";
    loadingIndicator.innerHTML = `
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary); border-radius: 50%;
                animation: spin 1s linear infinite;"></div>
      <div style="color: white; margin-top: 10px; text-align: center;">Loading camera...</div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    videoContainer.appendChild(loadingIndicator);

    // Add a message for when the camera is disabled
    const cameraOffMessage = document.createElement("div");
    cameraOffMessage.id = "cameraOffMessage";
    cameraOffMessage.style.position = "absolute";
    cameraOffMessage.style.top = "50%";
    cameraOffMessage.style.left = "50%";
    cameraOffMessage.style.transform = "translate(-50%, -50%)";
    cameraOffMessage.style.color = "white";
    cameraOffMessage.style.textAlign = "center";
    cameraOffMessage.style.display = "none";
    cameraOffMessage.innerHTML = "Camera is disabled. Click 'Enable Camera' to start.";
    videoContainer.appendChild(cameraOffMessage);
  } else {
    console.log("Webcam iframe already exists, reusing it");
    videoElement = document.getElementById("webcamFrame");
    const videoContainer = document.getElementById("webcamContainer");
    if (videoContainer) {
      videoContainer.style.display = "none"; // Ensure it's hidden initially
    }
  }

  console.log("Video element created/found:", videoElement);
}

// Toggle sign recognition on/off
async function toggleSignRecognition() {
  if (!isRecording) {
    // Start recognition
    await startRecognition();
  } else {
    // Stop recognition
    await stopRecognition();
  }
}

// Start the sign recognition process
async function startRecognition() {
  try {
    // Update UI to show we're starting
    isRecording = true;
    conversionStatus.textContent = "Starting...";
    conversionStatus.classList.add("recording");
    conversionResult.textContent = "Opening sign recognition in a new tab...";

    // Disable button during initialization
    startSigningBtn.disabled = true;
    startSigningBtn.textContent = "Starting...";

    // Hide the video container since we're using a separate page
    const videoContainer = document.getElementById("webcamContainer");
    if (videoContainer) {
      videoContainer.style.display = "none";
    }

    // Open the sign recognition page in a new tab
    const baseUrl = window.location.href.split('/').slice(0, 3).join('/');
    const recognitionUrl = `${baseUrl}/sign_recognition.html?t=${new Date().getTime()}`;

    // Store the window reference to be able to close it later
    window.recognitionWindow = window.open(recognitionUrl, '_blank');

    if (window.recognitionWindow) {
      // Update UI to show the page is open
      conversionStatus.textContent = "Recognition Running in New Tab";
      conversionResult.innerHTML = `<span style="color: #4CAF50;">Sign recognition opened in a new tab!</span><br>Please check the new browser tab for sign recognition.`;

      // Style the result text for better visibility
      if (conversionResult) {
        conversionResult.style.position = "";
        conversionResult.style.textAlign = "center";
        conversionResult.style.fontSize = "18px";
        conversionResult.style.fontWeight = "bold";
        conversionResult.style.padding = "20px";
        conversionResult.style.color = "#333";
      }

      // Update button state
      startSigningBtn.textContent = "Close Recognition Tab";
      startSigningBtn.disabled = false;
      startSigningBtn.style.backgroundColor = "#ef4444"; // Red color for stop button

      // Add event listener to detect when the window is closed
      const checkWindowClosed = setInterval(() => {
        if (window.recognitionWindow && window.recognitionWindow.closed) {
          clearInterval(checkWindowClosed);
          stopRecognition();
        }
      }, 1000);
    } else {
      throw new Error("Failed to open recognition tab. Please check your popup blocker settings.");
    }
  } catch (error) {
    console.error("Error starting recognition:", error);
    // Reset UI on error
    isRecording = false;
    conversionStatus.textContent = "Error";
    conversionStatus.classList.remove("recording");
    conversionResult.textContent = "Failed to start sign recognition. Please try again.";
    startSigningBtn.textContent = "Start Signing";
    startSigningBtn.disabled = false;
    startSigningBtn.style.backgroundColor = ""; // Reset to default color

    // Hide the video container on error
    const videoContainer = document.getElementById("webcamContainer");
    if (videoContainer) {
      videoContainer.style.display = "none";
    }
  }
}

// Stop the sign recognition process
async function stopRecognition() {
  try {
    // Disable the button during stopping
    startSigningBtn.disabled = true;
    startSigningBtn.textContent = "Stopping...";

    // Stop polling for results
    stopResultPolling();

    // Close the recognition window if it's open
    if (window.recognitionWindow && !window.recognitionWindow.closed) {
      window.recognitionWindow.close();
    }

    // Call the API to stop recognition
    const response = await fetch(`${API_BASE_URL}/stop_recognition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Reset UI
    isRecording = false;
    conversionStatus.classList.remove("recording");
    conversionStatus.textContent = "";

    // Reset the result text styling
    if (conversionResult) {
      conversionResult.style.position = "";
      conversionResult.style.bottom = "";
      conversionResult.style.left = "";
      conversionResult.style.right = "";
      conversionResult.style.background = "";
      conversionResult.style.color = "";
      conversionResult.style.padding = "";
      conversionResult.style.borderRadius = "";
      conversionResult.style.zIndex = "";
      conversionResult.style.textAlign = "";
      conversionResult.style.fontSize = "";
      conversionResult.style.fontWeight = "";
      conversionResult.textContent = "Click 'Start Signing' to open sign recognition in a new tab";
    }

    // Reset button
    startSigningBtn.textContent = "Start Signing";
    startSigningBtn.disabled = false;
    startSigningBtn.style.backgroundColor = ""; // Reset to default color

    // Call the API to explicitly release camera resources
    try {
      await fetch(`${API_BASE_URL}/disable_camera`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (apiError) {
      console.error("Error disabling camera on server:", apiError);
    }
  } catch (error) {
    console.error("Error stopping recognition:", error);
    // Make sure button is re-enabled even on error
    startSigningBtn.disabled = false;
    startSigningBtn.textContent = "Start Signing";
    startSigningBtn.style.backgroundColor = ""; // Reset to default color
    conversionResult.textContent = "Failed to stop recognition. The tab may have already been closed.";
  }
}

// Start polling for recognition results
function startResultPolling() {
  // Clear any existing interval
  stopResultPolling();

  // Poll for results every 300ms for better responsiveness
  resultPollingInterval = setInterval(fetchResults, 300);

  // Fetch results immediately
  fetchResults();
}

// Stop polling for recognition results
function stopResultPolling() {
  if (resultPollingInterval) {
    clearInterval(resultPollingInterval);
    resultPollingInterval = null;
  }
}

// Fetch the latest recognition results from the API
async function fetchResults() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_results`);
    const data = await response.json();

    // Check if we're still recognizing
    if (!data.is_recognizing) {
      // If the backend stopped for some reason, update our state
      if (isRecording) {
        stopRecognition();
      }
      return;
    }

    // Update the UI with the latest results
    if (data.results && data.results.length > 0) {
      // Display the most recent result
      const latestResult = data.results[data.results.length - 1];

      // Make sure the result is visible
      conversionResult.style.position = "absolute";
      conversionResult.style.bottom = "10px";
      conversionResult.style.left = "0";
      conversionResult.style.right = "0";
      conversionResult.style.background = "rgba(0, 0, 0, 0.7)";
      conversionResult.style.color = "white";
      conversionResult.style.padding = "10px";
      conversionResult.style.borderRadius = "0 0 var(--radius) var(--radius)";
      conversionResult.style.zIndex = "10";
      conversionResult.style.textAlign = "center";
      conversionResult.style.fontSize = "24px";
      conversionResult.style.fontWeight = "bold";

      // Set the text content with a highlight effect
      conversionResult.innerHTML = `<span style="color: #4CAF50;">Recognized Sign:</span> ${latestResult}`;

      // Add a subtle animation to draw attention to new results
      conversionResult.style.animation = "pulse 1s";
      setTimeout(() => {
        conversionResult.style.animation = "";
      }, 1000);

      // Add a style for the pulse animation if it doesn't exist
      if (!document.getElementById('pulseAnimation')) {
        const style = document.createElement('style');
        style.id = 'pulseAnimation';
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }

      // Log for debugging
      console.log("Recognized sign:", latestResult);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
  }
}



// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing sign recognition with video streaming...");

  // Wait a bit to make sure all elements are loaded
  setTimeout(() => {
    initSignRecognition();
  }, 1000);
});
