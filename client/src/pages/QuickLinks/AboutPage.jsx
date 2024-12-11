import React from 'react';
import { Award, Target, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        About DreamForge
      </h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
          Our Mission
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          DreamForge is a revolutionary platform designed to bridge the gap between creative talents and passionate patrons. We believe in breaking down barriers and creating meaningful connections that transform innovative ideas into reality.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
          <Target className="mx-auto mb-4 text-indigo-600 dark:text-indigo-400" size={48} />
          <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
          <p className="text-gray-600 dark:text-gray-400">
            To create a global ecosystem where creativity knows no boundaries and every talented creator finds their perfect opportunity.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
          <Award className="mx-auto mb-4 text-indigo-600 dark:text-indigo-400" size={48} />
          <h3 className="text-xl font-semibold mb-2">Our Values</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Transparency, innovation, collaboration, and empowerment drive everything we do.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
          <Globe className="mx-auto mb-4 text-indigo-600 dark:text-indigo-400" size={48} />
          <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connecting talents and patrons across different geographies, industries, and disciplines.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
          How We Work
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            DreamForge leverages cutting-edge technology to create a seamless collaboration platform. Our NLP-powered interface and intelligent matching system ensure that creators find the right projects, and patrons discover the perfect talent.
          </p>
          <p>
            We're not just a platform; we're a community committed to turning creative visions into tangible success stories.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;