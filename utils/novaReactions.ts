import { useNovaAvatarStore } from "@/stores/useNovaAvatarStore";

const REACTION_INPUT_BY_CODE: Record<string, string> = {
  alert: "Alert",
  delay: "Alert",
  delayed: "Alert",
  gate_change: "Alert",
  security_alert: "Alert",
  task_complete: "Smile",
  checklist_complete: "Smile",
  success: "Smile",
  smile: "Smile",
};

const readNotificationData = (notification: unknown) => {
  const record =
    notification && typeof notification === "object"
      ? (notification as Record<string, unknown>)
      : null;

  return (
    (record?.additionalData as Record<string, unknown> | undefined) ??
    (record?.additional_data as Record<string, unknown> | undefined) ??
    ((record?.rawPayload as Record<string, unknown> | undefined)?.custom as
      | Record<string, unknown>
      | undefined) ??
    {}
  );
};

export const getNovaReactionInput = (reactionCode?: string | null) => {
  if (!reactionCode) {
    return null;
  }

  return REACTION_INPUT_BY_CODE[reactionCode.toLowerCase()] ?? reactionCode;
};

export const queueNovaReactionFromNotification = (notification: unknown) => {
  const data = readNotificationData(notification);
  const reactionCode = data.reaction_code;

  if (typeof reactionCode !== "string" || !reactionCode.trim()) {
    return;
  }

  const inputName = getNovaReactionInput(reactionCode);

  if (!inputName) {
    return;
  }

  useNovaAvatarStore.getState().queueReaction(reactionCode, inputName);
};
