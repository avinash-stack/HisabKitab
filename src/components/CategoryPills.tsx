import { Plus } from "lucide-react";

interface CategoryPillsProps {
  items: { name: string; icon?: string }[];
  selected: string;
  onSelect: (name: string) => void;
  onAddNew?: () => void;
}

export default function CategoryPills({ items, selected, onSelect, onAddNew }: CategoryPillsProps) {
  return (
    <div>
      <p className="text-sm font-semibold mb-2.5">Category</p>
      <div className="flex flex-wrap gap-2">
        {items.map(({ name, icon }) => {
          const isActive = selected === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${isActive
                  ? "gradient-primary text-white border-transparent shadow-sm scale-105"
                  : "bg-card border-border text-foreground hover:border-primary/30 hover:bg-primary/5"
                }`}
            >
              {icon && <span className="mr-1">{icon}</span>}
              {name}
            </button>
          );
        })}
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="w-9 h-9 rounded-full border border-dashed border-border flex items-center justify-center
                       text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
