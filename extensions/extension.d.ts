import { Shell } from '../src/bot/services/town/shell';
import { CmdApi } from '../src/modules/modules';
import { ExtApi, util } from '../src/util/ext';

declare global {
  const ext: ExtApi;
  const $modules: typeof import('../src/modules/modules');
  const $shell: typeof Shell;
  const $: CmdApi;
  const _: typeof util;
}
