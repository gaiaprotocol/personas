import { AnyBuilder } from '@webtaku/any-builder';
import { PersonaPost } from '../../shared/types/post';
import { postDetailMain, replyComposer, replyList } from '../../shared/ui/post';

export function postPage(b: AnyBuilder, post: PersonaPost, replies: PersonaPost[]) {
  return b(
    'section.post-wrapper',
    b(
      'div.post-inner',
      b('div.post-divider'),
      postDetailMain(b, { post }),
      replyComposer(b),
      replyList(b, replies),
    ),
  );
}
