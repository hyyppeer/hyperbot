/// <reference path="./monaco.d.ts" />

console.log('monaco init');

require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

let proxy = URL.createObjectURL(
  new Blob(
    [
      `
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
	};
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
`,
    ],
    { type: 'text/javascript' }
  )
);

console.log('requiring');
require(['vs/editor/editor.main'], async function () {
  const libext = (await fetch('http://localhost:8080/extension.d.ts')).body;
  const libextfile = 'ts:filename/extension.d.ts';
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libext, libextfile);
  monaco.editor.createModel(libext, 'typescript', monaco.Uri.parse(libextfile));
  console.log('creating editor');
  let editor = monaco.editor.create(document.getElementById('editor'), {
    value: ['function x() {', '\t// extension goes here', '}'].join('\n'),
    language: 'javascript',
    theme: 'vs-dark',
  });
});
