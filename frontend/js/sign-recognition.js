// Sign Recognition API Integration
const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
let startSigningBtn;
let conversionStatus;
let conversionResult;
let conversionPlaceholder;

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

  // Add event listener to the Start Signing button
  startSigningBtn.addEventListener("click", toggleSignRecognition);
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
    conversionResult.textContent = "Initializing camera...";
    startSigningBtn.style.display = "none";

    // Call the API to start recognition
    const response = await fetch(`${API_BASE_URL}/start_recognition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.status === "started" || data.status === "already_running") {
      // Update UI to show we're recording
      conversionStatus.textContent = "Recording";
      conversionResult.textContent = "Analyzing your signs...";

      // Start polling for results
      startResultPolling();

      // Show the "Stop" button
      startSigningBtn.textContent = "Stop Signing";
      startSigningBtn.style.display = "block";
    } else {
      throw new Error("Failed to start recognition");
    }
  } catch (error) {
    console.error("Error starting recognition:", error);
    // Reset UI on error
    isRecording = false;
    conversionStatus.textContent = "Error";
    conversionStatus.classList.remove("recording");
    conversionResult.textContent = "Failed to start sign recognition. Please try again.";
    startSigningBtn.textContent = "Try Again";
    startSigningBtn.style.display = "block";
  }
}

// Stop the sign recognition process
async function stopRecognition() {
  try {
    // Stop polling for results
    stopResultPolling();

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
    conversionResult.textContent = "Your camera feed will appear here";
    startSigningBtn.textContent = "Start Signing";
  } catch (error) {
    console.error("Error stopping recognition:", error);
  }
}

// Start polling for recognition results
function startResultPolling() {
  // Clear any existing interval
  stopResultPolling();

  // Poll for results every 500ms
  resultPollingInterval = setInterval(fetchResults, 500);
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
      conversionResult.textContent = latestResult;
    }
  } catch (error) {
    console.error("Error fetching results:", error);
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing sign recognition...");

  // Wait a bit to make sure all elements are loaded
  setTimeout(() => {
    initSignRecognition();
    console.log("Sign recognition initialized");
    console.log("Start Signing button:", document.getElementById("startSigningBtn"));
  }, 1000);
});
