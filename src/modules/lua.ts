// import axios from 'axios';
// import { Module, defineCommand, defineModule } from './modules';
// import { replaceAll } from '../util/polyfills';
// import { Logger } from '../util/logger';

// export const lua: Module = defineModule('lua', {
//   'run-lua': defineCommand('run-lua', '<code>', 'runs lua code using https://www.lua.org/cgi-bin/demo', async (cmd) => {
//     const regex = /(?<=<TEXTAREA ROWS="8" COLS="80">)[^]*(?=<\/TEXTAREA><P><IMG SRC="images\/)/g;

//     const page = await axios.post(`https://www.lua.org/cgi-bin/demo`, cmd.arg);

//     Logger.debug('lua', page.data);
//     const output = regex.exec(page.data)?.[0];
//     Logger.debug('lua', `output: ${output}`);

//     if (output) cmd.respond(`output: ${replaceAll(output.substring(0, 512), '\n', '\\n')}`);
//     else cmd.respond('no output!');
//   }),
// });
