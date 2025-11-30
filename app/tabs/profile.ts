import { el } from '@webtaku/el';
import { PersonaPost } from '../../shared/types/post';
import { Profile } from '../../shared/types/profile';
import { profile as profileTemplate } from '../../shared/ui/profile';

export class ProfileTab {
  el: HTMLElement;
  private navigate?: (path: string) => void;

  constructor(
    profile: Profile,
    posts: PersonaPost[],
    navigate?: (path: string) => void,
  ) {
    this.el = profileTemplate(el, profile, posts) as HTMLElement;
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
