import { el } from "@webtaku/el";

/* ---------- 타입 정의 ---------- */

export type AppLanguage = "system" | "en" | "ko";

export interface AppSettings {
  darkMode: boolean;
  pushEnabled: boolean;
  tradeNotifications: boolean;
  commentNotifications: boolean;
  marketingEmails: boolean;
  language: AppLanguage;
}

/* ---------- 설정 모달 ---------- */

export function createSettingsModal(
  initial: AppSettings,
  opts?: {
    onSave?: (next: AppSettings) => void | Promise<void>;
  }
): HTMLIonModalElement {
  // 클래스 부여해서 CSS 스코프 잡기
  const modal = el("ion-modal.settings-modal") as HTMLIonModalElement;

  /* ── 헤더 ─────────────────────────────────────── */

  const closeBtn = el(
    "ion-button",
    {
      slot: "end",
      fill: "clear",
      onclick: () => modal.dismiss(),
    },
    "Close"
  );

  const header = el(
    "ion-header",
    el(
      "ion-toolbar",
      el("ion-title", "Settings"),
      el("ion-buttons", { slot: "end" }, closeBtn)
    )
  );

  /* ── 폼 요소들 ────────────────────────────────── */

  const darkModeToggle = el("ion-toggle", {
    checked: initial.darkMode,
    slot: "end",
  }) as HTMLIonToggleElement;

  const pushToggle = el("ion-toggle", {
    checked: initial.pushEnabled,
    slot: "end",
  }) as HTMLIonToggleElement;

  const tradeToggle = el("ion-toggle", {
    checked: initial.tradeNotifications,
    slot: "end",
  }) as HTMLIonToggleElement;

  const commentToggle = el("ion-toggle", {
    checked: initial.commentNotifications,
    slot: "end",
  }) as HTMLIonToggleElement;

  const marketingToggle = el("ion-toggle", {
    checked: initial.marketingEmails,
    slot: "end",
  }) as HTMLIonToggleElement;

  // 언어는 select 사용
  const langSelect = el(
    "ion-select",
    {
      value: initial.language,
      slot: "end",
      interface: "popover",
      placeholder: "Select",
    },
    el("ion-select-option", { value: "system" }, "System"),
    el("ion-select-option", { value: "en" }, "English"),
    el("ion-select-option", { value: "ko" }, "한국어")
  ) as HTMLIonSelectElement;

  /* ── 섹션 구성 ───────────────────────────────── */

  const appearanceGroup = el(
    "ion-list",
    el("ion-list-header", el("ion-label", "Appearance")),
    el(
      "ion-item",
      el("ion-label", "Dark mode"),
      darkModeToggle
    )
  );

  const notificationsGroup = el(
    "ion-list",
    el("ion-list-header", el("ion-label", "Notifications")),
    el(
      "ion-item",
      el("ion-label", "Push notifications"),
      pushToggle
    ),
    el(
      "ion-item",
      el("ion-label", "Persona trades"),
      tradeToggle
    ),
    el(
      "ion-item",
      el("ion-label", "Comments & replies"),
      commentToggle
    )
  );

  const emailGroup = el(
    "ion-list",
    el("ion-list-header", el("ion-label", "Email")),
    el(
      "ion-item",
      el("ion-label", "Product updates & tips"),
      marketingToggle
    )
  );

  const languageGroup = el(
    "ion-list",
    el("ion-list-header", el("ion-label", "Language")),
    el(
      "ion-item",
      el("ion-label", "App language"),
      langSelect
    )
  );

  /* ── Save 버튼 ───────────────────────────────── */

  const saveBtn = el(
    "ion-button",
    {
      expand: "block",
      strong: true,
      class: "settings-save-btn",
    },
    "Save changes"
  ) as HTMLIonButtonElement;

  const footer = el(
    "div.settings-footer",
    saveBtn
  );

  // ✅ ion-content 안에 padding용 래퍼 div 하나 더
  const body = el(
    "div.settings-body",
    appearanceGroup,
    notificationsGroup,
    emailGroup,
    languageGroup,
    footer
  );

  const content = el(
    "ion-content",
    null,
    body
  );

  modal.append(header, content);

  /* ── 저장 로직 ───────────────────────────────── */

  saveBtn.onclick = async () => {
    const originalText = saveBtn.textContent || "Save changes";
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const next: AppSettings = {
        darkMode: !!darkModeToggle.checked,
        pushEnabled: !!pushToggle.checked,
        tradeNotifications: !!tradeToggle.checked,
        commentNotifications: !!commentToggle.checked,
        marketingEmails: !!marketingToggle.checked,
        language: (langSelect.value as AppLanguage) || "system",
      };

      if (opts?.onSave) {
        await opts.onSave(next);
      }

      modal.dismiss();
    } catch (err) {
      console.error(err);
      saveBtn.textContent = "Failed";
      setTimeout(() => {
        saveBtn.textContent = originalText;
      }, 1500);
      return;
    } finally {
      saveBtn.disabled = false;
      if (saveBtn.textContent === "Saving...") {
        saveBtn.textContent = originalText;
      }
    }
  };

  return modal;
}
