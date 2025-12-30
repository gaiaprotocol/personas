import { el } from "@webtaku/el";
import { getPushPermissionStatus } from "../services/push-notification";
import "./settings.css";

export type AppLanguage = "system" | "en" | "ko";

export interface AppSettings {
  darkMode: boolean;
  pushEnabled: boolean;
  tradeNotifications: boolean;
  commentNotifications: boolean;
  marketingEmails: boolean;
  language: AppLanguage;
}

/**
 * 설정 모달 생성 함수
 */
export function createSettingsModal(
  initial: AppSettings,
  opts?: {
    onSave?: (next: AppSettings) => void | Promise<void>;
    onPushToggle?: (enabled: boolean, prev: boolean) => void | Promise<void>;
  }
): HTMLIonModalElement {
  // .settings-modal 클래스로 스코프
  const modal = el("ion-modal.settings-modal") as HTMLIonModalElement;

  /* ---------- 헤더 ---------- */

  const closeBtn = el(
    "ion-button",
    {
      fill: "clear",
      "aria-label": "Close settings",
      onclick: () => modal.dismiss(),
    },
    // X 아이콘 (전역에서 ion-icon 세팅돼 있어야 함)
    el("ion-icon", {
      name: "close-outline",
      slot: "icon-only",
    })
  ) as HTMLIonButtonElement;

  const header = el(
    "ion-header",
    el(
      "ion-toolbar",
      el("ion-title", "Settings"),
      // ✅ slot="end" 는 ion-buttons 에만
      el("ion-buttons", { slot: "end" }, closeBtn)
    )
  );

  /* ---------- 폼 요소들 ---------- */

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

  /* ---------- 섹션 ---------- */

  const appearanceGroup = el(
    "ion-list",
    el("ion-list-header", el("ion-label", "Appearance")),
    el(
      "ion-item",
      el("ion-label", "Dark mode"),
      darkModeToggle
    )
  );

  // 권한 거부 안내 메시지
  const permissionStatus = getPushPermissionStatus();
  const isDenied = permissionStatus === 'denied';
  const isUnsupported = permissionStatus === 'unsupported';

  // 토글 비활성화 (권한 거부 또는 미지원 시)
  if (isDenied || isUnsupported) {
    pushToggle.disabled = true;
    pushToggle.checked = false;
  }

  const deniedNote = el("ion-item", {
    lines: "none",
    style: {
      display: isDenied ? "" : "none",
      "--background": "transparent"
    } as any
  },
    el("ion-label", {
      style: {
        whiteSpace: "normal",
        fontSize: "0.875rem",
        color: "var(--ion-color-warning)"
      }
    },
      el("p", {
        style: { margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }
      },
        el("ion-icon", { name: "warning-outline" }),
        "Push notifications are blocked"
      ),
      el("p", {
        style: { margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "var(--ion-color-medium)" }
      }, "To enable push notifications:"),
      el("ol", {
        style: {
          margin: "0",
          paddingLeft: "1.25rem",
          lineHeight: "1.6",
          fontSize: "0.8rem",
          color: "var(--ion-color-medium)"
        }
      },
        el("li", "Click the lock/info icon in your browser address bar"),
        el("li", "Find \"Notifications\" in site settings"),
        el("li", "Change from \"Block\" to \"Allow\""),
        el("li", "Reload the page")
      )
    )
  );

  const unsupportedNote = el("ion-item", {
    lines: "none",
    style: {
      display: isUnsupported ? "" : "none",
      "--background": "transparent"
    } as any
  },
    el("ion-label", {
      style: {
        whiteSpace: "normal",
        fontSize: "0.875rem",
        color: "var(--ion-color-medium)"
      }
    }, "Push notifications are not supported in this browser.")
  );

  const notificationsGroup = el(
    "ion-list",
    el("ion-list-header", el("ion-label", "Notifications")),
    el(
      "ion-item",
      el("ion-label", "Push notifications"),
      pushToggle
    ),
    deniedNote,
    unsupportedNote,
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

  /* ---------- Save 버튼 ---------- */

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
    "div",
    { className: "settings-footer" },
    saveBtn
  );

  // ✅ 바디/푸터 래퍼로만 패딩 관리
  const body = el(
    "div",
    { className: "settings-body" },
    //appearanceGroup,
    notificationsGroup,
    //emailGroup,
    //languageGroup
  );

  const content = el(
    "ion-content",
    {},
    body,
    footer
  );

  modal.append(header, content);

  /* ---------- 저장 로직 ---------- */

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

      // Handle push toggle change
      if (opts?.onPushToggle && next.pushEnabled !== initial.pushEnabled) {
        await opts.onPushToggle(next.pushEnabled, initial.pushEnabled);
      }

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
