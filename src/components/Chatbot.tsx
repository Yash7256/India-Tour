import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello! How can I help you plan your India tour today? You can ask me about best places to visit." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const getBotResponse = (message: string): string => {
    const rules = [
      {
        pattern: /(?:what are (?:some )?(?:famous )?|best )?places? to visit in (\w+) (?:during|in) (monsoon|moonsoon|winter|summer)/i,
        answer: (city: string, season: string) => {
          const cityLower = city.toLowerCase();
          let seasonLower = season.toLowerCase();
          if (seasonLower === 'moonsoon') {
            seasonLower = 'monsoon';
          }

          if (cityLower === 'jabalpur' && seasonLower === 'monsoon') {
            return `During monsoon in Jabalpur, you might enjoy visiting Dhuandhar Falls and Bhedaghat to see the Marble Rocks with the river in full flow. The landscape is incredibly lush and green!`;
          }
          if (cityLower === 'jabalpur' && seasonLower === 'winter') {
            return `Winter (October to March) is the best time to visit Jabalpur. The weather is pleasant for sightseeing, visiting national parks, and enjoying boat rides at Bhedaghat.`;
          }
          return `I can look up the best places in ${city} for the ${season} season for you soon! This feature is coming.`;
        }
      },
      {
        pattern: /best places? to visit in (\w+)/i,
        answer: (city: string) => {
          const cityLower = city.toLowerCase();
          if (cityLower === 'jabalpur') {
            return `Jabalpur is famous for the Marble Rocks at Bhedaghat, Dhuandhar Falls, and Madan Mahal Fort. It's also a gateway to Kanha and Bandhavgarh National Parks.`;
          }
          if (cityLower === 'bhopal') {
            return `In Bhopal, you should visit the Upper Lake, Van Vihar National Park, and the State Tribal Museum.`;
          }
          if (cityLower === 'indore') {
            return `Indore is a foodie's paradise! Don't miss Sarafa Bazaar and Chappan Dukan. For sightseeing, you have Rajwada Palace and Lal Bagh Palace.`;
          }
          return `I'm still learning about ${city}. You can try asking about Jabalpur, Bhopal, or Indore!`;
        }
      },
      {
        pattern: /what is (\w+) famous for/i,
        answer: (city: string) => {
          const cityLower = city.toLowerCase();
          if (cityLower === 'jabalpur') {
            return `Jabalpur is renowned for the stunning Marble Rocks at Bhedaghat, the powerful Dhuandhar Falls, and its rich history, including the Madan Mahal Fort.`;
          }
          if (cityLower === 'indore') {
            return `Indore is famous for being the cleanest city in India, its incredible street food, and as the commercial capital of Madhya Pradesh.`;
          }
          return `I'm still learning about what ${city} is famous for.`;
        }
      },
      {
        pattern: /how to reach (\w+)/i,
        answer: (city: string) => {
          const cityLower = city.toLowerCase();
          if (cityLower === 'jabalpur') {
            return `You can reach Jabalpur by:\n- **Air:** Dumna Airport (JLR) has flights from major Indian cities.\n- **Train:** Jabalpur Junction (JBP) is a major railway station.\n- **Road:** It's well-connected by national highways.`;
          }
          return `I'm still gathering travel information for ${city}.`;
        }
      },
      {
        pattern: /what (?:are some famous )?sweets? (?:from|in) (\w+)/i,
        answer: (city: string) => {
          const cityLower = city.toLowerCase();
          if (cityLower === 'jabalpur') {
            return `Jabalpur is famous for its sweets! You should definitely try Khoye ki Jalebi. It's a local delicacy.`;
          }
          if (cityLower === 'indore') {
            return `Indore has some delicious sweets like Malpua and Jalebi, especially at Sarafa Bazaar.`;
          }
          return `I'm still learning about the sweets in ${city}.`;
        }
      },
      {
        pattern: /what to eat in (\w+)/i,
        answer: (city: string) => {
          const cityLower = city.toLowerCase();
          if (cityLower === 'jabalpur') {
            return `In Jabalpur, you must try the local street food like Poha-Jalebi for breakfast, and dishes like Khoye ki Jalebi and Mangode.`;
          }
          if (cityLower === 'indore') {
            return `Indore is a food lover's dream! You have to try Poha-Jalebi, Garadu, Bhutte ka Kees, and explore the night street food market at Sarafa Bazaar.`;
          }
          return `I'm still building my food guide for ${city}.`;
        }
      },
      {
        pattern: /best time to visit (\w+)/i,
        answer: (city: string) => {
          const cityLower = city.toLowerCase();
          if (cityLower === 'jabalpur') {
            return `The best time to visit Jabalpur is during the winter months, from October to March, when the weather is cool and pleasant for sightseeing.`;
          }
          return `I'm not sure about the best time to visit ${city} yet.`;
        }
      },
      {
        pattern: /digital id|secure id/i,
        answer: "You can create a secure Digital ID to store your travel documents. Just head to the 'Digital ID' page from the navigation menu after you sign in."
      },
      {
        pattern: /hi|hello|hey/i,
        answer: "Hello! How can I help you plan your India tour today?"
      },
      {
        pattern: /how are you/i,
        answer: "I'm a bot, but I'm doing great! Ready to assist you."
      },
      {
        pattern: /bye|goodbye/i,
        answer: "Goodbye! Have a great day."
      },
      {
        pattern: /help/i,
        answer: "You can ask me about the best places to visit in a city, or for specific recommendations during a season. For example: 'best places to visit in Jabalpur during monsoon'."
      }
    ];

    for (const rule of rules) {
      const match = message.toLowerCase().match(rule.pattern);
      if (match) {
        if (typeof rule.answer === 'function') {
          const params = match.slice(1);
          return rule.answer(...params);
        }
        return rule.answer;
      }
    }

    return "I'm sorry, I don't understand that. You can ask me for 'help'.";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);

    const botResponseText = getBotResponse(inputValue);
    const botMessage: Message = { sender: 'bot', text: botResponseText };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    setInputValue('');
  };

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
      <div className="bg-orange-600 text-white p-3 rounded-t-lg flex items-center">
        <Bot className="h-6 w-6 mr-2" />
        <h3 className="font-semibold">India Tour Assistant</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-200 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me something..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="bg-orange-600 text-white px-4 py-2 rounded-r-md hover:bg-orange-700 transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;