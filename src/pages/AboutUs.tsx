import PageHeader from "@/components/PageHeader";

export default function AboutUs() {
  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="About Us" backButton />
      <div className="gradient-card rounded-xl p-6 border border-border mt-4">
        
        <div className="prose prose-sm dark:prose-invert text-muted-foreground w-full max-w-none">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-3 border border-primary/20 shadow-sm">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">H</span>
            </div>
            <h2 className="text-xl font-bold text-foreground m-0">About Us – HisabKitab</h2>
          </div>

          <p className="mb-4">
            HisabKitab is a simple and powerful personal finance management app designed to help individuals take control of their daily finances.
          </p>
          <p className="mb-6 pb-5 border-b border-border/50">
            We understand that managing money — tracking expenses, remembering loans, and keeping a record of debts — can become complicated over time. HisabKitab is built to simplify this process and give users a clear view of their financial activities in one place.
          </p>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>🎯</span> Our Mission
          </h3>
          <p className="mb-2">Our mission is to make financial tracking <strong className="text-foreground">easy, accessible, and stress-free</strong> for everyone.</p>
          <p className="mb-2">We aim to empower users to:</p>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1.5">
            <li>Stay aware of their spending habits</li>
            <li>Manage loans and debts efficiently</li>
            <li>Build better financial discipline</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>💡</span> What We Offer
          </h3>
          <p className="mb-2">HisabKitab provides:</p>
          <ul className="list-none pl-1 mb-6 pb-5 border-b border-border/50 space-y-2">
            <li>📊 Easy expense and income tracking</li>
            <li>💳 Loan and EMI management</li>
            <li>🤝 Debt tracking (given and taken)</li>
            <li>📱 Simple and user-friendly interface</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>🔐</span> Our Commitment
          </h3>
          <p className="mb-2">We are committed to:</p>
          <ul className="list-disc pl-5 mb-6 pb-5 border-b border-border/50 space-y-1.5">
            <li>Protecting your data and privacy</li>
            <li>Providing a secure and reliable experience</li>
            <li>Continuously improving the app based on user feedback</li>
          </ul>

          <h3 className="text-foreground font-semibold mt-5 mb-3 flex items-center gap-2">
            <span>🚀</span> Our Vision
          </h3>
          <p className="mb-3">
            We believe that good financial habits start with awareness.
          </p>
          <p>
            HisabKitab is not just an app — it’s a step toward helping individuals make smarter financial decisions and achieve better financial stability.
          </p>
        </div>

      </div>
    </div>
  );
}
