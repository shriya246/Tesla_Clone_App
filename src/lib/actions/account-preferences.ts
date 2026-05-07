"use server";

import { auth } from "@/auth";
import { cacheTags, revalidateCachePaths, revalidateCacheTags } from "@/lib/cache";
import { updateUserContinuityPreferences } from "@/lib/db/users";

import type { AccountPreferencesActionState } from "@/lib/account/types";

function isChecked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export async function updateAccountPreferencesAction(
  _previousState: AccountPreferencesActionState,
  formData: FormData,
): Promise<AccountPreferencesActionState> {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Sign in again to update continuity preferences.",
    };
  }

  try {
    await updateUserContinuityPreferences({
      id: session.user.id,
      buildReminderOptIn: isChecked(formData, "buildReminderOptIn"),
      productUpdatesOptIn: isChecked(formData, "productUpdatesOptIn"),
    });

    revalidateCachePaths(["/account"]);
    revalidateCacheTags([cacheTags.account]);

    return {
      success: true,
      message: "Continuity preferences saved.",
    };
  } catch {
    return {
      success: false,
      message: "We could not save those preferences right now.",
    };
  }
}
