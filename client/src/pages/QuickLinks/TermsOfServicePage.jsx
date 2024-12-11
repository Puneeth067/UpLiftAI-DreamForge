import React from 'react';
import { ShieldCheck, FileText, BookOpen } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Terms of Service
      </h1>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8 flex items-center">
        <ShieldCheck className="mr-4 text-indigo-600 dark:text-indigo-400" size={48} />
        <p className="text-gray-700 dark:text-gray-300">
          By using DreamForge, you agree to these terms which govern your use of our platform.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <FileText className="mr-2" size={24} />
          1. User Responsibilities
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Provide accurate and up-to-date information in your profile</li>
          <li>Maintain professional conduct in all interactions</li>
          <li>Respect intellectual property rights of other users</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <BookOpen className="mr-2" size={24} />
          2. Platform Usage
        </h2>
        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          <p>
            DreamForge provides a platform for connecting creators and patrons. We do not directly participate in transactions between users and are not responsible for the quality, safety, or legality of services offered.
          </p>
          <p>
            Users are solely responsible for vetting potential collaborators, negotiating terms, and resolving disputes.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
          3. Payment and Fees
        </h2>
        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          <p>
            By using premium features, you agree to pay applicable subscription fees. All fees are non-refundable unless otherwise specified.
          </p>
          <p>
            Transaction fees may apply for payments processed through our platform. These fees are subject to change and will be clearly communicated.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
          4. Privacy
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Your use of the platform is also governed by our Privacy Policy. Please review it to understand how we collect, use, and protect your data.
        </p>
      </section>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">
          These terms are effective as of September 20, 2024. DreamForge reserves the right to modify these terms at any time.
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;