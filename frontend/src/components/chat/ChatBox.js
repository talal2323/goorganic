import React, { useState } from 'react';

const ChatBox = ({ vendorName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'user', text: input }]);
      setInput('');

      // Simulate vendor response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'vendor', text: `Thank you for reaching out to ${vendorName}. How can we assist you?` },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="chat-box border rounded-lg shadow-lg p-4 bg-white">
      <div className="chat-header font-bold text-lg mb-2">Chat with {vendorName}</div>
      <div className="chat-messages h-64 overflow-y-auto border p-2 mb-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border rounded-l-lg p-2"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;