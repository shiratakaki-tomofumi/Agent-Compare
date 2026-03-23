import * as React from "react";
import { cn } from "@/lib/utils";

const AlertDialog = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>{children}</div>;
};

const AlertDialogContent = ({ isOpen, onClose, className, children }: { isOpen: boolean; onClose: () => void; className?: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className={cn("rounded-lg bg-background p-6 shadow-lg max-w-sm w-full mx-4", className)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const AlertDialogHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex flex-col space-y-2 text-center", className)}>{children}</div>
);

const AlertDialogTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>
);

const AlertDialogDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);

const AlertDialogFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}>{children}</div>
);

export { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter };
