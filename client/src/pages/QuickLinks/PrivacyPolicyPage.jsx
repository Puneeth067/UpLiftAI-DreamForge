import { 
  Lock, 
  ShieldCheck, 
  Database, 
  FileText,    
  BookOpen, 
  Mail, 
  CookieIcon 
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Privacy Policy
      </h1>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8 flex items-center">
        <Lock className="mr-4 text-indigo-600 dark:text-indigo-400" size={48} />
        <p className="text-gray-700 dark:text-gray-300">
          At DreamForge, we are committed to protecting your personal information and ensuring your privacy.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <Database className="mr-2" size={24} />
          1. Information We Collect
        </h2>
        <div className="text-gray-700 dark:text-gray-300 text-left space-y-4">
          <p>We collect information to provide and improve our services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personal identification information (name, email, profile details)</li>
            <li>Professional information for creators and patrons</li>
            <li>Communication and interaction data on the platform</li>
            <li>Payment and transaction information</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <FileText className="mr-2" size={24} />
          2. How We Use Your Information
        </h2>
        <div className="text-gray-700 text-left dark:text-gray-300 space-y-4">
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and manage user accounts</li>
            <li>Facilitate project matching and communication</li>
            <li>Process payments and subscriptions</li>
            <li>Improve platform features and user experience</li>
            <li>Send important notifications and updates</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <BookOpen className="mr-2" size={24} />
          3. Information Sharing
        </h2>
        <div className="text-gray-700 text-left dark:text-gray-300 space-y-4">
          <p>
            We do not sell your personal data. We may share information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers necessary for platform operations</li>
            <li>Payment processors for transaction handling</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <ShieldCheck className="mr-2" size={24} />
          4. Data Protection and Security
        </h2>
        <div className="text-gray-700 text-left dark:text-gray-300 space-y-4">
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure cloud storage with access controls</li>
            <li>Regular security audits and updates</li>
            <li>Multi-factor authentication options</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <Mail className="mr-2" size={24} />
          5. User Rights
        </h2>
        <div className="text-gray-700 dark:text-gray-300 text-left space-y-4">
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt-out of non-essential communications</li>
            <li>Export your personal data</li>
          </ul>
          <p>
            To exercise these rights, please contact our support team at 
            <a 
              href="mailto:uplift.ai.tech@gmail.com" 
              className="text-indigo-600 dark:text-indigo-400 ml-2 hover:underline"
            >
              uplift.ai.tech@gmail.com
            </a>
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <CookieIcon className="mr-2" size={24} />
          6. Cookies and Tracking
        </h2>
        <div className="text-gray-700 dark:text-gray-300 text-left space-y-4">
          <p>
            We use cookies and similar tracking technologies to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Improve user experience</li>
            <li>Analyze platform usage</li>
            <li>Personalize content and recommendations</li>
          </ul>
          <p>
            You can manage cookie preferences through your browser settings.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <Lock className="mr-2" size={24} />
          7. Children`s Privacy
        </h2>
        <p className="text-gray-700 text-left dark:text-gray-300">
          DreamForge is not intended for children under 13. We do not knowingly collect personal information from children under 13.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
          <BookOpen className="mr-2" size={24} />
          8. Changes to Privacy Policy
        </h2>
        <p className="text-gray-700 text-left dark:text-gray-300">
          We may update this privacy policy periodically. Users will be notified of significant changes via email or platform notifications.
        </p>
      </section>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Last Updated: September 20, 2024
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Questions? Contact us at 
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

export default PrivacyPolicyPage;