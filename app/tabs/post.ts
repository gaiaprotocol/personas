import { el } from '@webtaku/el';
import { PersonaPost } from '../../shared/types/post';
import { post as postTemplate } from '../../shared/views/post';

export class PostTab {
  el: HTMLElement;
  private navigate?: (path: string) => void;

  constructor(
    post: PersonaPost,
    replyPosts: PersonaPost[],
    navigate?: (path: string) => void,
  ) {
    this.el = postTemplate(el, post, replyPosts) as HTMLElement;
    this.navigate = navigate;
    this.setupInternalLinks();
  }

  /** /로 시작하는 내부 링크만 SPA 라우팅으로 처리 */
  private setupInternalLinks() {
    if (!this.navigate) return;

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
