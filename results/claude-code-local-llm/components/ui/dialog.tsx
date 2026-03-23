import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {}

const Dialog = ({ className, ...props }: DialogProps) => (
  <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50", className)} {...props} />
);

Dialog.displayName = "Dialog";

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

const DialogContent = ({ isOpen, onClose, className, children, ...props }: DialogContentProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleBackdropClick}>
      <div
        className={cn("rounded-lg bg-background p-6 shadow-lg max-w-md w-full mx-4", className)}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

DialogContent.displayName = "DialogContent";

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);

DialogHeader.displayName = "DialogHeader";

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DialogTitle = ({ className, ...props }: DialogTitleProps) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);

DialogTitle.displayName = "DialogTitle";

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

DialogFooter.displayName = "DialogFooter";

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };
