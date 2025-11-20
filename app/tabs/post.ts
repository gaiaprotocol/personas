import { el } from '@webtaku/el';
import { post } from '../../shared/views/post';

export class PostTab {
  el = post(el) as HTMLElement;
}
