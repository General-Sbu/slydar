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

export default function Terms() {
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
        <h1 className="text-4xl font-black mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Slydar ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, do not use the Service. These Terms apply to all visitors, 
              registered users, and anyone who accesses or uses the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Slydar is an interactive presentation platform that allows presenters to create and deliver 
              presentations featuring live polls, quizzes, word clouds, Q&A sessions, and other interactive 
              elements. Audience members can participate in presentations using a room code without requiring 
              an account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Accounts</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate and complete information when creating your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account at <strong className="text-foreground">support@slydar.com</strong>.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Infringe upon any intellectual property rights of others</li>
              <li>Upload malware, viruses, or other malicious code</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Use the Service for any illegal purpose or in violation of any regulations</li>
              <li>Scrape, crawl, or otherwise collect data from the Service without our express written permission</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Content</h2>
            <h3 className="text-lg font-semibold mb-2 mt-4">Your Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of all content you create or upload to the Service ("Your Content"). 
              By uploading content, you grant Slydar a worldwide, non-exclusive, royalty-free license to 
              host, store, reproduce, and display Your Content solely for the purpose of providing the Service.
            </p>
            <h3 className="text-lg font-semibold mb-2 mt-4">Public Library</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you publish a presentation to the public library, you grant other users the right to view 
              and use that presentation for their own presentations on the Service. You may remove your 
              presentation from the public library at any time.
            </p>
            <h3 className="text-lg font-semibold mb-2 mt-4">Our Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content (excluding Your Content) are and will remain the exclusive 
              property of Slydar. Our trademarks and trade dress may not be used in connection with any product 
              or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Subscription Plans and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Slydar offers both a free tier and a paid Basic plan (R199/month). The following terms apply to paid subscriptions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Payments are processed securely via PayFast in South African Rand (ZAR).</li>
              <li>Subscriptions renew automatically each month unless cancelled before the renewal date.</li>
              <li>You may cancel your subscription at any time from your account settings. Access continues until the end of the billing period.</li>
              <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
              <li>Refunds are handled on a case-by-case basis. Contact <strong className="text-foreground">billing@slydar.com</strong> for refund requests.</li>
              <li>We are not responsible for any fees charged by your bank or payment provider.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. AI Features</h2>
            <p className="text-muted-foreground leading-relaxed">
              Slydar provides AI-powered slide generation features. By using these features, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>AI-generated content may not always be accurate, complete, or appropriate for your use case.</li>
              <li>You are responsible for reviewing and editing AI-generated content before use.</li>
              <li>Free accounts are limited to 2 AI generations per day; Basic plan users have unlimited generations.</li>
              <li>Your prompts and generated content may be processed by third-party AI services (OpenAI) subject to their terms and policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. File Imports</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may import PPTX and PDF files into Slydar. By uploading files, you confirm that you have 
              the rights to the content within those files. File conversion is handled by ConvertAPI. 
              We are not responsible for any loss of formatting or content fidelity during the conversion process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">9. Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, 
              ERROR-FREE, OR COMPLETELY SECURE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE FULLEST EXTENT PERMITTED BY LAW, SLYDAR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
              DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING 
              FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to the Service at our sole discretion, 
              without notice, for conduct that we believe violates these Terms or is harmful to other users, 
              us, or third parties, or for any other reason. Upon termination, your right to use the Service 
              immediately ceases.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of South Africa, 
              without regard to its conflict of law provisions. Any disputes arising under these Terms shall 
              be subject to the exclusive jurisdiction of the courts of South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify registered users of 
              material changes via email or a notice on the Service. Your continued use of the Service after 
              any changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p><strong className="text-foreground">Email:</strong> legal@slydar.com</p>
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
