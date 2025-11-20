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

/**
 * 설정 모달 생성 함수
 *
 * @param initial 현재 설정 값
 * @param opts.onSave 저장 버튼 클릭 시 호출되는 콜백
 */
export function createSettingsModal(
  initial: AppSettings,
  opts?: {
    onSave?: (next: AppSettings) => void | Promise<void>;
  }
): HTMLIonModalElement {
  const modal = el("ion-modal") as HTMLIonModalElement;

  /* ---------- 헤더 ---------- */

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

  /* ---------- 폼 요소들 ---------- */

  // 토글들
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

  // 언어 선택 (ion-segment 또는 ion-select 둘 다 가능하지만,
  // 여기선 상단에 바로 보이는 segment 사용)
  const langSegment = el(
    "ion-segment",
    {
      value: initial.language,
    },
    el("ion-segment-button", { value: "system" }, el("ion-label", "System")),
    el("ion-segment-button", { value: "en" }, el("ion-label", "English")),
    el("ion-segment-button", { value: "ko" }, el("ion-label", "한국어"))
  ) as HTMLIonSegmentElement;

  /* ---------- 섹션 구성 ---------- */

  const appearanceGroup = el(
    "ion-list",
    el(
      "ion-list-header",
      el("ion-label", "Appearance")
    ),
    el(
      "ion-item",
      el("ion-label", "Dark mode"),
      darkModeToggle
    )
  );

  const notificationsGroup = el(
    "ion-list",
    el(
      "ion-list-header",
      el("ion-label", "Notifications")
    ),
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
    el(
      "ion-list-header",
      el("ion-label", "Email")
    ),
    el(
      "ion-item",
      el("ion-label", "Product updates & tips"),
      marketingToggle
    )
  );

  const languageGroup = el(
    "ion-list",
    el(
      "ion-list-header",
      el("ion-label", "Language")
    ),
    el(
      "ion-item",
      el("ion-label", "App language"),
      langSegment
    )
  );

  /* ---------- 하단 버튼 영역 ---------- */

  const saveBtn = el(
    "ion-button",
    {
      expand: "block",
      size: "default",
      strong: true,
    },
    "Save changes"
  ) as HTMLIonButtonElement;

  const footer = el(
    "div",
    {
      style: {
        padding: "12px 16px 24px",
      },
    },
    saveBtn
  );

  /* ---------- 컨텐츠 ---------- */

  const content = el(
    "ion-content",
    { className: "ion-padding" },
    appearanceGroup,
    notificationsGroup,
    emailGroup,
    languageGroup,
    footer
  );

  modal.append(header, content);

  /* ---------- 이벤트: 저장 ---------- */

  saveBtn.onclick = async () => {
    // 버튼 잠깐 비활성화 + 로딩 텍스트 (간단 버전)
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
        language: (langSegment.value as AppLanguage) || "system",
      };

      if (opts?.onSave) {
        await opts.onSave(next);
      }

      modal.dismiss();
    } catch (err) {
      console.error(err);
      // 실패 시 잠깐 에러 텍스트 보여주기
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
