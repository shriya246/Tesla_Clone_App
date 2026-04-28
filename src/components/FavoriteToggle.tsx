import { AppButton } from "@/components/AppButton";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import type { FavoriteItemTypeValue } from "@/types";

interface FavoriteToggleProps {
  itemType: FavoriteItemTypeValue;
  itemSlug: string;
  itemTitle: string;
  redirectPath: string;
  isSignedIn: boolean;
  isFavorited: boolean;
}

export function FavoriteToggle({
  itemType,
  itemSlug,
  itemTitle,
  redirectPath,
  isSignedIn,
  isFavorited,
}: FavoriteToggleProps) {
  if (!isSignedIn) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-black/24 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/40">
          Save to account
        </p>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Sign in to save {itemTitle} to your favorites and revisit it from your
          account.
        </p>
        <div className="mt-5">
          <AppButton href={`/signin?callbackUrl=${encodeURIComponent(redirectPath)}`}>
            Sign In to Save
          </AppButton>
        </div>
      </div>
    );
  }

  const action = toggleFavoriteAction.bind(null, {
    itemType,
    itemSlug,
    redirectPath,
  });

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/24 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/40">
        Saved items
      </p>
      <p className="mt-3 text-sm leading-6 text-white/68">
        {isFavorited
          ? `${itemTitle} is already saved in your account.`
          : `Save ${itemTitle} to your account so you can come back to it later.`}
      </p>
      <form action={action} className="mt-5">
        <AppButton
          type="submit"
          variant={isFavorited ? "secondary" : "primary"}
        >
          {isFavorited ? "Remove from Saved" : "Save to Account"}
        </AppButton>
      </form>
    </div>
  );
}
