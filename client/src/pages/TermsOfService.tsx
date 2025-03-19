import { useEffect } from 'react';
import { scrollToTop } from '@/lib/utils';

const TermsOfService = () => {
  useEffect(() => {
    scrollToTop();
    document.title = 'Terms of Service - ARCEM';
  }, []);

  return (
    <div className="bg-white py-32">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-montserrat font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the ARCEM website ("Site"), you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using the Site's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">2. Description of Services</h2>
            <p>ARCEM provides users with access to construction services, project information, company resources, and other content through its network of properties (the "Service"). Unless explicitly stated otherwise, any new features that augment or enhance the current Service shall be subject to these Terms of Service.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">3. Modifications to Service</h2>
            <p>ARCEM reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that ARCEM shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">4. User Conduct</h2>
            <p>You agree to use the Service only for purposes that are permitted by these Terms and any applicable law, regulation or generally accepted practices in the relevant jurisdictions. You are responsible for all of your activity in connection with the Service.</p>
            <p className="mt-4">You shall not:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Defame, abuse, harass, stalk, threaten or otherwise violate the legal rights of others.</li>
              <li>Publish, post, upload, distribute or disseminate any inappropriate, profane, defamatory, infringing, obscene, indecent or unlawful topic, name, material or information.</li>
              <li>Upload files that contain software or other material protected by intellectual property laws unless you own or control the rights thereto or have received all necessary consents.</li>
              <li>Upload or distribute files that contain viruses, corrupted files, or any other similar software or programs that may damage the operation of another's computer.</li>
              <li>Conduct or forward surveys, contests, pyramid schemes or chain letters.</li>
              <li>Download any file posted by another user that you know, or reasonably should know, cannot be legally distributed in such manner.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">5. Content Ownership</h2>
            <p>ARCEM does not claim ownership of the materials you provide to the Service. However, with respect to content you submit or make available for inclusion on the Service, you grant ARCEM a worldwide, royalty-free and non-exclusive license to use, distribute, reproduce, modify, adapt, publicly perform and publicly display such content on the Service solely for the purpose of providing the Service.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">6. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">7. Limitation of Liability</h2>
            <p>IN NO EVENT SHALL ARCEM BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, REVENUE, DATA OR USE, INCURRED BY YOU OR ANY THIRD PARTY, WHETHER IN AN ACTION IN CONTRACT OR TORT, ARISING FROM YOUR ACCESS TO, OR USE OF, THE SERVICE.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">8. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without giving effect to any principles of conflicts of law. Any action arising out of or relating to these Terms shall be filed only in state or federal courts located in Harris County, Texas.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-montserrat font-bold mb-4">9. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
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

export default TermsOfService;