import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Mic, MicOff, FileUp, X } from 'lucide-react';
import { supabase } from '@/utils/supabase';

class PortfolioNLPBot {
  constructor() {
    this.intents = {
      'greet': ['hi', 'hello', 'hey', 'greetings'],
      'create_portfolio': ['create portfolio', 'make portfolio', 'portfolio', 'build portfolio'],
      'help': ['help', 'assistance', 'guide me'],
      'exit': ['exit', 'quit', 'stop']
    };
    
    this.portfolio_steps = [
      'bio', 'skills', 
      'projects', 'experience', 'social_links'
    ];
    this.portfolio_data = {
      projects: [],
      experience: []
    };
    
    this.current_step = null;
    this.portfolio_data = {};
  }

  recognizeIntent(message) {
    message = message.toLowerCase();
    for (let [intent, triggers] of Object.entries(this.intents)) {
      if (triggers.some(trigger => message.includes(trigger))) {
        return intent;
      }
    }
    return 'unknown';
  }

  extractInfo(message) {
    message = message.trim();
    
    switch (this.current_step) {
      
      case 'bio':
        return message.split(' ').length >= 10 ? message : null;
      
      case 'skills': {
        const skills = message.split(',').map(skill => skill.trim()).filter(skill => skill);
        return skills.length > 0 ? skills : null;
      }
      
      case 'projects': {
        const [title, ...descriptionParts] = message.split('-');
        const description = descriptionParts.join('-').trim();
        
        // Existing project handling logic
        if (title && description) {
          this.portfolio_data.projects = this.portfolio_data.projects || [];
          this.portfolio_data.projects.push({ title: title.trim(), description });
          return "Got it! Add another project or type 'done' to proceed.";
        } else if (message.toLowerCase() === 'done') {
          this.current_step = 'experience';
          return "Okay, let's move on to your work experience. Format: Role - Company - Duration.";
        } else {
          const projectParts = message.split('|');
          return projectParts.length === 2 ? {
            title: projectParts[0].trim(),
            description: projectParts[1].trim(),
            image: '/api/placeholder/600/400'
          } : null;
        }
      }
      
      case 'experience': {
        const [role, company, duration] = message.split('-').map(item => item.trim());
        
        // Existing experience handling logic
        if (role && company && duration) {
          this.portfolio_data.experience = this.portfolio_data.experience || [];
          this.portfolio_data.experience.push({ role, company, duration });
          return "Added! Add another experience or type 'done' to proceed.";
        } else if (message.toLowerCase() === 'done') {
          this.current_step = 'social_links';
          return "Finally, share your social links. Format: github, twitter, linkedin, instagram.";
        } else {
          const expParts = message.split('|');
          return expParts.length === 4 ? {
            role: expParts[0].trim(),
            company: expParts[1].trim(),
            period: expParts[2].trim(),
            description: expParts[3].trim()
          } : null;
        }
      }
      
      case 'social_links': {
        const socialPlatforms = ['github', 'twitter', 'linkedin', 'instagram'];
        const matchedPlatform = socialPlatforms.find(platform => 
          message.toLowerCase().includes(platform)
        );
        return matchedPlatform 
          ? { [matchedPlatform]: message.split(matchedPlatform)[1].trim() } 
          : null;
      }
      
      default:
        return null;
    }
  }

  async validateAndStore(info) {
    if (info === null) return false;

    switch (this.current_step) {
      case 'bio':
        this.portfolio_data.bio = info;
        break;
      case 'skills':
        this.portfolio_data.skills = info;
        break;
      case 'projects':
        this.portfolio_data.projects = this.portfolio_data.projects || [];
        this.portfolio_data.projects.push(info);
        break;
      case 'experience':
        this.portfolio_data.experience = this.portfolio_data.experience || [];
        this.portfolio_data.experience.push(info);
        break;
      case 'social_links':
        this.portfolio_data.social_links = {
          ...this.portfolio_data.social_links,
          ...info
        };
        // Save to Supabase at the final step
        if (Object.keys(this.portfolio_data.social_links).length === 4) {
          try {
            const { error } = await supabase
              .from('portfolio')
              .insert({ user_id: this.userData.id, ...this.portfolio_data });

            if (error) {
              console.error("Error saving portfolio:", error);
              return "Something went wrong while saving your portfolio. Please try again.";
            }
            return "Your portfolio has been successfully created!";
          } catch (error) {
            console.error("Unexpected error:", error);
            return "An unexpected error occurred. Please try again.";
          }
        }
        break;
      default:
        return false;
    }
    return true;
  }

