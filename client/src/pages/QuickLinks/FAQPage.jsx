import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How does DreamForge work?",
      answer: "DreamForge is a platform that connects creators with patrons. Creators can build comprehensive portfolios, and patrons can browse these portfolios to find suitable talent. The platform provides an NLP-powered chat interface to facilitate communication and project collaboration."
    },
    {
      question: "Is the platform free to use?",
      answer: "We offer both free and premium tiers. Basic features are available for free, while advanced features like detailed analytics, priority matching, and enhanced communication tools are part of our premium subscription."
    },
    {
      question: "How do I verify my skills as a creator?",
      answer: "DreamForge offers a skill verification system where creators can take tests, upload certifications, and showcase verified skills on their portfolios. This helps build credibility and trust with potential patrons."
    },
    {
      question: "What kind of projects can I find on DreamForge?",
      answer: "Our platform supports a wide range of creative projects across various domains including design, writing, programming, art, marketing, and more. Whether you're looking for a short-term gig or a long-term collaboration, you'll find diverse opportunities."
    },
    {
      question: "How does the payment system work?",
      answer: "We have an integrated payment system with an escrow feature to ensure fair payment distribution. Patrons can securely pay for projects, and creators are protected through our transparent payment workflow."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button 
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {faq.question}
              </span>
              {activeIndex === index ? (
                <ChevronUp className="text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronDown className="text-indigo-600 dark:text-indigo-400" />
              )}
            </button>
            {activeIndex === index && (
              <div className="p-4 bg-white text-left dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Have more questions? Contact our support team at 
          <a 
            href="mailto:uplift.ai.tech@gmail.com" 
            className="text-indigo-600 dark:text-indigo-400 ml-2 hover:underline"
          >
            uplift.ai.tech@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default FAQPage;