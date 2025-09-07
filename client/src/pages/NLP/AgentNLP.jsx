import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Send, Mic, MicOff, FileUp, X, Brain } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import LoadingScreen from "@/components/ui/loading";

// Enhanced NLP Features for the working bot
class EnhancedPortfolioNLPBot {
  constructor({userData}) {
    this.userData = userData || {};

    // Enhanced intents with more patterns
    this.intents = {
      'greet': ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'howdy'],
      'create_portfolio': [
        'create portfolio', 'make portfolio', 'build portfolio', 'portfolio', 
        'new portfolio', 'start portfolio', 'yes', 'ok', 'create', 'let\'s start',
        'begin portfolio', 'setup portfolio', 'build profile'
      ],
      'help': ['help', 'assistance', 'guide me', 'how does this work', 'support', 'instructions'],
      'examples': ['examples', 'show me examples', 'format examples', 'sample', 'template'],
      'exit': ['exit', 'quit', 'stop', 'cancel']
    };
    
    this.portfolio_steps = ['bio', 'skills', 'projects', 'experience', 'social_links'];
    this.portfolio_data = {};

    this.social_platforms = ['github', 'twitter', 'linkedin', 'instagram'];
    this.current_social_platform = null;
    this.current_step = null;

    // Enhanced validation patterns
    this.validationPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/g,
      skills: /\b(javascript|python|react|node|html|css|java|c\+\+|php|sql|mongodb)\b/gi,
      username: /^[a-zA-Z0-9._-]+$/
    };
  }

  // Enhanced intent recognition with confidence scoring
  recognizeIntent(message) {
    message = message.toLowerCase();
    let bestIntent = 'unknown';
    let highestScore = 0;

    for (let [intent, triggers] of Object.entries(this.intents)) {
      let score = 0;
      for (let trigger of triggers) {
        if (message.includes(trigger)) {
          // Exact match gets higher score
          if (message === trigger) {
            score += 1.0;
          } else if (message.startsWith(trigger) || message.endsWith(trigger)) {
            score += 0.8;
          } else {
            score += 0.6;
          }
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestIntent = intent;
      }
    }

    return { intent: bestIntent, confidence: highestScore };
  }

  // Enhanced info extraction with validation
  extractInfo(message) {
    message = message.trim();
    
    switch (this.current_step) {
      case 'bio':
        return this.extractBio(message);
      case 'skills':
        return this.extractSkills(message);
      case 'projects':
        return this.extractProject(message);
      case 'experience':
        return this.extractExperience(message);
      case 'social_links':
        return this.extractSocialLink(message);
      default:
        return null;
    }
  }

  extractBio(message) {
    const words = message.split(' ').filter(word => word.length > 0);
    if (words.length < 10) {
      return {
        valid: false,
        feedback: `Your bio needs more detail (${words.length} words, minimum 10). Tell me about your background, skills, and interests.`,
        suggestions: ['Add more details', 'Include your skills', 'Mention your goals']
      };
    }

    // Check if user chose "Continue anyway"
    const messageLower = message.toLowerCase();
    if (messageLower.includes('continue anyway') || messageLower.includes('continue') || 
        messageLower.includes('anyway') || messageLower.includes('skip')) {
      return { valid: true, data: message.replace(/continue anyway|continue|anyway|skip/gi, '').trim() };
    }

    // Very basic check - if it's 15+ words, assume it's detailed enough
    if (words.length >= 15) {
      return { valid: true, data: message };
    }

    // Otherwise suggest improvement but allow bypass
    return {
      valid: false,
      feedback: 'Consider adding more details about your background or interests to make your bio more engaging.',
      suggestions: ['Add more details', 'Mention your field', 'Include interests', 'Continue anyway']
    };
  }

  extractSkills(message) {
    const skills = message.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    if (skills.length === 0) {
      return {
        valid: false,
        feedback: 'Please list your skills separated by commas. For example: "JavaScript, React, Python, Design"',
        suggestions: ['Technical skills', 'Soft skills', ]
      };
    }

    if (skills.length < 3) {
      return {
        valid: false,
        feedback: `Add more skills to showcase your abilities (currently ${skills.length}, recommended minimum 3).`,
        suggestions: ['Add technical skills', 'Add soft skills', 'Continue with current']
      };
    }

    return { valid: true, data: skills };
  }

  extractProject(message) {
    if (message.toLowerCase() === 'done') {
      if (!this.portfolio_data.projects || this.portfolio_data.projects.length === 0) {
        return {
          valid: false,
          feedback: 'Add at least one project before proceeding.',
          suggestions: ['Add project', 'Skip projects']
        };
      }
      return { valid: true, data: 'done' };
    }

    const projectParts = message.split('|');
    if (projectParts.length < 2) {
      return {
        valid: false,
        feedback: 'Please use the format: "Project Title | Project Description". Include what you built and technologies used.',
        suggestions: ['Try again', 'Get format help']
      };
    }

    const title = projectParts[0].trim();
    const description = projectParts[1].trim();

    if (title.length < 3 || description.length < 20) {
      return {
        valid: false,
        feedback: 'Project title should be at least 3 characters and description at least 20 characters.',
        suggestions: ['Add more detail', 'Expand description', ]
      };
    }

    return {
      valid: true,
      data: {
        title,
        description,
        image: '/api/placeholder/600/400'
      }
    };
  }

  extractExperience(message) {
    if (message.toLowerCase() === 'done') {
      return { valid: true, data: 'done' };
    }

    const expParts = message.split('|');
    if (expParts.length < 4) {
      return {
        valid: false,
        feedback: 'Please use the format: "Job Title | Company | Duration | Description"',
        suggestions: ['Try again', 'Get format help']
      };
    }

    return {
      valid: true,
      data: {
        role: expParts[0].trim(),
        company: expParts[1].trim(),
        period: expParts[2].trim(),
        description: expParts[3].trim()
      }
    };
  }

  extractSocialLink(message) {
    // If no platform is currently being asked, start with the first platform
    if (!this.current_social_platform) {
      this.current_social_platform = this.social_platforms[0];
      return {
        valid: false,
        prompt: `Please enter your ${this.current_social_platform} username`,
        platform: this.current_social_platform
      };
    }

    // Validate the input
    const trimmedMessage = message.trim();
    if (!this.validationPatterns.username.test(trimmedMessage)) {
      return {
        valid: false,
        prompt: `Invalid username. Please enter a valid username for ${this.current_social_platform} (letters, numbers, underscore, or hyphen)`,
        platform: this.current_social_platform
      };
    }

    // Store the social username
    this.portfolio_data.social_links = this.portfolio_data.social_links || {};
    this.portfolio_data.social_links[this.current_social_platform] = trimmedMessage;

    // Move to next platform
    const currentIndex = this.social_platforms.indexOf(this.current_social_platform);
    if (currentIndex < this.social_platforms.length - 1) {
      this.current_social_platform = this.social_platforms[currentIndex + 1];
      return {
        valid: false,
        prompt: `Great! Now, please enter your ${this.current_social_platform} username`,
        platform: this.current_social_platform
      };
    } else {
      // All platforms collected
      this.current_social_platform = null;
      return { valid: true, data: this.portfolio_data.social_links };
    }
  }

  async validateAndStore(info) {
    if (!info || !info.valid) return false;

    switch (this.current_step) {
      case 'bio':
        this.portfolio_data.bio = info.data;
        break;
      case 'skills':
        this.portfolio_data.skills = info.data;
        break;
      case 'projects':
        if (info.data === 'done') {
          return true;
        }
        this.portfolio_data.projects = this.portfolio_data.projects || [];
        this.portfolio_data.projects.push(info.data);
        return false; // Stay in projects step
      case 'experience':
        if (info.data === 'done') {
          return true;
        }
        this.portfolio_data.experience = this.portfolio_data.experience || [];
        this.portfolio_data.experience.push(info.data);
        return false; // Stay in experience step
      case 'social_links':
        // Save to Supabase at the final step
        if (Object.keys(this.portfolio_data.social_links).length === 4) {
          try {
            const success = await this.saveToSupabase();
            if (success) {
              return 'portfolio_completed';
            } else {
              return 'save_error';
            }
          } catch (error) {
            console.error("Unexpected error:", error);
            return 'save_error';
          }
        }
        break;
    }
    return true;
  }

  async saveToSupabase() {
    try {
      const userId = this.userData?.id || this.userData?.user?.id || this.userData?.userId;

      if (!userId) {
        console.error("No user ID available for saving portfolio");
        return false;
      }

      const portfolioData = {
        user_id: userId,
        title: this.portfolio_data.bio ? "Professional Portfolio" : "",
        bio: this.portfolio_data.bio || "",
        skills: this.portfolio_data.skills || [],
        experience: this.portfolio_data.experience || [],
        projects: this.portfolio_data.projects || [],
        social_links: {
          github: this.portfolio_data.social_links?.github || "",
          twitter: this.portfolio_data.social_links?.twitter || "",
          linkedin: this.portfolio_data.social_links?.linkedin || "",
          instagram: this.portfolio_data.social_links?.instagram || ""
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("Saving portfolio:", portfolioData);

      const { error } = await supabase
        .from("portfolio")
        .upsert(portfolioData);
      
      if (error) {
        console.error("Supabase error:", error);
        return false;
      }

      console.log("Portfolio saved successfully!");
      return true;
    } catch (e) {
      console.error("Error saving portfolio:", e);
      return false;
    }
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
      'bio': "📝 **Write your bio** (minimum 10 words)\nExample: \"I'm a passionate software developer with 3 years of experience creating user-friendly applications.\"",
      'skills': "🛠️ **List your skills** (separated by commas)\nExample: \"JavaScript, React, Python, Node.js, Problem Solving\"",
      'projects': "🚀 **Add a project** (Format: Title | Description)\nExample: \"E-commerce Website | Built a full-stack online store using React and Node.js\"",
      'experience': "💼 **Add work experience** (Format: Role | Company | Duration | Description)\nExample: \"Frontend Developer | TechCorp | 2 years | Developed responsive web applications\"",
      'social_links': "🔗 **Add your social profiles**\nI'll guide you through each platform step by step."
    };

    return prompts[this.current_step];
  }

  getExamples(step) {
    const examples = {
      bio: [
        "I'm a passionate full-stack developer with 3 years of experience building web applications.",
        "Computer Science student with expertise in machine learning and data analysis.",
        "Creative UI/UX designer who loves crafting beautiful and intuitive user experiences."
      ],
      skills: [
        "JavaScript, React, Node.js, MongoDB, Git",
        "Python, Machine Learning, TensorFlow, Data Analysis",
        "Figma, Adobe Creative Suite, Prototyping, User Research"
      ],
      projects: [
        "E-commerce Platform | Built a full-stack online store with payment integration using React and Node.js",
        "Weather App | Developed a responsive weather application using OpenWeather API and vanilla JavaScript",
        "Portfolio Website | Created a personal portfolio showcasing projects with modern design principles"
      ],
      experience: [
        "Frontend Developer | WebTech Solutions | 2 years | Developed responsive websites and improved user experience",
        "Intern Software Engineer | StartupXYZ | 6 months | Contributed to mobile app development using React Native",
        "Freelance Designer | Self-employed | 1 year | Created brand identities and marketing materials for small businesses"
      ]
    };
    
    return examples[step] || [];
  }

  async processMessage(message) {
    const intentResult = this.recognizeIntent(message);
    const { intent, confidence } = intentResult;

    // Portfolio workflow takes HIGHEST priority - check this FIRST
    if (this.current_step || intent === 'create_portfolio') {
      if (!this.current_step) {
        return {
          response: `🎯 **Let's create your professional portfolio!** 
          
I'll guide you through each step with feedback and suggestions. Ready to showcase your skills and experience?
          
*Follow the instructions carefully for the best results. You can always ask for examples or help!*`,
          prompt: this.getNextPrompt(),
          suggestions: ['Start Now', 'Get Help']
        };
      }

      const info = this.extractInfo(message);

      if (!info.valid) {
        return {
          response: info.feedback || info.prompt,
          suggestions: info.suggestions || ['Try Again', 'Get Help'],
          prompt: this.current_step === 'social_links' ? null : this.getNextPrompt()
        };
      }

      const storeResult = await this.validateAndStore(info);

      if (storeResult === 'portfolio_completed') {
        this.current_step = null;
        this.portfolio_data = {};
        return {
          response: "🎉 **Portfolio created successfully!** Your professional portfolio has been saved and is ready to showcase your skills and experience.",
          completed: true,
          suggestions: ['View Portfolio', 'Create Another', 'Get Help']
        };
      } else if (storeResult === 'save_error') {
        return {
          response: "❌ There was an error saving your portfolio. Please try again or contact support.",
          suggestions: ['Try Again', 'Contact Support', 'Get Help']
        };
      } else if (storeResult) {
        this.moveToNextStep();

        if (this.current_step === null) {
          return {
            response: "✅ All sections completed! Saving your portfolio...",
            suggestions: ['Please Wait...']
          };
        }

        const completedSteps = this.portfolio_steps.indexOf(this.current_step);
        const progress = Math.round((completedSteps / this.portfolio_steps.length) * 100);

        return {
          response: `✅ **Great!** Moving to the next step... (${progress}% complete)`,
          prompt: this.getNextPrompt(),
          progress: { current: completedSteps + 1, total: this.portfolio_steps.length, percentage: progress },
          suggestions: ['Continue', 'Get Help']
        };
      } else {
        const count = this.current_step === 'projects' ? 
          (this.portfolio_data.projects?.length || 0) :
          (this.portfolio_data.experience?.length || 0);
        
        return {
          response: `✅ **Added!** You now have ${count + 1} ${this.current_step}. Add another or type "done" to continue.`,
          suggestions: [`Add Another ${this.current_step.slice(0, -1)}`, 'Done', ]
        };
      }
    }

    // Only check other intents if NOT in portfolio workflow
    if (intent === 'greet' && confidence > 0.5) {
      const greetings = [
        `Hello ${this.userData?.fullname || 'there'}! 👋 I'm your Assistant, DreamForge. I can help you create a professional portfolio with guidance.`,
        `Hi ${this.userData?.fullname || 'there'}! 🚀 Ready to build an impressive portfolio? I'll guide you through each step with smart suggestions.`,
        `Welcome ${this.userData?.fullname || 'back'}! ✨ I'm here to help you create a standout portfolio that showcases your unique skills.`
      ];
      return {
        response: greetings[Math.floor(Math.random() * greetings.length)],
        suggestions: ['Create Portfolio', 'Get Help', ]
      };
    }

    if (intent === 'examples' && confidence > 0.5) {
      const step = this.current_step || 'bio';
      const examples = this.getExamples(step);
      return {
        response: `Here are some examples for ${step}:\n\n${examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n\n')}`,
        suggestions: ['Create Portfolio', 'Get Help', 'Continue']
      };
    }

    if (intent === 'help') {
      return {
        response: `🤖 **I'm here to help!** Here's what I can do:

📝 **Portfolio Creation** - Step-by-step guidance through bio, skills, projects, and experience
💡 **Smart Suggestions** - I provide examples and tips for each section
🔍 **Intelligent Validation** - I check your input and give helpful feedback

Just say "create portfolio" to get started!`,
        suggestions: ['Create Portfolio', 'Ask Question']
      };
    }

    const suggestions = ['Create Portfolio', 'Get Help', ];
    
    if (confidence < 0.3) {
      return {
        response: `I'm not sure what you're looking for. Here are some things I can help with:`,
        suggestions
      };
    }

    return {
      response: "I'm here to help you create an amazing portfolio! What would you like to do?",
      suggestions
    };
  }
}

const AgentNLP = ({ userData }) => {
  const [nlpBot] = useState(() => new EnhancedPortfolioNLPBot({ userData }));
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${userData?.fullname || 'there'}! 👋 I'm your Assistant, DreamForge. I provide guidance for creating portfolios. How can I help you today?`,
      sender: 'bot',
      timestamp: Date.now(),
      suggestions: ['Create Portfolio', 'Get Help', ]
    }
  ]);
  const [currentStep] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(null);
  const lastMessageRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice Recognition Setup
  useEffect(() => {
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
        
        setMessage(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        addMessage('Speech recognition error. Please try typing instead.', [], 'system');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) {
      addMessage('Voice recognition not supported in this browser. Please use Chrome or Edge.', [], 'system');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        addMessage('Could not start voice recognition. Please check microphone permissions.', [], 'system');
      }
    }
  };

  // File Upload Handling
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const uploadPromises = files.map(async (file) => {
      if (file.size > maxSize) {
        addMessage(`File "${file.name}" is too large (max 5MB).`, [], 'system');
        return null;
      }
  
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('portfolio_uploads')
          .upload(fileName, file);
  
        if (error) throw error;
  
        const { data: urlData } = supabase.storage
          .from('portfolio_uploads')
          .getPublicUrl(fileName);
  
        return {
          name: file.name,
          url: urlData.publicUrl,
          type: file.type
        };
      } catch (error) {
        console.error('Upload error:', error);
        addMessage(`Failed to upload "${file.name}": ${error.message}`, [], 'system');
        return null;
      }
    });
  
    const uploadedFileResults = await Promise.all(uploadPromises);
    const validFiles = uploadedFileResults.filter(file => file !== null);
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      addMessage(`Successfully uploaded ${validFiles.length} file(s)!`, validFiles, 'system');
    }
  };

  const removeFile = (fileToRemove) => {
    setUploadedFiles(prev => 
      prev.filter(file => file.url !== fileToRemove.url)
    );
  };

  const addMessage = (text, files = [], sender = 'user', metadata = {}) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      files,
      sender,
      timestamp: Date.now(),
      ...metadata
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    handleSend(null, suggestion);
  };

  const handleSend = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    
    const messageToSend = customMessage || message.trim();
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (!messageToSend && uploadedFiles.length === 0) return;

    addMessage(messageToSend, uploadedFiles, 'user');
    setMessage('');
    setUploadedFiles([]);
    setIsTyping(true);

    try {
      const botResponse = await nlpBot.processMessage(messageToSend);
      setIsTyping(false);

      if (botResponse.progress) {
        setProgress(botResponse.progress);
      }

      addMessage(
        botResponse.response, 
        [], 
        'bot', 
        {
          suggestions: botResponse.suggestions,
          prompt: botResponse.prompt,
          progress: botResponse.progress,
          completed: botResponse.completed
        }
      );

      if (botResponse.prompt) {
        setTimeout(() => {
          addMessage(botResponse.prompt, [], 'bot', { isPrompt: true });
        }, 500);
      }

    } catch (error) {
      setIsTyping(false);
      console.error('Error processing message:', error);
      addMessage('Sorry, I encountered an error. Please try again.', [], 'system');
    }
  };

  // Enhanced message rendering
  const renderMessage = (msg) => {
    const isUser = msg.sender === 'user';
    const isSystem = msg.sender === 'system';
    
    return (
      <div key={msg.id} className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
            {isUser ? (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {userData?.fullname?.charAt(0) || 'U'}
                </span>
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isSystem ? 'bg-accent' : 'bg-secondary'
              }`}>
                {isSystem ? '⚠️' : <Brain className="w-5 h-5 text-white" />}
              </div>
            )}
          </div>

          <div className="flex flex-col text-left">
            <div className={`p-4 rounded-2xl ${
              isUser 
                ? 'bg-primary text-white rounded-br-md' 
                : isSystem
                ? 'bg-surface text-foreground rounded-bl-md border border-accent/20'
                : 'bg-surface text-foreground rounded-bl-md border border-primary/20'
            }`}>
              <div className="whitespace-pre-wrap">
                {msg.text.split('\n').map((line, index) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={index} className="font-bold mb-2">{line.slice(2, -2)}</div>;
                  }
                  if (line.startsWith('🎯') || line.startsWith('📝') || line.startsWith('🛠️') || line.startsWith('🚀') || line.startsWith('💼') || line.startsWith('🔗')) {
                    return <div key={index} className="font-semibold text-lg mb-2">{line}</div>;
                  }
                  return <div key={index} className="mb-1">{line}</div>;
                })}
              </div>

              {msg.files && msg.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.files.map((file, index) => (
                    <div key={index} className="flex items-center p-2 bg-black/10 rounded">
                      <FileUp className="w-4 h-4 mr-2" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {msg.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {msg.progress && (
              <div className="mt-3 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Portfolio Progress</span>
                  <span className="text-sm text-foreground/70">{msg.progress.percentage}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 border border-primary/20">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${msg.progress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  Step {msg.progress.current} of {msg.progress.total}
                </div>
              </div>
            )}

            <div className="text-xs text-foreground/50 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isTyping && !messages.some(m => m.sender === 'bot')) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-16">
      <div className="flex-1 flex container min-w-3xl mx-auto px-4 py-4 max-w-4xl w-full">
        <Card className="w-full flex flex-col shadow-lg rounded-xl overflow-hidden relative bg-surface border-primary/20">
          {/* Enhanced Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white border-b border-primary/20 py-4 px-6 sticky top-0 z-10">
            <div className="flex flex-col items-start text-left space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                <h1 className="text-2xl font-bold tracking-tight">
                  DreamForge Assistant
                </h1>
                <div className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  NLP Powered
                </div>
              </div>
              <p className="text-white/80 text-sm">
                Welcome back {userData?.fullname}!
              </p>
              {progress && (
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Portfolio Creation</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          {/* Message Area */}
          <CardContent className="flex-1 overflow-hidden p-0 bg-background relative">
            <div className="h-full overflow-y-auto px-6 py-4 space-y-4">
              {messages.map(renderMessage)}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-center">
                    <Brain className="w-8 h-8 mr-3 text-secondary" />
                    <div className="p-3 bg-surface border border-secondary/20 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={lastMessageRef} />
            </div>
          </CardContent>

          {/* File Upload Preview */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 pb-4 bg-surface border-t border-primary/20">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="bg-background p-3 rounded-lg flex items-center shadow-sm border border-accent/20"
                  >
                    <FileUp className="w-4 h-4 mr-2 text-secondary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[150px] text-foreground">{file.name}</span>
                      <span className="text-xs text-foreground/60">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button 
                      onClick={() => removeFile(file)}
                      className="ml-2 text-accent hover:text-accent-hover transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <CardFooter className="sticky bottom-0 z-10 p-6 bg-surface border-t border-primary/20">
            <form onSubmit={handleSend} className="w-full">
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        return;
                      } else if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder={
                      currentStep 
                        ? `Working on ${currentStep}... Type your response here`
                        : "Ask me anything about creating portfolios..."
                    }
                    rows="3"
                    className="w-full p-4 pr-12 bg-background border-2 border-primary/20 rounded-xl resize-none max-h-48 overflow-y-auto text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {isListening && (
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-xs text-accent font-medium">Listening...</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <label htmlFor="file-upload" className="cursor-pointer group">
                      <FileUp className="w-6 h-6 text-foreground/60 group-hover:text-primary transition-colors" />
                      <input 
                        id="file-upload"
                        type="file" 
                        multiple 
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,application/pdf,.txt,.doc,.docx"
                      />
                    </label>

                    <button 
                      type="button" 
                      onClick={toggleVoiceTyping}
                      className={`group transition-colors ${
                        isListening 
                          ? 'text-accent hover:text-accent-hover' 
                          : 'text-foreground/60 hover:text-primary'
                      }`}
                    >
                      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!message.trim() && uploadedFiles.length === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      message.trim() || uploadedFiles.length > 0
                        ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-surface text-foreground/40 cursor-not-allowed border border-primary/20'
                    }`}
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

AgentNLP.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.string,
    fullname: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

export default AgentNLP;