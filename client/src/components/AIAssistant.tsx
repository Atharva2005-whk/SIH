import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Lightbulb,
  MapPin,
  AlertTriangle,
  Phone,
  Shield,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  userName?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export function AIAssistant({ userName = 'Tourist', userLocation }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello ${userName}! I'm your SafeSphere AI Assistant. I'm here to help you stay safe during your travels. How can I assist you today?`,
      timestamp: new Date(),
      suggestions: [
        'What are the emergency numbers?',
        'Find nearby hospitals',
        'Safety tips for tourists',
        'Report an incident'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock AI responses based on user input
  const generateAIResponse = (userInput: string): { content: string; suggestions?: string[] } => {
    const input = userInput.toLowerCase();
    
    if (input.includes('emergency') || input.includes('help')) {
      return {
        content: 'In case of emergency, immediately call:\n🚨 Police: 112\n🏥 Medical: 102\n🔥 Fire: 101\n\nYour location has been automatically shared with emergency services. Stay calm and follow their instructions.',
        suggestions: ['Share my location', 'Contact family', 'Find nearest hospital', 'Safety tips']
      };
    }
    
    if (input.includes('hospital') || input.includes('medical')) {
      return {
        content: 'I found nearby medical facilities:\n\n🏥 District Hospital - 2.3 km away\n📍 Civil Hospital - 4.1 km away\n🚑 24/7 Emergency Clinic - 1.8 km away\n\nWould you like directions to any of these?',
        suggestions: ['Get directions', 'Call ambulance', 'First aid tips', 'Emergency contacts']
      };
    }
    
    if (input.includes('safety') || input.includes('tips')) {
      return {
        content: '🛡️ Safety Tips for Tourists:\n\n• Always carry a copy of your ID\n• Share your location with trusted contacts\n• Avoid isolated areas after dark\n• Keep emergency numbers handy\n• Stay in groups when possible\n• Trust your instincts\n\nStay safe and enjoy your travels!',
        suggestions: ['Emergency numbers', 'Report incident', 'Safe zones nearby', 'Contact support']
      };
    }
    
    if (input.includes('weather') || input.includes('climate')) {
      return {
        content: '🌤️ Current Weather Advisory:\n\nTemperature: 24°C\nConditions: Partly Cloudy\nWind: 8 km/h\nHumidity: 65%\n\n⚠️ No weather warnings in your area. Perfect conditions for sightseeing!',
        suggestions: ['3-day forecast', 'Activity recommendations', 'What to wear', 'Indoor attractions']
      };
    }
    
    if (input.includes('report') || input.includes('incident')) {
      return {
        content: '📋 To report an incident:\n\n1. Ensure you\'re in a safe location\n2. Call emergency services if immediate help is needed\n3. Use the "Report Incident" feature in your app\n4. Provide detailed information\n5. Share photos if safe to do so\n\nYour safety is our priority!',
        suggestions: ['Emergency call', 'Report now', 'Safety checklist', 'Contact authorities']
      };
    }
    
    if (input.includes('location') || input.includes('where')) {
      const locationText = userLocation 
        ? `Your current location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
        : 'Location services not available';
      
      return {
        content: `📍 ${locationText}\n\nYou're in a monitored safe zone. Nearby points of interest:\n\n🏛️ Tourist Information Center - 500m\n🍽️ Local Restaurant District - 800m\n🛍️ Shopping Area - 1.2km\n🚌 Bus Station - 1.5km`,
        suggestions: ['Get directions', 'Nearby attractions', 'Transportation', 'Emergency services']
      };
    }
    
    // Default response
    return {
      content: `I understand you're asking about "${userInput}". Here are some ways I can help you:\n\n🆘 Emergency assistance\n🏥 Find medical facilities\n🛡️ Safety tips and guidelines\n📍 Location services\n🌤️ Weather updates\n📋 Incident reporting\n\nWhat would you like to know more about?`,
      suggestions: ['Emergency help', 'Safety tips', 'Find hospitals', 'Weather info']
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'assistant',
      content: `Hello ${userName}! I'm your SafeSphere AI Assistant. How can I help you today?`,
      timestamp: new Date(),
      suggestions: [
        'What are the emergency numbers?',
        'Find nearby hospitals',
        'Safety tips for tourists',
        'Report an incident'
      ]
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-3xl">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Safety Assistant</h3>
            <p className="text-sm text-blue-100">Always here to help you stay safe</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={clearChat}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            title="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '400px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'assistant' && (
              <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-lg'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
              
              {/* Suggestions */}
              {message.suggestions && message.type === 'assistant' && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {message.type === 'user' && (
              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl shadow-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white rounded-b-3xl border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about safety, locations, or emergency help..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
            />
            <button
              onClick={() => setIsListening(!isListening)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                isListening 
                  ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <button
            onClick={() => handleSuggestionClick('Emergency help needed')}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition-colors text-sm"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency</span>
          </button>
          <button
            onClick={() => handleSuggestionClick('Find nearby hospitals')}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-2xl hover:bg-green-200 transition-colors text-sm"
          >
            <Phone className="h-4 w-4" />
            <span>Medical</span>
          </button>
          <button
            onClick={() => handleSuggestionClick('Safety tips for tourists')}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-2xl hover:bg-blue-200 transition-colors text-sm"
          >
            <Shield className="h-4 w-4" />
            <span>Safety</span>
          </button>
        </div>
      </div>
    </div>
  );
}
