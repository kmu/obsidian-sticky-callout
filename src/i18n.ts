export type Locale = "en" | "ja";

const en = {
  "button.pin": "Pin this callout",
  "button.unpin": "Unpin this callout",
  "settings.maxHeight": "Maximum height",
  "settings.maxHeightDesc": "How tall the stuck callout may be, as a share of the pane. Longer text scrolls inside it.",
} as const;

export type MessageKey = keyof typeof en;

const ja: Record<MessageKey, string> = {
  "button.pin": "このコールアウトを固定",
  "button.unpin": "固定を解除",
  "settings.maxHeight": "最大の高さ",
  "settings.maxHeightDesc": "貼り付いたコールアウトの高さの上限です（画面に対する割合）。長い内容はコールアウトの中でスクロールします。",
};

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, ja };

/** Japanese for `ja` and its regional variants; English for everything else. */
export function pickLocale(lang: string | null | undefined): Locale {
  return typeof lang === "string" && (lang === "ja" || lang.startsWith("ja-")) ? "ja" : "en";
}

export function translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
  let text = MESSAGES[locale][key];
  for (const [name, value] of Object.entries(params ?? {})) text = text.split(`{${name}}`).join(String(value));
  return text;
}
