function exec() {
  const script = document.querySelector<HTMLTextAreaElement>('#script').value;

  fetch('http://localhost:8080/api/extensionrun', {
    body: JSON.stringify({
      source: script,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
}

document.querySelector<HTMLButtonElement>('button#run').addEventListener('click', () => {
  exec();
});
