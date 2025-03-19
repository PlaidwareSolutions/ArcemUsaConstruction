import { useEffect } from 'react';
import { scrollToTop } from '@/lib/utils';

const PrivacyPolicy = () => {
  useEffect(() => {
    scrollToTop();
    document.title = 'Privacy Policy - ARCEM';
  }, []);

  return (
    <div className="bg-white py-32">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-montserrat font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">1. Introduction</h2>
            <p>ARCEM ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">2. The Data We Collect About You</h2>
            <p>Personal data means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, title.</li>
              <li><strong>Contact Data</strong> includes email address, telephone numbers, and physical address.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
              <li><strong>Marketing and Communications Data</strong> includes your preferences in receiving marketing from us and our third parties and your communication preferences.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">3. How We Use Your Personal Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">5. Data Retention</h2>
            <p>We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">6. Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">7. Cookie Policy</h2>
            <p>Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">8. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
            <p className="mt-4">
              <strong>Email:</strong> aj@arcemusa.com<br />
              <strong>Phone:</strong> (713) 624-0083<br />
              <strong>Address:</strong> 215 Birch Hill Dr, Sugar Land, TX 77479
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;