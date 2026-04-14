import PageHeader from "@/components/PageHeader";

export default function AccountDeletion() {
  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Account Deletion" backButton />
      <div className="gradient-card rounded-xl p-6 border border-border mt-4">
        
        <div className="prose prose-sm dark:prose-invert text-muted-foreground w-full max-w-none">
          <h2 className="text-xl font-bold text-foreground mb-1">Account Deletion Request</h2>
          <p className="text-xs font-medium text-muted-foreground mb-6">Effective Date: Apr 14, 2026</p>

          <p className="mb-6 pb-5 border-b border-border/50">
            HisabKitab allows users to request deletion of their account and associated data at any time.
          </p>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>🗑️</span> How to Request Account Deletion
          </h3>
          <p className="mb-2">To delete your account and data, please follow these steps:</p>
          <div className="bg-secondary/50 p-4 rounded-xl border border-border/50 mb-6">
            <p className="font-semibold text-foreground mb-1 text-sm">1. Send an email to:</p>
            <p className="mb-4 pl-4 text-sm">📧 <a href="mailto:avinashalwayshere@gmail.com" className="text-primary hover:underline">avinashalwayshere@gmail.com</a></p>
            
            <p className="font-semibold text-foreground mb-1 text-sm">2. Use the subject line:</p>
            <p className="mb-4 pl-4 font-mono text-xs font-semibold text-foreground bg-background py-1.5 px-3 rounded-md w-fit border border-border">Account Deletion Request – HisabKitab</p>
            
            <p className="font-semibold text-foreground mb-1 text-sm">3. Include the following details:</p>
            <ul className="list-disc pl-9 mb-1 text-sm space-y-1">
              <li>Your registered email (if applicable)</li>
              <li>Any identifying details (optional)</li>
            </ul>
          </div>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>📊</span> What Data Will Be Deleted
          </h3>
          <p className="mb-2">Once your request is processed, we will delete:</p>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1">
            <li>All personal information (if collected)</li>
            <li>Income and expense records</li>
            <li>Loan and debt data</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>⏳</span> Data Retention
          </h3>
          <p className="mb-2">Some minimal data may be retained temporarily:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>For legal compliance</li>
            <li>Fraud prevention</li>
          </ul>
          <p className="mb-6 pb-5 border-b border-border/50">
            This data will be deleted within a reasonable period.
          </p>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>⏱️</span> Processing Time
          </h3>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1">
            <li>Requests are processed within <strong className="text-foreground">3–7 business days</strong></li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>🔐</span> Important Notes
          </h3>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1">
            <li>Account deletion is <strong className="text-destructive">permanent and cannot be undone</strong></li>
            <li>You will lose access to all your data</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>📩</span> Contact Us
          </h3>
          <p className="mb-2">For any questions, contact:</p>
          <p className="mb-6 pb-5 border-b border-border/50">
            📧 <a href="mailto:avinashalwayshere@gmail.com" className="text-primary hover:underline">avinashalwayshere@gmail.com</a>
          </p>

          <p className="font-medium text-foreground">
            By using HisabKitab, you acknowledge and accept this account deletion process.
          </p>
        </div>

      </div>
    </div>
  );
}
