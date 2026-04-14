import PageHeader from "@/components/PageHeader";

export default function Help() {
  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Help & Support" backButton />
      <div className="gradient-card rounded-xl p-6 border border-border mt-4">
        
        <div className="prose prose-sm dark:prose-invert text-muted-foreground w-full max-w-none">
          <h2 className="text-xl font-bold text-foreground mb-4">Help & Support – HisabKitab</h2>

          <p className="mb-2">Welcome to HisabKitab Help Center 👋</p>
          <p className="mb-6 pb-5 border-b border-border/50">
            We’re here to help you get the most out of the app.
          </p>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>📌</span> Getting Started
          </h3>
          
          <h4 className="text-foreground font-medium mt-4 mb-2">How do I add an expense?</h4>
          <ul className="list-disc pl-5 mb-5 space-y-1">
            <li>Open the app</li>
            <li>Tap on <strong>“Add Expense”</strong></li>
            <li>Enter amount, category, and details</li>
            <li>Tap <strong>Save</strong></li>
          </ul>

          <h4 className="text-foreground font-medium mt-4 mb-2">How do I track income?</h4>
          <ul className="list-disc pl-5 mb-5 space-y-1">
            <li>Go to <strong>Income section</strong></li>
            <li>Tap <strong>“Add Income”</strong></li>
            <li>Enter details and save</li>
          </ul>

          <h4 className="text-foreground font-medium mt-4 mb-2">How do I manage loans or debts?</h4>
          <p className="mb-2">Navigate to <strong>Loans/Debts section</strong>. Add:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Amount</li>
            <li>Person name</li>
            <li>Due date (optional)</li>
          </ul>
          <p className="mb-2">You can track both:</p>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1">
            <li>Money you gave (Udhar)</li>
            <li>Money you owe</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>🔐</span> Data & Security
          </h3>
          
          <h4 className="text-foreground font-medium mt-4 mb-2">Is my data safe?</h4>
          <p className="mb-5">
            Yes. Your data is stored securely and used only to provide app functionality. We do not sell your data.
          </p>

          <h4 className="text-foreground font-medium mt-4 mb-2">Can I delete my data?</h4>
          <p className="mb-2">Yes. You can:</p>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1">
            <li>Edit or delete entries داخل the app</li>
            <li>Contact us for complete data deletion</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>🔄</span> Backup & Sync
          </h3>
          
          <h4 className="text-foreground font-medium mt-4 mb-2">Will my data be saved if I change phone?</h4>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1">
            <li>If cloud sync is enabled → Yes</li>
            <li>If not → Data may remain only on your device</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>⚠️</span> Troubleshooting
          </h3>

          <h4 className="text-foreground font-medium mt-4 mb-2">App is not working properly</h4>
          <p className="mb-2">Try:</p>
          <ul className="list-disc pl-5 mb-5 space-y-1">
            <li>Restarting the app</li>
            <li>Updating to the latest version</li>
            <li>Clearing cache</li>
          </ul>

          <h4 className="text-foreground font-medium mt-4 mb-2">Data not showing correctly</h4>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1">
            <li>Refresh the app</li>
            <li>Check if filters are applied</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>📩</span> Contact Support
          </h3>
          <p className="mb-2">Still need help? We’ve got you.</p>
          <p className="mb-3">
            📧 Email: <a href="mailto:avinashalwayshere@gmail.com" className="text-primary hover:underline transition-colors">avinashalwayshere@gmail.com</a>
          </p>
          <p className="mb-6 pb-5 border-b border-border/50">
            We typically respond within 24–48 hours.
          </p>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>💡</span> Suggestions & Feedback
          </h3>
          <p className="mb-6 pb-5 border-b border-border/50">
            Have ideas to improve HisabKitab?<br/>
            We’d love to hear from you!
          </p>

          <p className="text-center font-medium mt-2">
            Thank you for using HisabKitab 🙏
          </p>
        </div>

      </div>
    </div>
  );
}
