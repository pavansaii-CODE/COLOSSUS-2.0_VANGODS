/**
 * SignLearn Quiz Generator
 * Uses Google's Gemini API to generate sign language quizzes
 */

// Gemini API key
const GEMINI_API_KEY = "AIzaSyCNqfaemH5KvajAprlU-UFIMxpIWnZA9Bw"; // Gemini API key for generating quizzes
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Form elements
  const quizGeneratorForm = document.getElementById('quizGeneratorForm');
  const generateQuizBtn = document.getElementById('generateQuizBtn');
  const quizTopicSelect = document.getElementById('quizTopic');
  const difficultyLevelSelect = document.getElementById('difficultyLevel');
  const questionCountSelect = document.getElementById('questionCount');
  const quizFormatSelect = document.getElementById('quizFormat');

  // Quiz content elements
  const quizContentSection = document.getElementById('quizContentSection');
  const quizTitle = document.getElementById('quizTitle');
  const quizDescription = document.getElementById('quizDescription');
  const quizQuestionContainer = document.getElementById('quizQuestionContainer');
  const currentQuestionNum = document.getElementById('currentQuestionNum');
  const totalQuestions = document.getElementById('totalQuestions');
  const progressFill = document.getElementById('progressFill');
  const prevQuestionBtn = document.getElementById('prevQuestionBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const submitQuizBtn = document.getElementById('submitQuizBtn');

  // Results elements
  const quizResultsSection = document.getElementById('quizResultsSection');
  const scorePercentage = document.getElementById('scorePercentage');
  const scoreCircleFill = document.getElementById('scoreCircleFill');
  const correctAnswers = document.getElementById('correctAnswers');
  const totalQuestionsResult = document.getElementById('totalQuestionsResult');
  const timeTaken = document.getElementById('timeTaken');
  const quizFeedback = document.getElementById('quizFeedback');
  const reviewAnswersBtn = document.getElementById('reviewAnswersBtn');
  const newQuizBtn = document.getElementById('newQuizBtn');
  const shareResultsBtn = document.getElementById('shareResultsBtn');

  // Review elements
  const answerReviewSection = document.getElementById('answerReviewSection');
  const answerReviewList = document.getElementById('answerReviewList');
  const backToResultsBtn = document.getElementById('backToResultsBtn');
  const practiceWeakAreasBtn = document.getElementById('practiceWeakAreasBtn');

  // Quiz state
  let quizData = null;
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let quizStartTime = null;
  let quizEndTime = null;

  // Event listeners
  if (quizGeneratorForm) {
    quizGeneratorForm.addEventListener('submit', handleQuizGeneration);
  }

  if (prevQuestionBtn) {
    prevQuestionBtn.addEventListener('click', showPreviousQuestion);
  }

  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', showNextQuestion);
  }

  if (submitQuizBtn) {
    submitQuizBtn.addEventListener('click', submitQuiz);
  }

  if (reviewAnswersBtn) {
    reviewAnswersBtn.addEventListener('click', showAnswerReview);
  }

  if (newQuizBtn) {
    newQuizBtn.addEventListener('click', resetQuiz);
  }

  if (backToResultsBtn) {
    backToResultsBtn.addEventListener('click', showResults);
  }

  if (practiceWeakAreasBtn) {
    practiceWeakAreasBtn.addEventListener('click', practiceWeakAreas);
  }

  if (shareResultsBtn) {
    shareResultsBtn.addEventListener('click', shareResults);
  }

  // Set current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  /**
   * Handles the quiz generation form submission
   * @param {Event} event - The form submission event
   */
  async function handleQuizGeneration(event) {
    event.preventDefault();

    // Show loading state
    generateQuizBtn.disabled = true;
    generateQuizBtn.querySelector('.btn-text').textContent = 'Generating Quiz...';
    generateQuizBtn.querySelector('.btn-loader').classList.remove('hidden');

    // Get form values
    const topic = quizTopicSelect.value;
    const difficulty = difficultyLevelSelect.value;
    const questionCount = parseInt(questionCountSelect.value);
    const format = quizFormatSelect.value;

    try {
      // Generate quiz using Gemini API
      quizData = await generateQuizWithGemini(topic, difficulty, questionCount, format);

      // Initialize quiz state
      currentQuestionIndex = 0;
      userAnswers = Array(quizData.questions.length).fill(null);
      quizStartTime = new Date();

      // Update UI
      updateQuizHeader();
      showCurrentQuestion();

      // Show quiz content section
      quizGeneratorForm.closest('section').classList.add('hidden');
      quizContentSection.classList.remove('hidden');

      // Scroll to quiz content
      quizContentSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error generating quiz:', error);

      // Provide more specific error messages to the user
      if (error.message.includes('API request failed')) {
        alert(`Failed to connect to the Gemini API: ${error.message}. Please check your internet connection and try again.`);
      } else if (error.message.includes('parse')) {
        alert('The AI generated an invalid response. Using fallback quiz data instead.');
        // Use mock data as fallback
        quizData = getMockQuizData(topic, difficulty, questionCount, format);
        // Continue with the quiz using mock data
        currentQuestionIndex = 0;
        userAnswers = Array(quizData.questions.length).fill(null);
        quizStartTime = new Date();

        // Update UI
        updateQuizHeader();
        showCurrentQuestion();

        // Show quiz content section
        quizGeneratorForm.closest('section').classList.add('hidden');
        quizContentSection.classList.remove('hidden');

        // Scroll to quiz content
        quizContentSection.scrollIntoView({ behavior: 'smooth' });
        return; // Skip the finally block since we're handling UI updates here
      } else {
        alert('Failed to generate quiz. Please try again.');
      }
    } finally {
      // Reset button state
      generateQuizBtn.disabled = false;
      generateQuizBtn.querySelector('.btn-text').textContent = 'Generate Quiz';
      generateQuizBtn.querySelector('.btn-loader').classList.add('hidden');
    }
  }

  /**
   * Generates a quiz using the Gemini API
   * @param {string} topic - The quiz topic
   * @param {string} difficulty - The difficulty level
   * @param {number} questionCount - The number of questions
   * @param {string} format - The quiz format
   * @returns {Object} The generated quiz data
   */
  async function generateQuizWithGemini(topic, difficulty, questionCount, format) {
    // Create prompt for Gemini
    const prompt = `Generate a comprehensive sign language quiz with the following parameters:
    - Topic: ${topic}
    - Difficulty: ${difficulty}
    - Number of questions: ${questionCount}
    - Format: ${format}

    Please structure your response as a JSON object with the following format:
    {
      "title": "Quiz title",
      "description": "Brief description of the quiz",
      "questions": [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // Index of the correct answer
          "explanation": "Explanation of the correct answer"
        },
        // More questions...
      ]
    }

    QUIZ CONTENT GUIDELINES:
    - Focus specifically on American Sign Language (ASL) for the selected topic
    - Include questions about hand shapes, movements, and proper signing techniques
    - For beginner difficulty: focus on basic signs, alphabet, and simple vocabulary
    - For intermediate difficulty: include common phrases, grammar rules, and sentence structure
    - For advanced difficulty: cover complex expressions, cultural aspects, and nuanced meanings
    - Include visual descriptions of signs where appropriate (e.g., "The sign for 'thank you' involves touching your lips and moving your flat hand forward")
    - Add questions about proper hand positioning, facial expressions, and non-manual markers
    - Include some questions about Deaf culture and history where relevant

    QUESTION FORMAT GUIDELINES:
    - For true/false questions, use only two options: ["True", "False"]
    - For matching questions, provide options as pairs to match
    - For multiple-choice, ensure one clearly correct answer and plausible distractors
    - Include detailed explanations that teach the user about the correct sign and why other options are incorrect
    - Vary question types to test different aspects of sign language knowledge

    IMPORTANT: Respond ONLY with the JSON object, no additional text.`;

    try {
      // If using a mock for development/testing
      if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        console.warn("Using mock quiz data because no API key is provided");
        return getMockQuizData(topic, difficulty, questionCount, format);
      }

      // Make API request to Gemini
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      });

      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();

      if (!response.ok) {
        const errorData = await responseClone.json().catch(() => ({}));
        console.error('API request failed:', errorData);
        throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data); // Log the full response for debugging

      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Unexpected response structure from Gemini API');
      }

      // Extract the JSON from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('Generated text:', generatedText);

      // Sometimes the API might return text with markdown code blocks, let's clean that up
      let cleanedText = generatedText;
      // Remove markdown code blocks if present (```json ... ```)
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n([\s\S]*?)```/g, '$1');
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```([\s\S]*?)```/g, '$1');
      }
      // Remove any leading/trailing whitespace
      cleanedText = cleanedText.trim();

      // Parse the JSON
      try {
        const quizData = JSON.parse(cleanedText);
        return quizData;
      } catch (parseError) {
        console.error('Error parsing JSON from Gemini response:', parseError);
        console.log('Raw response:', generatedText);
        console.log('Cleaned response:', cleanedText);

        // If the response isn't valid JSON, try to extract JSON from it
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedJson = jsonMatch[0];
            console.log('Attempting to parse extracted JSON:', extractedJson);
            const extractedData = JSON.parse(extractedJson);
            return extractedData;
          } catch (extractError) {
            console.error('Failed to extract valid JSON:', extractError);
          }
        }

        // If we still can't parse it, try to create a valid quiz structure from the text
        try {
          console.log('Attempting to create a fallback quiz from the response');
          const fallbackQuiz = {
            title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Quiz`,
            description: `A quiz about ${topic} in sign language.`,
            questions: []
          };

          // Use mock data as a last resort
          return getMockQuizData(topic, difficulty, questionCount, format);
        } catch (fallbackError) {
          console.error('Failed to create fallback quiz:', fallbackError);
        }

        throw new Error('Failed to parse quiz data from API response');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Updates the quiz header with title and description
   */
  function updateQuizHeader() {
    if (quizData) {
      quizTitle.textContent = quizData.title;
      quizDescription.textContent = quizData.description;
      totalQuestions.textContent = quizData.questions.length;
    }
  }

  /**
   * Shows the current question
   */
  function showCurrentQuestion() {
    if (!quizData || !quizData.questions.length) return;

    // Update question number and progress
    currentQuestionNum.textContent = currentQuestionIndex + 1;
    const progressPercentage = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Get current question
    const question = quizData.questions[currentQuestionIndex];

    // Create question HTML
    let questionHTML = `
      <div class="quiz-question fade-in">
        <div class="question-text">${currentQuestionIndex + 1}. ${question.question}</div>
    `;

    // Add options based on question type
    if (question.options.length === 2 && question.options[0] === "True" && question.options[1] === "False") {
      // True/False question
      questionHTML += `
        <div class="true-false-options">
          <div class="true-false-option ${userAnswers[currentQuestionIndex] === 0 ? 'selected' : ''}" data-index="0">
            <span class="true-false-text">True</span>
          </div>
          <div class="true-false-option ${userAnswers[currentQuestionIndex] === 1 ? 'selected' : ''}" data-index="1">
            <span class="true-false-text">False</span>
          </div>
        </div>
      `;
    } else {
      // Multiple choice question
      questionHTML += '<div class="answer-options">';

      question.options.forEach((option, index) => {
        questionHTML += `
          <div class="answer-option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" data-index="${index}">
            <input type="radio" id="option${index}" name="question${currentQuestionIndex}" ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
            <label for="option${index}" class="answer-option-text">${option}</label>
          </div>
        `;
      });

      questionHTML += '</div>';
    }

    questionHTML += '</div>';

    // Update the question container
    quizQuestionContainer.innerHTML = questionHTML;

    // Add event listeners to options
    const options = quizQuestionContainer.querySelectorAll('.answer-option, .true-false-option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        const index = parseInt(option.dataset.index);
        selectAnswer(index);
      });
    });

    // Update navigation buttons
    prevQuestionBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === quizData.questions.length - 1) {
      nextQuestionBtn.classList.add('hidden');
      submitQuizBtn.classList.remove('hidden');
    } else {
      nextQuestionBtn.classList.remove('hidden');
      submitQuizBtn.classList.add('hidden');
    }
  }

  /**
   * Selects an answer for the current question
   * @param {number} answerIndex - The index of the selected answer
   */
  function selectAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;

    // Update UI to show selected answer
    const options = quizQuestionContainer.querySelectorAll('.answer-option, .true-false-option');
    options.forEach((option, index) => {
      if (index === answerIndex) {
        option.classList.add('selected');
        const radio = option.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      } else {
        option.classList.remove('selected');
        const radio = option.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      }
    });
  }

  /**
   * Shows the previous question
   */
  function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showCurrentQuestion();
    }
  }

  /**
   * Shows the next question
   */
  function showNextQuestion() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      currentQuestionIndex++;
      showCurrentQuestion();
    }
  }

  /**
   * Submits the quiz and shows results
   */
  function submitQuiz() {
    // Check if all questions are answered
    const unansweredCount = userAnswers.filter(answer => answer === null).length;

    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`)) {
        return;
      }
    }

    // Record end time
    quizEndTime = new Date();

    // Calculate score
    let correctCount = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quizData.questions[index].correctAnswer) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / quizData.questions.length) * 100);

    // Update results UI
    scorePercentage.textContent = `${scorePercent}%`;
    scoreCircleFill.setAttribute('stroke-dasharray', `${scorePercent}, 100`);
    correctAnswers.textContent = correctCount;
    totalQuestionsResult.textContent = quizData.questions.length;

    // Calculate time taken
    const timeDiff = Math.floor((quizEndTime - quizStartTime) / 1000); // in seconds
    const minutes = Math.floor(timeDiff / 60);
    const seconds = timeDiff % 60;
    timeTaken.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Generate feedback based on score
    let feedbackHTML = '';
    if (scorePercent >= 90) {
      feedbackHTML = `<p><strong>Excellent work!</strong> You've demonstrated an outstanding understanding of sign language. Keep up the great work!</p>`;
    } else if (scorePercent >= 70) {
      feedbackHTML = `<p><strong>Good job!</strong> You have a solid grasp of sign language concepts. With a bit more practice, you'll master these signs.</p>`;
    } else if (scorePercent >= 50) {
      feedbackHTML = `<p><strong>Nice effort!</strong> You're making progress with sign language. Focus on reviewing the questions you missed to improve your skills.</p>`;
    } else {
      feedbackHTML = `<p><strong>Keep practicing!</strong> Sign language takes time to learn. Review the material and try again to improve your understanding.</p>`;
    }

    quizFeedback.innerHTML = feedbackHTML;

    // Show results section
    quizContentSection.classList.add('hidden');
    quizResultsSection.classList.remove('hidden');

    // Scroll to results
    quizResultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Shows the answer review section
   */
  function showAnswerReview() {
    // Generate review HTML
    let reviewHTML = '';

    quizData.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      reviewHTML += `
        <div class="review-item">
          <div class="review-question">${index + 1}. ${question.question}</div>
          <div class="review-answers">
      `;

      question.options.forEach((option, optionIndex) => {
        const isUserSelected = userAnswer === optionIndex;
        const isCorrectAnswer = question.correctAnswer === optionIndex;

        let className = '';
        let iconHTML = '';

        if (isUserSelected) {
          className += ' user-selected';
          if (isCorrect) {
            className += ' correct';
            iconHTML = `<div class="review-answer-icon correct">✓</div>`;
          } else {
            className += ' incorrect';
            iconHTML = `<div class="review-answer-icon incorrect">✗</div>`;
          }
        } else if (isCorrectAnswer) {
          className += ' correct';
          iconHTML = `<div class="review-answer-icon correct">✓</div>`;
        }

        reviewHTML += `
          <div class="review-answer${className}">
            ${iconHTML}
            <div class="review-answer-text">${option}</div>
          </div>
        `;
      });

      reviewHTML += `
          </div>
          <div class="review-explanation">${question.explanation}</div>
        </div>
      `;
    });

    // Update review list
    answerReviewList.innerHTML = reviewHTML;

    // Show review section
    quizResultsSection.classList.add('hidden');
    answerReviewSection.classList.remove('hidden');

    // Scroll to review
    answerReviewSection.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Shows the results section
   */
  function showResults() {
    answerReviewSection.classList.add('hidden');
    quizResultsSection.classList.remove('hidden');
    quizResultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Resets the quiz to generate a new one
   */
  function resetQuiz() {
    // Reset state
    quizData = null;
    currentQuestionIndex = 0;
    userAnswers = [];
    quizStartTime = null;
    quizEndTime = null;

    // Reset UI
    quizResultsSection.classList.add('hidden');
    answerReviewSection.classList.add('hidden');
    quizGeneratorForm.closest('section').classList.remove('hidden');

    // Scroll to form
    quizGeneratorForm.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Redirects to practice page focusing on weak areas
   */
  function practiceWeakAreas() {
    // Identify weak areas
    const weakAreas = [];
    userAnswers.forEach((answer, index) => {
      if (answer !== quizData.questions[index].correctAnswer) {
        weakAreas.push(index);
      }
    });

    // Redirect to practice page with weak areas as query params
    if (weakAreas.length > 0) {
      const weakAreaQuestions = weakAreas.map(index => quizData.questions[index].question);
      const queryParams = new URLSearchParams();
      queryParams.append('practice', 'true');
      queryParams.append('questions', JSON.stringify(weakAreaQuestions));

      window.location.href = `/sign-recognition?${queryParams.toString()}`;
    } else {
      alert('Great job! You have no weak areas to practice.');
    }
  }

  /**
   * Shares quiz results
   */
  function shareResults() {
    // Calculate score
    let correctCount = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quizData.questions[index].correctAnswer) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / quizData.questions.length) * 100);

    // Create share text
    const shareText = `I scored ${scorePercent}% on the "${quizData.title}" quiz on SignLearn! #SignLanguage #Learning`;

    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'My SignLearn Quiz Results',
        text: shareText,
        url: window.location.href
      })
      .catch(error => {
        console.error('Error sharing:', error);
        fallbackShare(shareText);
      });
    } else {
      fallbackShare(shareText);
    }
  }

  /**
   * Fallback sharing method when Web Share API is not available
   * @param {string} text - The text to share
   */
  function fallbackShare(text) {
    // Create a temporary input element
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);

    // Select and copy the text
    input.select();
    document.execCommand('copy');

    // Remove the temporary element
    document.body.removeChild(input);

    // Notify the user
    alert('Result copied to clipboard! You can now paste it in your social media posts.');
  }

  /**
   * Gets mock quiz data for development/testing
   * @param {string} topic - The quiz topic
   * @param {string} difficulty - The difficulty level
   * @param {number} questionCount - The number of questions
   * @param {string} format - The quiz format
   * @returns {Object} Mock quiz data
   */
  function getMockQuizData(topic, difficulty, questionCount, format) {
    // Create a title based on the topic and difficulty
    const title = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${topic.charAt(0).toUpperCase() + topic.slice(1)} Sign Language Quiz`;

    // Create a description
    const description = `Test your knowledge of ${topic} sign language at the ${difficulty} level.`;

    // Create questions based on the topic
    let questions = [];

    // Sample questions for different topics
    const topicQuestions = {
      alphabet: [
        {
          question: "Which hand shape is used to sign the letter 'A' in American Sign Language?",
          options: ["Closed fist with thumb at the side", "Open palm with fingers spread", "Fist with index finger extended", "Fist with pinky finger extended"],
          correctAnswer: 0,
          explanation: "The letter 'A' in ASL is signed with a closed fist with the thumb positioned at the side of the fist."
        },
        {
          question: "In American Sign Language, the letters 'M', 'N', and 'T' all share what common characteristic?",
          options: ["They all use two hands", "They all involve movement", "They all use the same hand shape with different finger placements", "They all touch the face"],
          correctAnswer: 2,
          explanation: "The letters 'M', 'N', and 'T' all use the same basic hand shape (a fist) but with different finger placements or extensions."
        },
        {
          question: "True or False: In American Sign Language, the letter 'Z' is signed by drawing the shape of a Z in the air.",
          options: ["True", "False"],
          correctAnswer: 0,
          explanation: "True. The letter 'Z' in ASL is signed by drawing the shape of a Z in the air with the index finger."
        },
        {
          question: "Which letters in the ASL alphabet require movement rather than a static handshape?",
          options: ["A, B, C", "J, Z", "E, O, S", "P, Q, R"],
          correctAnswer: 1,
          explanation: "In the ASL alphabet, the letters J and Z require movement. J is signed by tracing the letter J in the air with the pinky finger, and Z is signed by tracing the letter Z in the air with the index finger."
        },
        {
          question: "What is the correct handshape for the letter 'E' in ASL?",
          options: [
            "Closed fist with thumb tucked under fingers",
            "Open hand with fingers spread",
            "Fist with thumb touching the side of the index finger",
            "Curved hand with fingertips touching the thumb"
          ],
          correctAnswer: 0,
          explanation: "The letter 'E' in ASL is signed with a closed fist where the thumb is tucked under the fingers (folded across the palm and covered by the fingers)."
        }
      ],
      numbers: [
        {
          question: "How do you sign the number '10' in American Sign Language?",
          options: ["Closed fist with thumb extended", "Open hand with fingers spread", "Shake an open hand", "Closed fist with thumb tapping on the side"],
          correctAnswer: 0,
          explanation: "The number '10' in ASL is signed with a closed fist with the thumb extended, sometimes with a slight shake."
        },
        {
          question: "In American Sign Language, numbers 1-5 are signed using which hand orientation?",
          options: ["Palm facing outward", "Palm facing inward", "Palm facing down", "Palm facing up"],
          correctAnswer: 0,
          explanation: "Numbers 1-5 in ASL are typically signed with the palm facing outward (away from the signer)."
        },
        {
          question: "How do you sign the number 6 in ASL?",
          options: [
            "Extend thumb and pinky finger only",
            "Extend all five fingers and thumb",
            "Extend pinky, ring, and middle fingers",
            "Make a fist with thumb extended"
          ],
          correctAnswer: 1,
          explanation: "The number 6 in ASL is signed by extending all five fingers and the thumb, with the palm facing outward. It's essentially showing all 6 digits."
        },
        {
          question: "What is the correct way to sign the number 25 in ASL?",
          options: [
            "Sign 2 and 5 separately",
            "Sign 20 and then 5",
            "Use a special combined sign for 25",
            "Show 2 fingers on one hand and 5 on the other simultaneously"
          ],
          correctAnswer: 1,
          explanation: "To sign 25 in ASL, you would sign 20 (making a handshape like a gun and moving it twice) and then sign 5 (showing 5 fingers with palm facing outward)."
        }
      ],
      greetings: [
        {
          question: "What is the correct sign for 'Hello' in American Sign Language?",
          options: ["Wave with palm facing outward", "Tap forehead twice", "Touch fingers to lips", "Salute with two fingers"],
          correctAnswer: 0,
          explanation: "The sign for 'Hello' in ASL is a wave with the palm facing outward, similar to a regular greeting wave."
        },
        {
          question: "How do you sign 'Thank you' in American Sign Language?",
          options: ["Touch chin then move hand outward", "Pat heart twice", "Touch lips then move hand forward", "Thumbs up gesture"],
          correctAnswer: 2,
          explanation: "To sign 'Thank you' in ASL, you touch your lips or chin with the fingertips of your flat hand, then move your hand forward and down in the direction of the person you're thanking."
        },
        {
          question: "What is the proper way to sign 'Nice to meet you' in ASL?",
          options: [
            "Point to your eye, then heart, then the person",
            "Shake hands with the person",
            "Sign 'nice' followed by 'meet' and point to the person",
            "Wave and smile at the person"
          ],
          correctAnswer: 2,
          explanation: "To sign 'Nice to meet you' in ASL, you sign 'nice' (by moving your dominant hand in a circular motion on your non-dominant palm), followed by 'meet' (bringing both index fingers together), and then point to the person you're addressing."
        },
        {
          question: "How do you sign 'Good morning' in ASL?",
          options: [
            "Sign 'good' and then 'morning'",
            "Wave and point to the sun",
            "Touch your forehead and then make a rising motion",
            "Sign 'hello' and then point to a watch"
          ],
          correctAnswer: 0,
          explanation: "To sign 'Good morning' in ASL, you simply sign 'good' (by placing your right hand flat on your lips and moving it forward and down) and then 'morning' (by forming a 'C' shape with your hand and moving it up in an arc, representing the rising sun)."
        }
      ],
      emotions: [
        {
          question: "How is 'happy' signed in American Sign Language?",
          options: [
            "Circular motion on the chest",
            "Both hands raised above the head",
            "Flat hands brushing up from the chest to the face",
            "Fingers brushing upward on both cheeks"
          ],
          correctAnswer: 3,
          explanation: "The sign for 'happy' in ASL involves placing both hands in front of your chest with fingers spread, then brushing them upward along both cheeks while smiling. The movement mimics a smile spreading across your face."
        },
        {
          question: "What is the correct way to sign 'angry' in ASL?",
          options: [
            "Claw-like hands moving downward from the face",
            "Fists pounding against each other",
            "Both hands making grabbing motions outward",
            "Fingers placed on the forehead and then exploding outward"
          ],
          correctAnswer: 0,
          explanation: "To sign 'angry' in ASL, you make claw-like hands in front of your face and pull them downward while showing an angry facial expression. The non-manual marker (facial expression) is crucial for this sign."
        },
        {
          question: "True or False: In ASL, facial expressions are optional when signing emotions.",
          options: ["True", "False"],
          correctAnswer: 1,
          explanation: "False. In ASL, facial expressions are not optional but are grammatically required components when signing emotions. The facial expression is as important as the hand movements and is considered a crucial non-manual marker in ASL grammar."
        },
        {
          question: "How do you sign 'love' in ASL?",
          options: [
            "Cross arms over chest",
            "Draw a heart shape in the air",
            "Cross hands over heart, then extend outward",
            "Touch heart with right hand"
          ],
          correctAnswer: 2,
          explanation: "To sign 'love' in ASL, you cross your arms or hands over your heart (with closed fists) and then extend them outward toward the person or thing you love. This represents love coming from your heart and extending to others."
        }
      ],
      family: [
        {
          question: "How do you sign 'mother' in ASL?",
          options: [
            "Tap chin with thumb of 5-hand",
            "Pat top of head twice",
            "Thumb of 5-hand taps on forehead",
            "Circle hand around face"
          ],
          correctAnswer: 0,
          explanation: "To sign 'mother' in ASL, you extend your hand with fingers spread (5-hand) and tap your thumb on your chin. This sign originated from the concept of a bonnet string being tied under the chin."
        },
        {
          question: "What is the sign for 'father' in ASL?",
          options: [
            "Tap chest twice with fist",
            "Tap forehead with thumb of 5-hand",
            "Draw a mustache with index finger",
            "Point to ring finger"
          ],
          correctAnswer: 1,
          explanation: "To sign 'father' in ASL, you extend your hand with fingers spread (5-hand) and tap your thumb on your forehead. This sign originated from the concept of a hat being tipped at the forehead."
        },
        {
          question: "How are the signs for 'brother' and 'sister' different in ASL?",
          options: [
            "They use completely different hand movements",
            "They use the same movement but different locations",
            "They use the same handshape but different movements",
            "They use the same movement but different handshapes"
          ],
          correctAnswer: 3,
          explanation: "In ASL, 'brother' and 'sister' use the same movement (the sign for 'same' made at the side of the body), but with different handshapes. 'Brother' uses a 'B' handshape (flat hand), while 'sister' uses an 'S' handshape (closed fist)."
        },
        {
          question: "What is the correct way to sign 'family' in ASL?",
          options: [
            "Circle both hands around each other",
            "Point to all fingers on one hand",
            "Join both hands in a circular motion",
            "Extend both arms outward with palms up"
          ],
          correctAnswer: 1,
          explanation: "To sign 'family' in ASL, you point to all the fingers on one hand with the index finger of your other hand, or circle your index finger around all fingers of your other hand. This represents all the members of a family being connected."
        }
      ]
    };

    // Default questions if topic not found
    const defaultQuestions = [
      {
        question: "Which of these is NOT one of the five parameters of a sign in American Sign Language?",
        options: ["Handshape", "Movement", "Location", "Timing", "Palm Orientation"],
        correctAnswer: 3,
        explanation: "The five parameters of a sign in ASL are handshape, movement, location, palm orientation, and non-manual markers (facial expressions). Timing is not one of the five parameters."
      },
      {
        question: "True or False: American Sign Language (ASL) is a direct translation of English.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation: "False. ASL is a complete, natural language with its own grammar, syntax, and vocabulary that is distinct from English. It is not a visual representation of English."
      },
      {
        question: "What is the correct way to ask a question in ASL?",
        options: [
          "Raise your voice at the end of the sentence",
          "Add a question mark sign at the end",
          "Use non-manual markers like raised eyebrows and a forward head tilt",
          "Point to the person you're asking"
        ],
        correctAnswer: 2,
        explanation: "In ASL, questions are typically indicated by non-manual markers, particularly raised eyebrows and a forward head tilt, along with appropriate facial expressions. These non-manual elements are essential grammatical components of ASL."
      },
      {
        question: "Which of these is a unique feature of ASL that distinguishes it from spoken languages?",
        options: [
          "It has no grammar rules",
          "It uses three-dimensional space as a grammatical element",
          "It can only express concrete concepts, not abstract ideas",
          "It must be signed with both hands"
        ],
        correctAnswer: 1,
        explanation: "ASL uses three-dimensional space grammatically. Signers establish people, places, and things in the signing space and refer back to them by pointing or directing signs toward those established locations. This spatial grammar is a unique feature of sign languages."
      },
      {
        question: "What is 'fingerspelling' in American Sign Language?",
        options: [
          "A game played by deaf children",
          "Using the ASL manual alphabet to spell out words letter by letter",
          "A technique for counting large numbers",
          "Signing very quickly with just the fingertips"
        ],
        correctAnswer: 1,
        explanation: "Fingerspelling is the process of using the ASL manual alphabet to spell out words letter by letter. It's commonly used for proper names, technical terms, or words that don't have established signs."
      }
    ];

    // Get questions for the selected topic or use default
    let availableQuestions = topicQuestions[topic] || defaultQuestions;

    // If we don't have enough questions, add some from the default set
    if (availableQuestions.length < questionCount) {
      availableQuestions = [...availableQuestions, ...defaultQuestions];
    }

    // Limit to the requested number of questions
    questions = availableQuestions.slice(0, questionCount);

    // Return the mock quiz data
    return {
      title,
      description,
      questions
    };
  }
});