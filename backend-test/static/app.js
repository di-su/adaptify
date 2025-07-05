// Get DOM elements
const queryInput = document.getElementById('query');
const askButton = document.getElementById('ask');
const answerPre = document.getElementById('answer');
const sourcesList = document.getElementById('sources');

// Add event listeners
askButton.addEventListener('click', ask);
queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        ask();
    }
});

async function ask() {
    const query = queryInput.value.trim();
    if (!query) return;

    // Clear previous results
    answerPre.textContent = '';
    sourcesList.innerHTML = '';

    // Show loading state
    askButton.disabled = true;
    askButton.textContent = 'Asking...';
    answerPre.textContent = 'Thinking...';

    try {
        const response = await fetch('/rag/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                top_k: 5,
                temperature: 0.2
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Display answer
        answerPre.textContent = data.answer;
        
        // Display sources
        data.sources.forEach(source => {
            addSource(source);
        });

    } catch (error) {
        console.error('Error:', error);
        answerPre.textContent = `Error: ${error.message}`;
    } finally {
        // Reset button state
        askButton.disabled = false;
        askButton.textContent = 'Ask';
    }
}

function addSource(source) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="source-score">Score: ${source.score.toFixed(4)}</div>
        <div>${source.content}</div>
    `;
    sourcesList.appendChild(li);
}