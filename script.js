const config = {
    apiUrl: 'https://policybot-b2rp.onrender.com/chat',
    welcomeMessage: 'Welcome to IndexPosition Insurance! I\'m your personal insurance assistant. How can I help you with policies, claims, or coverage questions today?',
    errorMessage: 'Sorry, I\'m having trouble connecting to our services. Please try again shortly or contact our support team for immediate assistance.',
    quickActions: [
        {
            icon: 'fa-home',
            text: 'Home Insurance',
            prompt: 'Tell me about your home insurance policies'
        },
        {
            icon: 'fa-car',
            text: 'Auto Insurance',
            prompt: 'What auto insurance options do you offer?'
        },
        {
            icon: 'fa-file-alt',
            text: 'Claims',
            prompt: 'Explain the claims process'
        },
        {
            icon: 'fa-percentage',
            text: 'Discounts',
            prompt: 'What discounts are available?'
        }
    ],
    humanAgentName: 'Sarah Johnson',
    humanAgentGreeting: 'Hello! This is Sarah from customer support. How can I help you today?',
    transferPhrases: [
        'transfer to human',
        'connecting you to',
        'human agent',
        'let me connect you'
    ]
};

const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const helpButton = document.getElementById('help-button');
const sendButton = document.getElementById('send-button');
const attachButton = document.getElementById('attach-button');
const helpModal = document.getElementById('help-modal');
const closeModal = document.querySelector('.close-modal');
const quickActionButtons = document.querySelectorAll('.quick-action-btn');


function initChat() {
    chatMessages.innerHTML = '';

    addWelcomeMessage();
    setupScrollBehavior();
    
    quickActionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const prompt = e.currentTarget.getAttribute('data-prompt');
            if (prompt) {
                sendQuickPrompt(prompt);
            }
        });
    });
}


function addWelcomeMessage() {
    addMessageToUI('assistant', config.welcomeMessage, false);
    
    setTimeout(() => {
        
        document.querySelectorAll('.suggestion-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const prompt = e.currentTarget.getAttribute('data-prompt');
                if (prompt) {
                    sendQuickPrompt(prompt);
                }
            });
        });
        
        scrollToBottom();
    }, 500);
}

function setupScrollBehavior() {
    const messagesContainer = document.getElementById('chat-messages');
    
    const observer = new MutationObserver(() => {
        scrollToBottom();
    });
    
    observer.observe(messagesContainer, {
        childList: true,
        subtree: true
    });
    
    scrollToBottom();
}

function sendQuickPrompt(prompt) {
    userInput.value = prompt;
    chatForm.dispatchEvent(new Event('submit'));
}

function addMessageToUI(role, content, animate = true) {
    const messageDiv = document.createElement('div');
    const displayTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const isHumanTransfer = content.toLowerCase().includes('transferred to human') || 
                          content.toLowerCase().includes('connecting you to a human');
    
    if (isHumanTransfer) {
        const joinDiv = document.createElement('div');
        joinDiv.className = 'join-notification';
        joinDiv.textContent = 'Sarah Johnson joined the chat';
        chatMessages.appendChild(joinDiv);
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message human-agent human-agent-typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
        
        setTimeout(() => {
            typingDiv.remove();
            
            messageDiv.className = `message human-agent ${animate ? 'new-message' : ''}`;
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = formatMessageContent(content);
            
            const metaDiv = document.createElement('div');
            metaDiv.className = 'message-meta';
            metaDiv.innerHTML = `<span class="message-time">${displayTime}</span>`;
            
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(metaDiv);
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        }, 2000);
        
        return;
    }
    
    messageDiv.className = `message ${role} ${animate ? 'new-message' : ''}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = typeof content === 'string' ? formatMessageContent(content) : String(content);
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';
    metaDiv.innerHTML = `<span class="message-time">${displayTime}</span>`;
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(metaDiv);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function formatMessageContent(content) {
    let formatted = content.replace(/^Assistant:\s*/i, '');
    
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    formatted = formatted.split('\n').map(paragraph => {
        if (paragraph.trim()) {
            return `<p>${paragraph}</p>`;
        }
        return '';
    }).join('');
    
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return formatted;
}

function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant loading-indicator';
    loadingDiv.innerHTML = `
        <div class="message-content loading">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    loadingDiv.id = 'loading-indicator';
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
}

function hideLoadingIndicator() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessageToBackend(message) {
    try {
        showLoadingIndicator();
        toggleSendButton(true);

        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversation_history: getConversationHistory()
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideLoadingIndicator();

        const transferPhrases = [
            'transfer to human',
            'connecting you to',
            'human agent',
            'let me connect you'
        ];
        
        const isTransfer = transferPhrases.some(phrase => 
            data.response.toLowerCase().includes(phrase)
        );

        if (isTransfer) {
            addMessageToUI('human-agent', "Hello! This is Sarah from customer support. How can I help you today?");
        } else {
            addMessageToUI('assistant', data.response);
        }
    } catch (error) {
        console.error('API Error:', error);
        hideLoadingIndicator();
        addMessageToUI('assistant', config.errorMessage);
    } finally {
        toggleSendButton(false);
    }
}

function getConversationHistory() {
    return Array.from(document.querySelectorAll('.message')).map(msg => {
        return {
            role: msg.classList.contains('user') ? 'user' : 
                  msg.classList.contains('human-agent') ? 'human-agent' : 'assistant',
            content: msg.querySelector('.message-content').textContent.trim()
        };
    });
}

function toggleSendButton(isLoading) {
    sendButton.disabled = isLoading;
    sendButton.innerHTML = isLoading 
        ? '<i class="fas fa-spinner fa-spin"></i>' 
        : '<i class="fas fa-paper-plane"></i>';
    sendButton.classList.toggle('loading', isLoading);
}

function showHelpModal() {
    helpModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideHelpModal() {
    helpModal.classList.remove('show');
    document.body.style.overflow = '';
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    
    if (message) {
        addMessageToUI('user', message);
        userInput.value = '';
        await sendMessageToBackend(message);
    }
});

helpButton.addEventListener('click', showHelpModal);
closeModal.addEventListener('click', hideHelpModal);

helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        hideHelpModal();
    }
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

attachButton.addEventListener('click', () => {
    alert('File attachment functionality would be implemented here');
});

document.addEventListener('DOMContentLoaded', initChat);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
