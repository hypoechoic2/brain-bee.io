const dbName = 'BrainBeeDB';
const questionStore = 'questions';
let db;
let currentIndex = 0;
let score = 0;
let questions = [];
let incorrectQuestions = [];

// Load questions from JSONBin
const loadQuestionsFromJSONBin = async () => {
    const binID = '6767b0c0e41b4d34e4696b0e';
    const url = `https://api.jsonbin.io/v3/b/${binID}`;
    const headers = {
        'X-Master-Key': '$2a$10$wfKJ4PJCZ.LkUOcAajI1P.RYoG7H0v0lmypdP.XoCXBysXroY.8nW',
    };
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        questions = data.record;
        updateQuestionCounter();
        renderQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};

// Render current question
const renderQuestion = () => {
    if (currentIndex < questions.length) {
        const question = questions[currentIndex];
        document.getElementById('question').textContent = question.text;
        const choicesContainer = document.getElementById('choices');
        const explanationContainer = document.getElementById('explanation');

        choicesContainer.innerHTML = '';
        explanationContainer.innerHTML = '';

        question.choices.forEach(choice => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'choices';
            input.value = choice;
            
            // Add event listener for immediate feedback
            input.addEventListener('change', () => {
                checkAnswer(choice, question);
                document.getElementById('next-btn').disabled = false;
            });
            
            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${choice}`));
            choicesContainer.appendChild(label);
        });

        document.getElementById('next-btn').disabled = true;
    } else {
        currentIndex = 0;
        incorrectQuestions.length > 0 ? retryIncorrect() : alert('Completed all questions!');
    }
};

// Check answer
const checkAnswer = (selectedChoice, question) => {
    const explanationContainer = document.getElementById('explanation');
    const options = document.querySelectorAll('.choices label');

    // Remove any existing correct/incorrect classes
    options.forEach(option => option.classList.remove('correct', 'incorrect'));

    // Add appropriate classes to show correct/incorrect answers
    options.forEach(option => {
        const input = option.querySelector('input');
        const choiceText = option.textContent.trim();
        
        if (choiceText === question.correct) {
            option.classList.add('correct');
        } else if (choiceText === selectedChoice && selectedChoice !== question.correct) {
            option.classList.add('incorrect');
        }
    });

    // Update score and show explanation
    if (selectedChoice === question.correct) {
        score++;
        document.getElementById('score').textContent = score;
        explanationContainer.innerHTML = `
            <strong style="color: #22c55e">Correct!</strong><br>
            ${question.explanation}
        `;
    } else {
        explanationContainer.innerHTML = `
            <strong style="color: #ef4444">Incorrect!</strong><br>
            The correct answer is: <strong>${question.correct}</strong><br>
            ${question.explanation}
        `;
        incorrectQuestions.push(question);
    }

    // Disable all radio buttons after selection
    options.forEach(option => {
        const input = option.querySelector('input');
        if (input) input.disabled = true;
    });
};

// Retry incorrect questions
const retryIncorrect = () => {
    alert('Retrying incorrect questions.');
    questions = incorrectQuestions;
    incorrectQuestions = [];
    renderQuestion();
};

// Update question counter
const updateQuestionCounter = () => {
    const remainingQuestions = questions.length - currentIndex;
    document.getElementById('total-questions').textContent = `${remainingQuestions}/${questions.length}`;
};

// Initialize app
window.onload = () => {
    loadQuestionsFromJSONBin();
    document.getElementById('next-btn').onclick = () => {
        currentIndex++;
        updateQuestionCounter();
        renderQuestion();
    };
};