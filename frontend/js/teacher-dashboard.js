document.addEventListener('DOMContentLoaded', () => {
    let questionCount = 1;
    const createTestLink = document.getElementById('create-test-link');
    const createTestSection = document.getElementById('create-test-section');
    const createTestForm = document.getElementById('create-test-form');
    const addQuestionButton = document.getElementById('add-question-button');
    const questionsContainer = document.getElementById('questions-container');
    const disciplineSelect = document.getElementById('create-discipline-select');
    const addDisciplineLink = document.getElementById('add-discipline-link');
    const addDisciplineSection = document.getElementById('add-discipline-section');
    const addDisciplineForm = document.getElementById('add-discipline-form');
    const disciplineNameInput = document.getElementById('discipline-name');
   
  addDisciplineLink.addEventListener('click', () => {
        
        hideAllSections();
        addDisciplineSection.style.display = 'block';
    });
    const hideAllSections = () => {
        addDisciplineSection.style.display = 'none';
        createTestSection.style.display = 'none';
    };

    const resetForm = () => {
        createTestForm.reset();
        questionsContainer.innerHTML = '';
        questionCount = 1;
    };

    const populateDisciplines = async () => {
        try {
            const response = await fetch('/api/disciplines');
            if (!response.ok) throw new Error(`Failed to fetch disciplines: ${response.statusText}`);
            const disciplines = await response.json();
            disciplineSelect.innerHTML = '<option value="">Select Discipline</option>';
            disciplines.forEach((discipline) => {
                const option = document.createElement('option');
                option.value = discipline._id;
                option.textContent = discipline.name;
                disciplineSelect.appendChild(option);
            });
            console.log('Disciplines fetched:', disciplines);
        } catch (error) {
            console.error('Error fetching disciplines:', error);
        }
    };

    createTestLink.addEventListener('click', () => {
        
        hideAllSections();
        createTestSection.style.display = 'block';
        populateDisciplines();
    });

    addQuestionButton.addEventListener('click', () => {
        questionCount++;
        const questionGroup = document.createElement('div');
        questionGroup.classList.add('question-group');
        questionGroup.innerHTML = `
            <label for="question-${questionCount}">Question ${questionCount}:</label>
            <textarea id="question-${questionCount}" placeholder="Enter question text" required></textarea>
            <label>Answers:</label>
            <div class="answers-container">
                <div class="answer-group">
                    <textarea id="answer-${questionCount}-1" placeholder="Enter answer" required></textarea>
                    <input type="radio" name="correct-answer-${questionCount}" id="correct-${questionCount}-1" class="correct-answer">
                    <label for="correct-${questionCount}-1">Correct</label>
                </div>
                <div class="answer-group">
                    <textarea id="answer-${questionCount}-2" placeholder="Enter answer" required></textarea>
                    <input type="radio" name="correct-answer-${questionCount}" id="correct-${questionCount}-2" class="correct-answer">
                    <label for="correct-${questionCount}-2">Correct</label>
                </div>
            </div>
            <button type="button" class="add-answer-button" onclick="addAnswer(${questionCount})">Add Another Answer</button>
            <button type="button" class="delete-question-button" onclick="deleteQuestion(${questionCount})">Delete Question</button>
        `;
        questionsContainer.appendChild(questionGroup);
    });

    window.addAnswer = (questionNumber) => {
        const answersContainer = document.querySelector(`#question-${questionNumber}`).closest('.question-group').querySelector('.answers-container');
        const answerCount = answersContainer.querySelectorAll('.answer-group').length + 1;
        const answerGroup = document.createElement('div');
        answerGroup.classList.add('answer-group');
        answerGroup.innerHTML = `
            <textarea id="answer-${questionNumber}-${answerCount}" placeholder="Enter answer" required></textarea>
            <input type="radio" name="correct-answer-${questionNumber}" id="correct-${questionNumber}-${answerCount}" class="correct-answer">
            <label for="correct-${questionNumber}-${answerCount}">Correct</label>
        `;
        answersContainer.appendChild(answerGroup);
    };

    window.deleteQuestion = (questionNumber) => {
        const questionGroup = document.getElementById(`question-${questionNumber}`).closest('.question-group');
        questionGroup.remove();
    };

    createTestForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const testNameElement = document.getElementById('new-test-name');
        const testName = testNameElement.value.trim();
    
        if (!testName) {
            alert('Please enter a test name.');
            return;
        }
    
        const disciplineSelect = document.getElementById('create-discipline-select');
        const disciplineId = disciplineSelect.value;
    
        if (!disciplineId) {
            alert('Please select a discipline.');
            return;
        }
    
        const questions = [];
        for (let i = 1; i <= questionCount; i++) {
            const questionText = document.getElementById(`question-${i}`).value.trim();
            const answers = [];
            let hasCorrectAnswer = false;
    
            const answerGroups = document.querySelectorAll(`#question-${i} ~ .answers-container .answer-group`);
            answerGroups.forEach((answerGroup, index) => {
                const answerText = document.getElementById(`answer-${i}-${index + 1}`).value.trim();
                const isCorrect = document.getElementById(`correct-${i}-${index + 1}`).checked;
    
                if (answerText) {
                    answers.push({ text: answerText, isCorrect });
                    if (isCorrect) hasCorrectAnswer = true;
                }
            });
    
            if (!questionText || answers.length === 0 || !hasCorrectAnswer) {
                alert(`Question ${i} is incomplete or missing a correct answer.`);
                return;
            }
    
            questions.push({ text: questionText, options: answers });
        }
    
        const testData = { name: testName, discipline: disciplineId, questions };
    
        try {
            const response = await fetch('/api/tests/creates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData),
            });
    
            if (response.ok) {
                alert('Test created successfully!');
                createTestForm.reset();
            } else {
                const errorData = await response.json();
                console.error('Error response from server:', errorData);
                alert(`Error creating test: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating test:', error);
            alert('Error creating test. Please try again later.');
        }
    });
    const fetchAndDisplayTests = async () => {
    const testListContainer = document.getElementById('test-list');
    testListContainer.innerHTML = ''; 

    try {
        console.log('Fetching all tests...');
        const response = await fetch('/api/tests');
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Error fetching tests:', errorData || 'Non-JSON response received');
            alert(`Error: ${errorData?.message || 'Failed to fetch tests'}`);
            return;
        }

        const tests = await response.json();
        console.log('Fetched tests:', tests);

        if (!tests || tests.length === 0) {
            testListContainer.innerHTML = '<p>No tests available.</p>';
            return;
        }

        tests.forEach((test) => {
            const testDiv = document.createElement('div');
            testDiv.classList.add('test-item');
            testDiv.style.border = '1px solid #ccc';
            testDiv.style.borderRadius = '5px';
            testDiv.style.padding = '10px';
            testDiv.style.marginBottom = '10px';
            testDiv.style.backgroundColor = '#f9f9f9';

            testDiv.innerHTML = `
                <p><strong>Test Name:</strong> ${test.name}</p>
                <p><strong>Discipline:</strong> ${test.discipline?.name || 'Unknown Discipline'}</p>
                <p><strong>Total Questions:</strong> ${test.questions?.length || 0}</p>
                <button class="delete-test-button" data-test-id="${test._id}">Delete Test</button>
            `;

            testListContainer.appendChild(testDiv);
        });

        const deleteButtons = document.querySelectorAll('.delete-test-button');
        deleteButtons.forEach((button) => {
            button.addEventListener('click', async (event) => {
                const testId = event.target.getAttribute('data-test-id');
                await deleteTest(testId);
            });
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        alert('An error occurred while fetching tests. Please try again later.');
    }
};

const deleteTest = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
        console.log(`Deleting test with ID: ${testId}`);
        const response = await fetch(`/api/tests/${testId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Test deleted successfully!');
            fetchAndDisplayTests(); 
        } else {
            const errorData = await response.json().catch(() => null);
            console.error('Error deleting test:', errorData || 'Non-JSON response received');
            alert(`Error: ${errorData?.message || 'Failed to delete test'}`);
        }
    } catch (error) {
        console.error('Error deleting test:', error);
        alert('An error occurred while deleting the test. Please try again later.');
    }
};

const manageTestsLink = document.getElementById('manage-tests-link');
manageTestsLink.addEventListener('click', () => {
    hideAllSections();
    document.getElementById('manage-tests-section').style.display = 'block';
    fetchAndDisplayTests(); 
});
    addDisciplineLink.addEventListener('click', () => {
        hideAllSections();
        addDisciplineSection.style.display = 'block';
    });

    addDisciplineForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const disciplineName = disciplineNameInput.value.trim(); 
        if (!disciplineName) {
            alert('Discipline name is required.');
            return;
        }

        try {
            const response = await fetch('/api/disciplines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: disciplineName }),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Discipline added successfully!');
                disciplineNameInput.value = ''; 
            } else {
                alert(result.message || 'Error adding discipline.');
            }
        } catch (error) {
            console.error('Error adding discipline:', error);
            alert('Error adding discipline. Please try again later.');
        }
    });


    populateDisciplines();
});