  moveToNextStep() {
    const currentIndex = this.portfolio_steps.indexOf(this.current_step);
    if (currentIndex < this.portfolio_steps.length - 1) {
      this.current_step = this.portfolio_steps[currentIndex + 1];
    } else {
      this.current_step = null;
    }
  }

  getNextPrompt() {
    if (!this.current_step) {
      this.current_step = this.portfolio_steps[0];
    }

    const prompts = {
      'bio': "Please write a short bio about yourself (at least 10 words)",
      'skills': "List your skills, separated by commas (e.g., Python, React, Machine Learning)",
      'projects': "Tell me about a project (Format: Project Title | Project Description)",
      'experience': "Share your work experience (Format: Role | Company | Period | Description)",
      'social_links': "Share a social link (e.g., github johndoe)"
    };

    return prompts[this.current_step];
  }

  async savePortfolioToSupabase() {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .insert({ user_id: this.userData.id, ...this.portfolio_data });
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error saving portfolio to Supabase:", e);
      return false;
    }
  }

  processMessage(message) {
    const intent = this.recognizeIntent(message);
    
    // Portfolio creation logic
    if (intent === 'create_portfolio' || this.current_step) {
      if (!this.current_step) {
        return {
          response: "Let's create your portfolio! I'll guide you through each step.",
          prompt: this.getNextPrompt()
        };
      }
      
      const info = this.extractInfo(message);
      if (this.validateAndStore(info)) {
        this.moveToNextStep();
        
        if (this.current_step === null) {
          const saved = this.savePortfolioToSupabase();
          return {
            response: saved 
              ? "Your portfolio has been saved successfully!" 
              : "There was an error saving your portfolio. Please try again later.",
            portfolio_data: this.portfolio_data
          };
        }
        
        return {
          response: "Great! Let's move to the next step.",
          prompt: this.getNextPrompt()
        };
      } else {
        return {
          response: "Sorry, I couldn`t understand that. Please provide a valid input.",
          prompt: this.getNextPrompt()
        };
      }
    }
    
    // Default responses
    const responses = {
      'greet': [
        "Hi there! I can help you create a professional portfolio.",
        "Hello! Ready to build an impressive portfolio?"
      ],
      'help': [
        "I'll guide you through creating a portfolio step by step.",
        "Just type 'create portfolio' and I'll help you build it!"
      ],
      'unknown': [
        "I'm not sure what you mean. Type 'create portfolio' to start.",
        "Can you rephrase that? I'm here to help you create a portfolio."
      ]
    };
    
    return {
      response: responses[intent] ? 
        responses[intent][Math.floor(Math.random() * responses[intent].length)] : 
        responses['unknown'][0]
    };
  }
}

