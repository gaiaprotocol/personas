import { el } from '@webtaku/el';
import { profile } from '../../shared/views/profile';

export class ProfileTab {
  el = profile(el) as HTMLElement;

  private navigate?: (path: string) => void;

  constructor(navigate?: (path: string) => void) {
    this.navigate = navigate;
    this.setupInternalLinks();
  }

  /** /로 시작하는 내부 링크만 SPA 라우팅으로 처리 */
  private setupInternalLinks() {
    if (!this.navigate) return;

    // 프로필 뷰 안의 내부 링크들 (Recent Posts 등)
    const links = this.el.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate?.(href);
      });
    });
  }
}
