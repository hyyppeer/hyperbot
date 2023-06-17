while (true) {
  const script = prompt('Enter JS to eval');

  fetch('http://localhost:8080/api/eval', {
    body: JSON.stringify({
      script,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
}