const AgentNLP = ({ userData }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [nlpBot] = useState(() => new PortfolioNLPBot(userData.id));
  const [currentStep, setCurrentStep] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const scrollAreaRef = useRef(null);
  const lastMessageRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice Recognition Setup
  useEffect(() => {
    // Check browser support for speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setMessage(prev => prev + ' ' + transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Toggle Voice Typing
  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // File Upload Handling
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    const uploadPromises = files.map(async (file) => {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 5MB.`);
        return null;
      }
  
      try {
        // Ensure bucket exists (optional, as you should create it in Supabase dashboard)
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('portfolio-uploads');
        
        if (bucketError) {
          console.error('Bucket check error:', bucketError);
          alert('Storage bucket is not configured. Please contact support.');
          return null;
        }
  
        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('portfolio_uploads')
          .upload(fileName, file);
  
        if (error) {
          console.error('Upload specific error:', error);
          throw error;
        }
  
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('portfolio_uploads')
          .getPublicUrl(fileName);
  
        return {
          name: file.name,
          url: urlData.publicUrl,
          type: file.type
        };
      } catch (error) {
        console.error('Comprehensive upload error:', error);
        alert(`Failed to upload ${file.name}. Please check your storage configuration.`);
        return null;
      }
    });
  
    const uploadedFileResults = await Promise.all(uploadPromises);
    const validFiles = uploadedFileResults.filter(file => file !== null);
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove uploaded file
  const removeFile = (fileToRemove) => {
    setUploadedFiles(prev => 
      prev.filter(file => file.url !== fileToRemove.url)
    );
  };

  const addMessage = (text, files, sender, step = null) => {
    setMessages(prev => [...prev, { text, files, sender }]);
    if (step) setCurrentStep(step);
    
    // Scroll to bottom after messages update
    setTimeout(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    // Stop voice typing if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  
    if (message.trim() || uploadedFiles.length > 0) {
      // Add user message
      addMessage(message.trim(), uploadedFiles, 'user');
  
      // Process message with NLP Bot
      const botResponse = await nlpBot.processMessage(message);
      
      // Add bot response
      if (botResponse.response) {
        addMessage(botResponse.response, [], 'bot');
      }
      
      // If there's a prompt (current step), add it as a separate bot message
      if (botResponse.prompt) {
        addMessage(`Current Step: ${botResponse.prompt}`, [], 'bot');
      }
      
      // Clear input and files
      setMessage('');
      setUploadedFiles([]);
    }
  };


  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-16">
      <div className="flex-1 flex container min-w-3x1 mx-auto px-4 py-4 max-w-4xl w-full">
        <Card className="w-full flex flex-col shadow-lg rounded-xl overflow-hidden relative">
          {/* Header - Fixed */}
          <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 py-4 px-6 sticky top-0 z-10">
            <div className="flex flex-col items-center text-center space-y-2">
              <h1 className="text-2xl font-bold text-violet-800 dark:text-white tracking-tight">
                Welcome back {userData?.fullname}!, Need any Assistance?
              </h1>
            </div>
          </CardHeader>

          {/* Message Area - Scrollable */}
          <CardContent className="flex-1 overflow-hidden p-0 relative">
            <div className="h-full overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={`flex mb-4 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div 
                    className={`
                      max-w-[85%] p-3 rounded-lg text-left break-words
                      ${msg.sender === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                      }
                    `}
                  >
                    {msg.sender === 'bot' && (
                      <Bot className="w-5 h-5 mr-2 inline-block text-purple-400" />
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* File Upload Preview */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex items-center"
                  >
                    <span className="mr-2 text-sm truncate max-w-[150px]">{file.name}</span>
                    <button 
                      onClick={() => removeFile(file)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer - Fixed */}
          <CardFooter className="sticky bottom-0 z-10 p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSend} className="w-full">
              <div className="flex flex-col space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      setMessage(prev => prev + '\n');
                    } else if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="How can I help you? Type here..."
                  rows="3"
                  className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none max-h-48 overflow-y-auto text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileUp className="w-6 h-6 text-gray-600 dark:text-gray-300 hover:text-purple-600" />
                      <input 
                        id="file-upload"
                        type="file" 
                        multiple 
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    <button 
                      type="button" 
                      onClick={toggleVoiceTyping}
                      className={`
                        ${isListening 
                          ? 'text-red-500 hover:text-red-700' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                        }
                      `}
                    >
                      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 
                      bg-purple-600 text-white rounded-lg 
                      hover:bg-purple-700 transition-colors 
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// PropTypes for type checking
AgentNLP.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    fullname: PropTypes.string
  })
};

export default AgentNLP;