document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.getElementById('home-link');
    const viewTestsLink = document.getElementById('view-tests-link');
    const homeSection = document.getElementById('home-section');
    const viewTestsSection = document.getElementById('view-tests-section');
    const disciplineSelect = document.getElementById('select-discipline');
    const selectTest = document.getElementById('select-test');
    const testQuestionsContainer = document.getElementById('test-questions-container');
    const testQuestionsForm = document.getElementById('test-questions-form');
    const submitTestButton = document.getElementById('submit-test-button');
    const testResultsContainer = document.getElementById('test-results-container');
    const testScore = document.getElementById('test-score');
    const testGrade = document.getElementById('test-grade');
    const viewResultsLink = document.getElementById('view-results-link');
    const resultsSection = document.getElementById('results-section');
    const userResultsContainer = document.getElementById('user-results-container');
    homeSection.style.display = 'block';
    viewTestsSection.style.display = 'none';
    testQuestionsContainer.style.display = 'none';
    submitTestButton.style.display = 'none';
    testResultsContainer.style.display = 'none';
    resultsSection.style.display = 'none';
    userResultsContainer.style.display = 'none';
    viewTestsLink.addEventListener('click', () => {
        homeSection.style.display = 'none';
        viewTestsSection.style.display = 'block';
        resultsSection.style.display = 'none';

        populateDisciplines(); 
    });
    homeLink.addEventListener('click', () => {
        homeSection.style.display = 'block';
        resultsSection.style.display = 'none';
        viewTestsSection.style.display = 'none';
        populateDisciplines(); 
    });
    viewResultsLink.addEventListener('click', async () => {
        homeSection.style.display = 'none';
        viewTestsSection.style.display = 'none';
        resultsSection.style.display = 'block';
        userResultsContainer.style.display = 'block';

            fetchUserResults();
    });
    const fetchUserResults = async () => {
        const { studentId } = getLoggedInUserInfo();
        if (!studentId) {
            console.error('No student ID found.');
            return;
        }
    
        try {
            console.log(`Fetching results for student ID: ${studentId}`);
            const response = await fetch(`/api/results/show/${studentId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error fetching results:', errorData || 'Non-JSON response received');
                alert(`Error: ${errorData?.message || 'Failed to fetch results'}`);
                return;
            }
    
            const results = await response.json();
            console.log('Fetched results:', results); 
    
            displayUserResults(results);
        } catch (error) {
            console.error('Error fetching user results:', error);
            alert('An error occurred while fetching your results. Please try again later.');
        }
    };
    const displayUserResults = (results) => {
        console.log('Display function called with results:', results);
        userResultsContainer.innerHTML = ''; 
    
        if (!results || results.length === 0) {
            console.log('No results to display.');
            userResultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }
    
        const calculateGrade = (score, totalQuestions) => {
            const percentage = (score / totalQuestions) * 100;
    
            if (percentage >= 90) return 'A';
            if (percentage >= 80) return 'B';
            if (percentage >= 70) return 'C';
            if (percentage >= 60) return 'D';
            return 'F';
        };
    
        results.forEach((result) => {
            console.log('Rendering result:', result);
    
            const testName = result.test?.name || 'Unknown Test';
            const disciplineName = result.discipline?.name || 'Unknown Discipline';
            const score = result.score ?? 'N/A';
            const totalQuestions = result.test?.questions?.length || result.test?.totalQuestions || 0; 
            const grade =
                score !== 'N/A' && totalQuestions > 0
                    ? calculateGrade(score, totalQuestions)
                    : 'N/A';
            const completedAt = result.completedAt
                ? new Date(result.completedAt).toLocaleString()
                : 'Unknown';
    
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('result-item');
            resultDiv.style.border = '1px solid #ccc';
            resultDiv.style.borderRadius = '5px';
            resultDiv.style.padding = '10px';
            resultDiv.style.marginBottom = '10px';
            resultDiv.style.backgroundColor = '#f9f9f9';
    
            resultDiv.innerHTML = `
                <p><strong>Test:</strong> ${testName}</p>
                <p><strong>Discipline:</strong> ${disciplineName}</p>
                <p><strong>Score:</strong> ${score}</p>
                <p><strong>Completed At:</strong> ${completedAt}</p>
            `;
    
            console.log('Appending result div to container.');
            userResultsContainer.appendChild(resultDiv);
        });
    
        console.log('All results rendered successfully.');
    };
    
    
    
    const getLoggedInUserInfo = () => {
        const studentId = localStorage.getItem('studentId');
        if (!studentId) {
            console.error('No student ID found in localStorage');
            alert('You are not logged in. Redirecting to login.');
            window.location.href = '/login.html';
            return null;
        }
        return { studentId };
    };

    const populateDisciplines = async () => {
        try {
            console.log('Fetching disciplines...');
            const response = await fetch('/api/disciplines');
            if (!response.ok) throw new Error(`Failed to fetch disciplines: ${response.status}`);

            const disciplines = await response.json();
            console.log('Disciplines fetched:', disciplines);

            disciplineSelect.innerHTML = '<option value="">Select Discipline</option>';
            disciplines.forEach((discipline) => {
                const option = document.createElement('option');
                option.value = discipline._id;
                option.textContent = discipline.name;
                disciplineSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching disciplines:', error);
            alert('Error fetching disciplines');
        }
    };
    

    const populateTests = async (disciplineId) => {
        if (!disciplineId) {
            console.error('Discipline ID is empty or not selected.');
            return;
        }
    
        try {
            const response = await fetch(`/api/tests/ping?discipline=${disciplineId}`,
                
            );
            console.log('Response status:', response.status); 
            if (!response.ok) throw new Error(`Failed to fetch tests: ${response.status}`);
    
            const tests = await response.json();
            console.log('Fetched tests:', tests);
    
            selectTest.innerHTML = '<option value="">Select Test</option>';
            tests.forEach((test) => {
                const option = document.createElement('option');
                option.value = test._id;
                option.textContent = test.name;
                selectTest.appendChild(option);
            });
    
            if (tests.length === 0) {
                selectTest.innerHTML = '<option value="">No tests available</option>';
            }
        } catch (error) {
            console.error('Error fetching tests1:', error);
            alert('Error fetching tests.');
        }
    };
    disciplineSelect.addEventListener('change', async () => {
        const disciplineId = disciplineSelect.value;
        console.log('Selected discipline ID:', disciplineId);

        if (disciplineId) {
            await populateTests(disciplineId);
        } else {
            selectTest.innerHTML = '<option value="">Select Test</option>';
        }
    });

   
    selectTest.addEventListener('change', async () => {
        const selectedTestId = selectTest.value;
        console.log('Selected test ID:', selectedTestId);

        testQuestionsForm.innerHTML = '';
        testResultsContainer.style.display = 'none';
        testQuestionsContainer.style.display = 'none';
        submitTestButton.style.display = 'none';

        if (selectedTestId) {
            try {
                console.log(`Fetching test data for test ID: ${selectedTestId}`);
                const response = await fetch(`/api/tests/ping/${selectedTestId}`);
                if (!response.ok) throw new Error(`Failed to fetch test data: ${response.status}`);

                const testData = await response.json();
                console.log('Test data fetched:', testData);

                displayTestQuestions(testData);
            } catch (error) {
                console.error('Error fetching test data:', error);
                alert('Error fetching test data');
            }
        }
    });

    const displayTestQuestions = (testData) => {
        testQuestionsContainer.style.display = 'block';
        testQuestionsForm.innerHTML = '';
        submitTestButton.style.display = 'block';

        testData.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-group');
            questionDiv.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${question.text}</p>
                <div class="answers-container">
                    ${question.options
                        .map(
                            (option, idx) => `
                            <div class="answer-group">
                                <input type="radio" name="question-${index}" value="${option.text}" required>
                                <label>${option.text}</label>
                            </div>
                        `
                        )
                        .join('')}
                </div>
            `;
            testQuestionsForm.appendChild(questionDiv);
        });
    };

    selectTest.addEventListener('change', async (event) => {
        const testId = selectTest.value;
    
        if (!testId) {
            console.error('No test selected.');
            return;
        }
    
        try {
            console.log('Fetching test data for test ID:', testId);
    
            const response = await fetch(`/api/tests/ping/${testId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error fetching test:', errorData || 'Non-JSON response received');
                alert(`Error: ${errorData?.message || 'Failed to fetch test data'}`);
                return;
            }
    
            currentTest = await response.json();
            console.log('Test fetched successfully:', currentTest);
    
            renderTestQuestions(currentTest);
        } catch (error) {
            console.error('Error fetching test:', error);
            alert('An error occurred while fetching the test. Please try again later.');
        }
    });
    
    submitTestButton.addEventListener('click', async (event) => {
        event.preventDefault();
    
        if (!currentTest) {
            console.error('No test loaded.');
            alert('Please select and load a test before submitting.');
            return;
        }
    
        console.log('Using current test:', currentTest);
    
        const answers = Array.from(testQuestionsForm.querySelectorAll('input[type="radio"]:checked')).map((input) => ({
            question: input.name.replace('question-', ''), 
            answer: input.value, 
        }));
    
        console.log('Collected answers:', answers);
    
        if (answers.length === 0) {
            console.warn('No answers selected.');
            alert('Please answer all the questions.');
            return;
        }
    
        let score = 0;
        currentTest.questions.forEach((question, index) => {
            console.log(`Checking question ${index}:`, question.text);
    
            const correctOption = question.options.find(option => option.isCorrect);
            console.log('Correct option:', correctOption);
    
            const studentAnswer = answers.find(answer => answer.question === `${index}`);
            console.log('Student answer:', studentAnswer);
    
            if (studentAnswer?.answer === correctOption?.text) {
                console.log(`Answer is correct for question ${index}`);
                score += 1;
            } else {
                console.log(`Answer is incorrect for question ${index}`);
            }
        });
    
        console.log('Score calculated:', score);
    
        const studentId = localStorage.getItem('studentId'); 
        const disciplineId = currentTest.discipline; 
        const resultData = {
            student: studentId,
            test: currentTest._id,
            score,
            discipline: disciplineId,
        };
    
        console.log('Result data to be saved:', resultData);
    
        try {
            const response = await fetch('/api/results/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resultData),
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error saving result:', errorData || 'Non-JSON response received');
                alert(`Error: ${errorData?.message || 'Failed to save result'}`);
                return;
            }
    
            const savedResult = await response.json();
            console.log('Result saved successfully:', savedResult);
    
            displayTestResults({ score, grade: calculateGrade(score, currentTest.questions.length) });
        } catch (error) {
            console.error('Error saving result:', error);
            alert('An error occurred while saving the result. Please try again later.');
        }
    });
    
    
    const calculateGrade = (score, totalQuestions) => {
        const percentage = (score / totalQuestions) * 100;
        console.log('Calculating grade from percentage:', percentage);
    
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };
    
    const renderTestQuestions = (test) => {
        console.log('Rendering test questions...');
        testQuestionsForm.innerHTML = ''; 
        test.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-group');
            questionDiv.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${question.text}</p>
                <div class="answers-container">
                    ${question.options
                        .map(
                            (option, idx) => `
                            <div class="answer-group">
                                <input type="radio" name="question-${index}" value="${option.text}" required>
                                <label>${option.text}</label>
                            </div>
                        `
                        )
                        .join('')}
                </div>
            `;
            testQuestionsForm.appendChild(questionDiv);
        });
    
        console.log('Test questions rendered.');
    };
    
    const displayTestResults = (result) => {
        console.log('Displaying test results:', result);
    
        testResultsContainer.style.display = 'block';
        testQuestionsContainer.style.display = 'none';
        submitTestButton.style.display = 'none';
    
        testScore.textContent = `Score: ${result.score}`;
        testGrade.textContent = `Grade: ${result.grade}`;
    };
    
    
    populateDisciplines();
});
