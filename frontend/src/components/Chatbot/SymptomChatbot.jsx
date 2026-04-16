import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './SymptomChatbot.css';

const SymptomChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your medical assistant. Describe your symptoms and I'll recommend the right type of doctor for you.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close chat on route change
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  const getConversationHistory = () => {
    // Return last 5 messages as context (excluding welcome message)
    return messages.slice(1, -1).slice(-10).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to use the chatbot');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        '/api/chatbot/analyze',
        {
          message: userMessage.content,
          conversationHistory: getConversationHistory()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { analysis } = response.data;

      // Format bot response
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: analysis,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to analyze symptoms. Please try again.';
      setError(errorMessage);

      const errorBotMessage = {
        id: messages.length + 2,
        type: 'bot-error',
        content: errorMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const navigateToDoctors = (specialization) => {
    // Navigate to doctor search page with specialization filter
    window.location.href = `/search?specialization=${encodeURIComponent(specialization)}`;
  };

  const renderMessage = (message) => {
    if (message.type === 'user') {
      return (
        <div key={message.id} className="message user-message">
          <div className="message-bubble user-bubble">
            {message.content}
          </div>
        </div>
      );
    }

    if (message.type === 'bot-error') {
      return (
        <div key={message.id} className="message bot-message">
          <div className="message-bubble error-bubble">
            {message.content}
          </div>
        </div>
      );
    }

    if (message.type === 'bot' && typeof message.content === 'object') {
      const analysis = message.content;
      return (
        <div key={message.id} className="message bot-message">
          <div className="message-bubble ai-bubble">
            <div className="analysis-container">
              <div className="analysis-section">
                <strong>Recommended Doctor:</strong>
                <span className="specialization-tag">
                  {analysis.specialization}
                </span>
              </div>

              <div className="analysis-section">
                <strong>Reason:</strong>
                <p className="reason-text">{analysis.reason}</p>
              </div>

              <div className="analysis-section">
                <strong>Confidence:</strong>
                <span className={`confidence-badge confidence-${analysis.confidence}`}>
                  {analysis.confidence.charAt(0).toUpperCase() + analysis.confidence.slice(1)}
                </span>
              </div>

              <div className="analysis-section">
                <strong>Urgency:</strong>
                <span className={`urgency-badge urgency-${analysis.urgency}`}>
                  {analysis.urgency.charAt(0).toUpperCase() + analysis.urgency.slice(1)}
                </span>
              </div>

              {analysis.followUpQuestions && analysis.followUpQuestions.length > 0 && (
                <div className="analysis-section">
                  <strong>Follow-up Questions:</strong>
                  <ul className="follow-up-list">
                    {analysis.followUpQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="find-doctors-btn"
                onClick={() => navigateToDoctors(analysis.specialization)}
              >
                🔍 Find {analysis.specialization} Near Me
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className="message bot-message">
        <div className="message-bubble ai-bubble">
          {message.content}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`chatbot-floating-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Medical Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h3>Medical Assistant</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-bubble ai-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="typing-text">AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms..."
              rows={2}
              disabled={isLoading}
              className="chatbot-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? '⏳' : '→'}
            </button>
          </div>

          <div className="chatbot-disclaimer">
            ⚠️ This is not a medical diagnosis. Please consult a doctor for professional advice.
          </div>
        </div>
      )}
    </>
  );
};

export default SymptomChatbot;
