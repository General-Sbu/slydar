import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

function Logo() {
  return (
    <Link href="/">
      <span className="text-2xl font-black tracking-tight cursor-pointer select-none">
        <span className="text-primary">Slyd</span>
        <span className="text-foreground">ar</span>
      </span>
    </Link>
  );
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Slydar ("we", "us", or "our"). We are committed to protecting your personal information and
              your right to privacy. This Privacy Policy describes how we collect, use, and share information about
              you when you use our platform at slydar.com (the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By using Slydar, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Account Information:</strong> When you register, we collect your name, email address, and password.</li>
              <li><strong className="text-foreground">Presentation Content:</strong> Slides, text, images, polls, and other content you create or upload.</li>
              <li><strong className="text-foreground">Audience Responses:</strong> Answers to polls, word cloud submissions, open-ended responses, and attendance records submitted during presentations.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our Service, including pages visited, features used, and session duration.</li>
              <li><strong className="text-foreground">Payment Information:</strong> Billing details processed securely through PayFast. We do not store your full card details.</li>
              <li><strong className="text-foreground">Communications:</strong> If you contact us for support, we retain that correspondence.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and send related information, including purchase confirmations</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Personalize your experience and deliver content relevant to your interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Sharing of Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Service Providers:</strong> With third-party vendors who assist us in operating our Service (e.g., cloud hosting, payment processing via PayFast, file conversion via ConvertAPI, AI features via OpenAI).</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> If required by law or in response to valid legal requests.</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition.</li>
              <li><strong className="text-foreground">With Your Consent:</strong> In any other case with your explicit consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Audience Participants</h2>
            <p className="text-muted-foreground leading-relaxed">
              Audience members who join presentations do not need to create an account. They participate anonymously by default. 
              Any responses (polls, word clouds, Q&A, attendance) are associated with an anonymous session identifier. 
              Attendance sheet responses may optionally include a name provided voluntarily by the participant. 
              This data is accessible to the presentation host and is retained for session analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account information and presentation data for as long as your account is active. 
              If you delete your account, we will delete or anonymize your personal data within 30 days, 
              except where we are required to retain it for legal or legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take reasonable measures to help protect information about you from loss, theft, misuse, 
              unauthorized access, disclosure, alteration, and destruction. Passwords are hashed using bcrypt. 
              However, no security system is impenetrable, and we cannot guarantee the security of our systems absolutely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use session cookies to keep you logged in and to maintain your preferences. 
              We do not use third-party advertising cookies. You may disable cookies in your browser settings, 
              but this may affect the functionality of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">9. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict our processing of your data</li>
              <li>Data portability</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise these rights, please contact us at <strong className="text-foreground">privacy@slydar.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not directed to children under the age of 13. We do not knowingly collect personal 
              information from children under 13. If we become aware that a child under 13 has provided us with 
              personal information, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page with an updated date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p><strong className="text-foreground">Email:</strong> privacy@slydar.com</p>
              <p><strong className="text-foreground">Website:</strong> slydar.com</p>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Slydar. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
