// API endpoint for the Python backend
const PYTHON_API_URL = 'http://localhost:5001';

// SignRecognitionService for handling communication with the Python backend
const SignRecognitionService = {
    // Start the sign language recognition
    startRecognition: async () => {
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/start_recognition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to start recognition');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error starting recognition:', error);
            throw error;
        }
    },

    // Stop the sign language recognition
    stopRecognition: async () => {
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/stop_recognition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to stop recognition');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error stopping recognition:', error);
            throw error;
        }
    },

    // Get the latest recognition results
    getResults: async () => {
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/get_results`);

            if (!response.ok) {
                throw new Error('Failed to get recognition results');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting recognition results:', error);
            throw error;
        }
    },

    // Get the video stream URL
    getVideoStreamUrl: () => {
        return `${PYTHON_API_URL}/video_feed`;
    }
};

// Make the service available globally
window.SignRecognitionService = SignRecognitionService;
