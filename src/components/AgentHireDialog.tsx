import { Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AgentHireDialogProps {
  open: boolean;
  agentName: string;
  onClose: () => void;
  onConfirm: () => void;
  processing?: boolean;
}

const AgentHireDialog = ({
  open,
  agentName,
  onClose,
  onConfirm,
  processing = false,
}: AgentHireDialogProps) => (
  <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !processing) onClose(); }}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Hire {agentName}</DialogTitle>
        <DialogDescription>
          Subscribe to activate this agent for your business.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subscription</div>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-3xl font-bold text-foreground">$89</span>
          <span className="pb-1 text-sm text-muted-foreground">/ month</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Complete payment to hire this agent instantly and activate it right away.
        </p>
      </div>

      <div className="rounded-xl border border-primary/10 bg-primary/[0.05] px-4 py-3 text-sm text-foreground">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          What happens next
        </div>
        <p className="mt-2 text-muted-foreground">
          The agent will be hired for this business and ready to use immediately after payment is confirmed.
        </p>
      </div>

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={processing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {processing ? 'Processing...' : 'Pay $89 to Hire'}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AgentHireDialog;
