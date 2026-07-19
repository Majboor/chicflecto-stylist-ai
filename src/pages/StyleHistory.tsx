import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  History,
  Search,
  Trash2,
  Sparkles,
  Shirt,
  Layers,
  Calendar,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { buttonVariants } from "@/components/ui/button-variants";
import { FlashcardDeck } from "@/components/flashcard-deck";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  StyleHistoryEntry,
  getStyleHistory,
  deleteStyleEntry,
  clearStyleHistory,
} from "@/services/styleHistoryService";

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(ts).toLocaleString();
  }
}

const StyleHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<StyleHistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [activeEntry, setActiveEntry] = useState<StyleHistoryEntry | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (user) {
      setEntries(getStyleHistory(user.id));
    }
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      const haystack = [
        ...e.items,
        e.excerpt,
        e.note ?? "",
        ...e.styleResponse.style_advice.cards.map((c) => c.content),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, query]);

  const handleDelete = (id: string) => {
    if (!user) return;
    const remaining = deleteStyleEntry(user.id, id);
    setEntries(remaining);
    setPendingDeleteId(null);
    if (activeEntry?.id === id) setActiveEntry(null);
    toast.success("Look removed from your history.");
  };

  const handleClearAll = () => {
    if (!user) return;
    clearStyleHistory(user.id);
    setEntries([]);
    setConfirmClear(false);
    setActiveEntry(null);
    toast.success("Style history cleared.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fashion-accent/10 text-fashion-accent text-sm mb-4">
              <History className="h-4 w-4" />
              <span>Your style journal</span>
            </div>
            <h1 className="fashion-heading text-3xl md:text-4xl mb-4">
              My Style History
            </h1>
            <p className="fashion-subheading max-w-2xl mx-auto">
              Every outfit you've analyzed, saved and ready to revisit. Reopen a
              look to flip through its style cards again — no re-analysis needed.
            </p>
          </div>

          {entries.length > 0 && (
            <div className="max-w-3xl mx-auto mb-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fashion-text/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your looks (e.g. blazer, denim, evening)…"
                  className="w-full rounded-full border border-fashion-dark/20 bg-white/70 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-fashion-accent/50"
                  aria-label="Search style history"
                />
              </div>
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className={cn(
                  buttonVariants({ variant: "outline", className: "rounded-full" }),
                  "gap-2 whitespace-nowrap"
                )}
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="max-w-md mx-auto text-center glass-card rounded-2xl p-10 animate-scale-in">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-fashion-accent/10">
                <Sparkles className="h-8 w-8 text-fashion-accent" />
              </div>
              <h2 className="fashion-heading text-xl mb-2">No saved looks yet</h2>
              <p className="text-fashion-text/70 mb-6">
                Analyze an outfit and it will land here automatically, so you can
                come back to your stylist's advice any time.
              </p>
              <button
                type="button"
                onClick={() => navigate("/style-advice")}
                className={cn(
                  buttonVariants({ variant: "accent", className: "rounded-full" }),
                  "gap-2"
                )}
              >
                <Shirt className="h-4 w-4" />
                Analyze an outfit
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="fashion-heading text-xl mb-2">No looks match "{query}"</h3>
              <p className="text-fashion-text/70 mb-6">
                Try a different item, colour or occasion.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className={cn(buttonVariants({ variant: "outline", className: "rounded-full" }))}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((entry, index) => (
                <article
                  key={entry.id}
                  className="group glass-card overflow-hidden rounded-2xl transition-all hover:shadow-elegant animate-scale-in flex flex-col"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveEntry(entry)}
                    className="relative block aspect-[4/5] w-full overflow-hidden bg-fashion-light/40 text-left"
                    aria-label={`Open saved look from ${formatDate(entry.createdAt)}`}
                  >
                    {entry.thumbnail ? (
                      <img
                        src={entry.thumbnail}
                        alt="Saved outfit"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-fashion-text/40">
                        <Shirt className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-fashion-text shadow-soft">
                      <Layers className="h-3.5 w-3.5 text-fashion-accent" />
                      View {entry.cardCount} style cards
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-1.5 text-xs text-fashion-text/60 mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>

                    {entry.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {entry.items.slice(0, 3).map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-full bg-fashion/30 px-2.5 py-0.5 text-xs text-fashion-text/80"
                          >
                            {item}
                          </span>
                        ))}
                        {entry.items.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-fashion/20 px-2.5 py-0.5 text-xs text-fashion-text/60">
                            +{entry.items.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {entry.excerpt && (
                      <p className="text-sm text-fashion-text/70 line-clamp-3 flex-grow">
                        {entry.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveEntry(entry)}
                        className="text-sm font-medium text-fashion-accent hover:underline"
                      >
                        Reopen look
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(entry.id)}
                        className="text-fashion-text/50 hover:text-red-500 transition-colors"
                        aria-label="Delete this look"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {entries.length > 0 && (
            <div className="mt-14 text-center">
              <button
                type="button"
                onClick={() => navigate("/style-advice")}
                className={cn(
                  buttonVariants({ variant: "accent", className: "rounded-full" }),
                  "gap-2"
                )}
              >
                <Sparkles className="h-4 w-4" />
                Analyze a new outfit
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Reopen a saved look in the very same flashcard deck. */}
      <Dialog open={!!activeEntry} onOpenChange={(open) => !open && setActiveEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-fashion-accent" />
              Saved look
              {activeEntry && (
                <span className="text-sm font-normal text-fashion-text/60">
                  · {formatDate(activeEntry.createdAt)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {activeEntry && (
            <div className="pt-2">
              <FlashcardDeck
                styleResponse={activeEntry.styleResponse}
                originalImageUrl={activeEntry.thumbnail}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete-one confirmation. */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this look?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the saved analysis from your history on this device.
              It can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear-all confirmation. */}
      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear your whole style history?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes all {entries.length} saved looks from this
              device. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StyleHistory;
