import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <main className="privacy-policy-container">
      <div className="container">
        <div className="privacy-policy-content">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              Shanghai Tour Guide ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our website and services.
            </p>
            <p>
              By using our services, you agree to the collection and use of information in accordance 
              with this policy. If you do not agree with our policies and practices, please do not use 
              our services.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide to Us</h3>
            <ul>
              <li><strong>Account Information:</strong> When you register for an account, we collect your email address, password (encrypted), name, and phone number (optional).</li>
              <li><strong>Order Information:</strong> When you place an order, we collect shipping addresses, recipient names, contact information, and payment-related information.</li>
              <li><strong>Profile Information:</strong> You may provide additional information in your user profile, including shipping addresses and preferences.</li>
              <li><strong>Communications:</strong> If you contact us, we may collect information such as your name, email address, and the content of your message.</li>
            </ul>

            <h3>2.2 Information Automatically Collected</h3>
            <ul>
              <li><strong>Usage Data:</strong> We collect information about how you access and use our services, including IP address, browser type, device information, pages visited, and time spent on pages.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track activity on our website and store certain information.</li>
              <li><strong>Log Data:</strong> Our servers automatically record information when you access our services, including your IP address, browser type, referring pages, and timestamps.</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To provide, maintain, and improve our services</li>
              <li>To process and fulfill your orders</li>
              <li>To manage your account and provide customer support</li>
              <li>To send you order confirmations, updates, and shipping notifications</li>
              <li>To communicate with you about products, services, promotions, and events</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and enforce our terms of service</li>
              <li>To analyze usage patterns and improve user experience</li>
              <li>To personalize your experience and provide relevant content</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Storage and Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction. 
              However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            <ul>
              <li>Passwords are encrypted using industry-standard hashing algorithms (bcrypt)</li>
              <li>We use secure HTTPS connections for data transmission</li>
              <li>Access to personal data is restricted to authorized personnel only</li>
              <li>We regularly review and update our security practices</li>
            </ul>
            <p>
              Your data is stored on secure servers. We retain your personal information for as long as 
              necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention 
              period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2>5. Data Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            
            <h3>5.1 Service Providers</h3>
            <p>
              We may share information with third-party service providers who perform services on our behalf, 
              such as payment processing, shipping, data analysis, email delivery, and hosting services. 
              These service providers are contractually obligated to protect your information and use it 
              only for the purposes we specify.
            </p>

            <h3>5.2 Business Transfers</h3>
            <p>
              If we are involved in a merger, acquisition, or asset sale, your personal information may 
              be transferred as part of that transaction.
            </p>

            <h3>5.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required to do so by law or in response to valid requests 
              by public authorities (e.g., court orders, government agencies).
            </p>

            <h3>5.4 With Your Consent</h3>
            <p>
              We may share your information with your explicit consent or at your direction.
            </p>
          </section>

          <section>
            <h2>6. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to processing of your personal information</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" 
              section below. We will respond to your request within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist 
              in marketing efforts. You can control cookies through your browser settings. However, disabling 
              cookies may limit your ability to use certain features of our services.
            </p>
            <p><strong>Types of cookies we use:</strong></p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            </ul>
          </section>

          <section>
            <h2>8. Third-Party Services</h2>
            <p>
              Our services may contain links to third-party websites or integrate with third-party services. 
              We are not responsible for the privacy practices of these third parties. We encourage you to 
              review their privacy policies before providing any information.
            </p>
            <p>
              We may use third-party services for payment processing, analytics, and other functions. These 
              services have their own privacy policies governing the collection and use of your information.
            </p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not intended for children under the age of 13 (or the applicable age of 
              majority in your jurisdiction). We do not knowingly collect personal information from children. 
              If you believe we have collected information from a child, please contact us immediately, 
              and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of 
              residence. These countries may have data protection laws that differ from those in your country. 
              By using our services, you consent to the transfer of your information to these countries.
            </p>
          </section>

          <section>
            <h2>11. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined 
              in this Privacy Policy, unless a longer retention period is required or permitted by law. 
              When we no longer need your information, we will securely delete or anonymize it.
            </p>
            <p>
              Account information is retained while your account is active. Order information is retained 
              for a reasonable period after order completion to comply with legal obligations and resolve 
              disputes.
            </p>
          </section>

          <section>
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage 
              you to review this Privacy Policy periodically for any changes.
            </p>
            <p>
              Your continued use of our services after changes become effective constitutes acceptance of the 
              updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@shanghaitourguide.com</p>
              <p><strong>Website:</strong> <a href="/">www.shanghaitourguide.com</a></p>
            </div>
            <p>
              We will respond to your inquiry within a reasonable timeframe and in accordance with applicable 
              data protection laws.
            </p>
          </section>

          <section>
            <h2>14. Compliance</h2>
            <p>
              This Privacy Policy is designed to comply with applicable data protection laws, including but 
              not limited to:
            </p>
            <ul>
              <li>General Data Protection Regulation (GDPR) - European Union</li>
              <li>California Consumer Privacy Act (CCPA) - United States</li>
              <li>Personal Information Protection and Electronic Documents Act (PIPEDA) - Canada</li>
              <li>Other applicable regional and national data protection laws</li>
            </ul>
          </section>

          <div className="privacy-footer">
            <Link to="/" className="back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
