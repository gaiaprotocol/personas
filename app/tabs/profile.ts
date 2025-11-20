import { el } from '@webtaku/el';
import { profile } from '../../shared/views/profile';

export class ProfileTab {
  el = profile(el) as HTMLElement;
}
