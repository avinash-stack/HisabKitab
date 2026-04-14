import PageHeader from "@/components/PageHeader";

export default function Privacy() {
  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Privacy Policy" backButton />
      <div className="gradient-card rounded-xl p-6 border border-border mt-4">
        
        <div className="prose prose-sm dark:prose-invert text-muted-foreground w-full max-w-none">
          <h2 className="text-xl font-bold text-foreground mb-1">Privacy Policy for HisabKitab</h2>
          <p className="text-xs font-medium text-muted-foreground mb-6">Effective Date: Apr 14, 2026</p>

          <p className="mb-4">
            HisabKitab (“we”, “our”, or “us”) respects your privacy and is committed to protecting it through this Privacy Policy.
          </p>
          <p className="mb-6 pb-4 border-b border-border/50">
            This policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">1. Information We Collect</h3>
          
          <h4 className="text-foreground font-medium mt-3 mb-1">a) Personal Information</h4>
          <p className="mb-2">We may collect:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Name (if provided)</li>
            <li>Email address (if login/signup is enabled)</li>
          </ul>

          <h4 className="text-foreground font-medium mt-3 mb-1">b) Financial Data</h4>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>Income details</li>
            <li>Expense records</li>
            <li>Loan and debt information</li>
          </ul>
          <p className="mb-4 text-xs font-medium text-warning flex items-center gap-1">
            <span>⚠️</span> This data is stored securely and used only to provide app functionality.
          </p>

          <h4 className="text-foreground font-medium mt-3 mb-1">c) Device Information</h4>
          <ul className="list-disc pl-5 mb-6 pb-4 border-b border-border/50 space-y-1">
            <li>Device type</li>
            <li>Operating system</li>
            <li>App usage data (for performance improvement)</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-4 mb-2">2. How We Use Your Information</h3>
          <p className="mb-2">We use the collected data to:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Provide and improve app features</li>
            <li>Track expenses and financial records</li>
            <li>Enhance user experience</li>
            <li>Fix bugs and improve performance</li>
          </ul>
          <p className="font-medium text-foreground mb-6 pb-4 border-b border-border/50">
            We do not sell or rent your personal data to third parties.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">3. Data Storage and Security</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Your data is stored securely using industry-standard practices</li>
            <li>We take reasonable steps to protect your data from unauthorized access</li>
          </ul>
          <p className="mb-6 pb-4 border-b border-border/50">
            If cloud sync is enabled, data may be stored on secure third-party services (e.g., Supabase or similar platforms).
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">4. Data Sharing</h3>
          <p className="mb-2">We do not share your personal data except:</p>
          <ul className="list-disc pl-5 mb-6 pb-4 border-b border-border/50 space-y-1">
            <li>When required by law</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-4 mb-2">5. Third-Party Services</h3>
          <p className="mb-2">HisabKitab may use third-party services such as:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Analytics tools (for app performance)</li>
            <li>Cloud storage providers</li>
          </ul>
          <p className="mb-6 pb-4 border-b border-border/50">
            These services may collect limited data as per their own privacy policies.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">6. User Control</h3>
          <p className="mb-2">You have full control over your data:</p>
          <ul className="list-disc pl-5 mb-6 pb-4 border-b border-border/50 space-y-1">
            <li>You can edit or delete your records anytime within the app</li>
            <li>You may request data deletion by contacting us</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-4 mb-2">7. Children’s Privacy</h3>
          <p className="mb-6 pb-4 border-b border-border/50">
            HisabKitab is not intended for children under the age of 13. We do not knowingly collect data from children.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">8. Changes to This Policy</h3>
          <p className="mb-6 pb-4 border-b border-border/50">
            We may update this Privacy Policy from time to time. Any changes will be reflected on this page.
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">9. Contact Us</h3>
          <p className="mb-2">If you have any questions or concerns, contact us at:</p>
          <p className="mb-6 pb-4 border-b border-border/50">
            📧 Email: <a href="mailto:avinashalwayshere@gmail.com" className="text-primary hover:underline transition-colors">avinashalwayshere@gmail.com</a>
          </p>

          <h3 className="text-foreground font-semibold mt-4 mb-2">10. Consent</h3>
          <p>
            By using HisabKitab, you consent to this Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );
}
