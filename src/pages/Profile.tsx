import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile, ProfileInput } from "@/hooks/useProfile";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { useDebtContacts } from "@/hooks/useDebtContacts";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LogOut, Plus, Trash2, Tag, Users, UserCircle, Sparkles,
  ChevronRight, Camera, Wallet, Edit3, X
} from "lucide-react";

const EMOJI_OPTIONS = ["🍔", "🚗", "🛍️", "📄", "🎬", "💊", "📚", "📦", "🏠", "✈️", "☕", "💰", "🎮", "👕", "🐾", "💡"];
const SOURCE_EMOJI_OPTIONS = ["💼", "💻", "📈", "🏪", "🏠", "💰", "🎯", "📱", "🎨", "🔧"];

type ActiveSection = null | "profile" | "categories" | "contacts" | "income_sources";

export default function Profile() {
  const { signOut, user } = useAuth();
  const { data: profile, upsertProfile } = useProfile();
  const {
    data: rawCategories,
    categories,
    addCategory,
    deleteCategory,
    seedDefaults: seedCatDefaults,
  } = useExpenseCategories();
  const { data: contacts, addContact, deleteContact } = useDebtContacts();
  const {
    data: rawSources,
    sources,
    addSource,
    deleteSource,
    seedDefaults: seedSourceDefaults,
  } = useIncomeSources();

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile form
  const [form, setForm] = useState<ProfileInput>({
    full_name: "",
    phone: "",
    currency: "₹",
    monthly_budget: 0,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        currency: profile.currency || "₹",
        monthly_budget: profile.monthly_budget || 0,
      });
    }
  }, [profile]);

  const handleSaveProfile = () => {
    upsertProfile.mutate(form, { onSuccess: () => setActiveSection(null) });
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user!.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    upsertProfile.mutate({ avatar_url: publicUrl + "?t=" + Date.now() });
    setUploadingAvatar(false);
    toast.success("Profile picture updated!");
  };

  // Category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const handleAddCategory = () => {
    if (!newCatName.trim()) { toast.error("Enter a category name"); return; }
    addCategory.mutate(
      { name: newCatName.trim(), icon: newCatIcon },
      { onSuccess: () => { setNewCatName(""); setNewCatIcon("📦"); } }
    );
  };

  // Contact form
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const handleAddContact = () => {
    if (!newContactName.trim()) { toast.error("Enter a contact name"); return; }
    addContact.mutate(
      { name: newContactName.trim(), phone: newContactPhone || undefined },
      { onSuccess: () => { setNewContactName(""); setNewContactPhone(""); } }
    );
  };

  // Income source form
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceIcon, setNewSourceIcon] = useState("💰");
  const handleAddSource = () => {
    if (!newSourceName.trim()) { toast.error("Enter a source name"); return; }
    addSource.mutate(
      { name: newSourceName.trim(), icon: newSourceIcon },
      { onSuccess: () => { setNewSourceName(""); setNewSourceIcon("💰"); } }
    );
  };

  const hasCustomCategories = rawCategories && rawCategories.length > 0;
  const hasCustomSources = rawSources && rawSources.length > 0;

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Set your name";

  const menuItems = [
    { key: "profile" as const, icon: Edit3, label: "Update Profile", subtitle: "Name, phone, currency & budget", color: "text-primary" },
    { key: "categories" as const, icon: Tag, label: "Expense Categories", subtitle: `${hasCustomCategories ? rawCategories!.length : categories.length} categories`, color: "text-accent" },
    { key: "contacts" as const, icon: Users, label: "Debt Contacts", subtitle: `${(contacts || []).length} contacts saved`, color: "text-info" },
    { key: "income_sources" as const, icon: Wallet, label: "Income Sources", subtitle: `${hasCustomSources ? rawSources!.length : sources.length} sources`, color: "text-warning" },
  ];

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Profile" />

      {/* Avatar & User Card */}
      <div className="gradient-card rounded-xl p-5 border border-border mt-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <UserCircle className="w-9 h-9 text-primary-foreground" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center
                         shadow-md border-2 border-background transition-transform hover:scale-110 active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            {profile?.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="mt-4 space-y-2">
        {menuItems.map(({ key, icon: Icon, label, subtitle, color }) => (
          <button
            key={key}
            onClick={() => setActiveSection(activeSection === key ? null : key)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200
              ${activeSection === key
                ? "bg-primary/5 border-primary/30 shadow-sm"
                : "bg-card border-border hover:bg-secondary/50 hover:border-border/80"
              } active:scale-[0.98]`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeSection === key ? "gradient-primary" : "bg-secondary"
            }`}>
              <Icon className={`w-5 h-5 ${activeSection === key ? "text-primary-foreground" : color}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              activeSection === key ? "rotate-90" : ""
            }`} />
          </button>
        ))}
      </div>

      {/* Expandable Sections */}
      {activeSection === "profile" && (
        <div className="mt-3 gradient-card rounded-xl p-4 border border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Edit Profile</span>
            <button onClick={() => setActiveSection(null)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <Input placeholder="Your name" value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-11 bg-secondary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <Input type="tel" placeholder="+91 9876543210" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 bg-secondary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
                <Input placeholder="₹" value={form.currency || ""} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="h-11 bg-secondary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Monthly Budget</label>
                <Input type="number" placeholder="0" value={form.monthly_budget || ""} onChange={(e) => setForm({ ...form, monthly_budget: Number(e.target.value) })} className="h-11 bg-secondary" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={upsertProfile.isPending} className="w-full h-11 gradient-primary text-primary-foreground font-semibold">
              {upsertProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      )}

      {activeSection === "categories" && (
        <div className="mt-3 gradient-card rounded-xl p-4 border border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Expense Categories</span>
            <div className="flex items-center gap-2">
              {!hasCustomCategories && (
                <button onClick={() => seedCatDefaults.mutate()} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                  <Sparkles className="w-3 h-3" /> Add Defaults
                </button>
              )}
              <button onClick={() => setActiveSection(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
            {hasCustomCategories ? (
              rawCategories!.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <button onClick={() => deleteCategory.mutate(cat.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-sm text-muted-foreground">{cat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">default</span>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <select value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} className="h-10 w-12 bg-secondary rounded-lg text-center appearance-none cursor-pointer text-base border border-border">
              {EMOJI_OPTIONS.map((e) => (<option key={e} value={e}>{e}</option>))}
            </select>
            <Input placeholder="Category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="h-10 bg-secondary flex-1" onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} />
            <Button onClick={handleAddCategory} disabled={addCategory.isPending} size="icon" className="h-10 w-10 gradient-primary shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {activeSection === "contacts" && (
        <div className="mt-3 gradient-card rounded-xl p-4 border border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Debt Contacts</span>
            <button onClick={() => setActiveSection(null)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
            {(contacts || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No saved contacts yet</p>}
            {(contacts || []).map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm">{c.name}</span>
                  {c.phone && <span className="text-xs text-muted-foreground ml-2">{c.phone}</span>}
                </div>
                <button onClick={() => deleteContact.mutate(c.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} className="h-10 bg-secondary flex-1" onKeyDown={(e) => e.key === "Enter" && handleAddContact()} />
            <Input placeholder="Phone (opt.)" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} className="h-10 bg-secondary w-28" />
            <Button onClick={handleAddContact} disabled={addContact.isPending} size="icon" className="h-10 w-10 gradient-primary shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {activeSection === "income_sources" && (
        <div className="mt-3 gradient-card rounded-xl p-4 border border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Income Sources</span>
            <div className="flex items-center gap-2">
              {!hasCustomSources && (
                <button onClick={() => seedSourceDefaults.mutate()} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                  <Sparkles className="w-3 h-3" /> Add Defaults
                </button>
              )}
              <button onClick={() => setActiveSection(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
            {hasCustomSources ? (
              rawSources!.map((src) => (
                <div key={src.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{src.icon}</span>
                    <span className="text-sm">{src.name}</span>
                  </div>
                  <button onClick={() => deleteSource.mutate(src.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              sources.map((src) => (
                <div key={src.name} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-base">{src.icon}</span>
                  <span className="text-sm text-muted-foreground">{src.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">default</span>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <select value={newSourceIcon} onChange={(e) => setNewSourceIcon(e.target.value)} className="h-10 w-12 bg-secondary rounded-lg text-center appearance-none cursor-pointer text-base border border-border">
              {SOURCE_EMOJI_OPTIONS.map((e) => (<option key={e} value={e}>{e}</option>))}
            </select>
            <Input placeholder="Source name" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} className="h-10 bg-secondary flex-1" onKeyDown={(e) => e.key === "Enter" && handleAddSource()} />
            <Button onClick={handleAddSource} disabled={addSource.isPending} size="icon" className="h-10 w-10 gradient-primary shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sign Out */}
      <Button
        onClick={signOut}
        variant="outline"
        className="w-full h-11 mt-6 border-border text-muted-foreground hover:text-destructive hover:border-destructive gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}
