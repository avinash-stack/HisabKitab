import { useNavigate } from "react-router-dom";
import { Receipt, Wallet, Landmark, HandCoins, ArrowLeft } from "lucide-react";

const options = [
  {
    title: "Add Expense",
    subtitle: "Track your daily spending",
    icon: Receipt,
    path: "/add/expense",
    gradient: "from-orange-500 to-red-400",
    iconBg: "bg-orange-500/20",
  },
  {
    title: "Add Income",
    subtitle: "Record your earnings",
    icon: Wallet,
    path: "/add/income",
    gradient: "from-purple-600 to-violet-500",
    iconBg: "bg-purple-500/20",
  },
  {
    title: "Add Loan",
    subtitle: "Manage EMI & loans",
    icon: Landmark,
    path: "/add/loan",
    gradient: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-500/20",
  },
  {
    title: "Add Debt",
    subtitle: "Track money lent or borrowed",
    icon: HandCoins,
    path: "/add/debt",
    gradient: "from-amber-500 to-yellow-400",
    iconBg: "bg-amber-500/20",
  },
];

export default function AddSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold font-display">What would you like to add?</h1>
      </div>

      {/* Hero Cards */}
      <div className="space-y-4">
        {options.map((opt, idx) => (
          <button
            key={opt.path}
            onClick={() => navigate(opt.path)}
            className={`w-full relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                       hover:scale-[1.02] active:scale-[0.98] animate-fade-in`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} opacity-90`} />

            {/* Decorative circles */}
            <div className="absolute top-[-20px] right-[-20px] w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute bottom-[-15px] right-[30px] w-16 h-16 rounded-full bg-white/10" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <opt.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">{opt.title}</h3>
                <p className="text-sm text-white/70 mt-0.5">{opt.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
