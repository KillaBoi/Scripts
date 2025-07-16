document.addEventListener('copy', (event) => {
  const selection = window.getSelection().toString();
  if (selection.includes('x.com')) {
    const rewrittenUrl = selection.replace(/x\.com/g, 'fixupx.com');
    event.clipboardData.setData('text/plain', rewrittenUrl);
    event.preventDefault();
  }
});