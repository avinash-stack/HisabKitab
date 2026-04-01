import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export default function FormSheet({ open, onOpenChange, title, children }: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-background border-border rounded-t-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="px-5 pt-5 pb-2">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-center">{title}</SheetTitle>
          </SheetHeader>
        </div>
        <div className="px-5 pb-8 space-y-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
