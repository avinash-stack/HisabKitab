import PageHeader from "@/components/PageHeader";

export default function Terms() {
  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Terms of Service" backButton />
      <div className="gradient-card rounded-xl p-6 border border-border mt-4">
        
        <div className="prose prose-sm dark:prose-invert text-muted-foreground w-full max-w-none">
          <h2 className="text-xl font-bold text-foreground mb-1">Terms & Conditions for HisabKitab</h2>
          <p className="text-xs font-medium text-muted-foreground mb-6">Effective Date: Apr 14, 2026</p>

          <p className="mb-4">
            Welcome to HisabKitab. By downloading, accessing, or using our mobile application, you agree to comply with and be bound by these Terms & Conditions.
          </p>
          <p className="mb-6 pb-4 border-b border-border/50">
            If you do not agree with these terms, please do not use the app.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">1. Use of the App</h3>
          <p className="mb-2">HisabKitab is designed for personal financial management, including:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Tracking income and expenses</li>
            <li>Managing loans and debts</li>
          </ul>
          <p className="mb-6 pb-4 border-b border-border/50">
            You agree to use the app only for lawful purposes and in accordance with these Terms.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">2. User Responsibilities</h3>
          <p className="mb-2">You are responsible for:</p>
          <ul className="list-disc pl-5 mb-6 pb-4 border-b border-border/50 space-y-1">
            <li>Ensuring the accuracy of the data you enter</li>
            <li>Maintaining the confidentiality of your account (if login is enabled)</li>
            <li>Using the app in a manner that does not harm or disrupt the service</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-4 mb-2">3. Data and Accuracy</h3>
          <p className="mb-2">HisabKitab provides tools for financial tracking and insights. We do not guarantee:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Accuracy of calculations in all scenarios</li>
            <li>Financial advice or recommendations</li>
          </ul>
          <p className="mb-6 pb-4 border-b border-border/50 text-xs font-medium text-warning flex items-center gap-2">
            <span className="text-base">⚠️</span> The app is <strong>not a substitute for professional financial advice</strong>.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">4. Data Storage</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Your data may be stored locally on your device or on secure cloud servers</li>
            <li>You are responsible for maintaining backups (if applicable)</li>
          </ul>
          <p className="mb-6 pb-4 border-b border-border/50">
            We are not liable for data loss due to device failure or unforeseen issues.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">5. Intellectual Property</h3>
          <ul className="list-disc pl-5 mb-6 pb-4 border-b border-border/50 space-y-1">
            <li>All content, branding, and features of HisabKitab are owned by us</li>
            <li>You may not copy, modify, distribute, or reverse-engineer any part of the app</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-4 mb-2">6. Third-Party Services</h3>
          <p className="mb-2">The app may integrate with third-party services (e.g., analytics or cloud providers).</p>
          <p className="mb-6 pb-4 border-b border-border/50">
            We are not responsible for the practices or policies of these services.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">7. Limitation of Liability</h3>
          <p className="mb-2">To the fullest extent permitted by law:</p>
          <ul className="list-disc pl-5 mb-6 pb-4 border-b border-border/50 space-y-1">
            <li>HisabKitab shall not be liable for any direct, indirect, or incidental damages</li>
            <li>This includes financial loss, data loss, or business interruption</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-4 mb-2">8. Termination</h3>
          <p className="mb-2">We reserve the right to:</p>
          <ul className="list-disc pl-5 mb-6 pb-4 border-b border-border/50 space-y-1">
            <li>Suspend or terminate access to the app if terms are violated</li>
            <li>Modify or discontinue the app at any time without prior notice</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-4 mb-2">9. Changes to Terms</h3>
          <p className="mb-6 pb-4 border-b border-border/50">
            We may update these Terms & Conditions from time to time. Continued use of the app after changes means you accept the updated terms.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">10. Governing Law</h3>
          <p className="mb-6 pb-4 border-b border-border/50">
            These Terms shall be governed by and interpreted in accordance with the laws of India.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">11. Contact Us</h3>
          <p className="mb-2">If you have any questions about these Terms, contact:</p>
          <p className="mb-6 pb-4 border-b border-border/50">
            📧 Email: <a href="mailto:avinashalwayshere@gmail.com" className="text-primary hover:underline transition-colors">avinashalwayshere@gmail.com</a>
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">12. Acceptance of Terms</h3>
          <p>
            By using HisabKitab, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
          </p>
        </div>

      </div>
    </div>
  );
}
