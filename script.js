document.getElementById('editorBtn').addEventListener('click', () => {
  document.getElementById('editor').classList.remove('hidden');
  document.getElementById('reader').classList.add('hidden');
});

document.getElementById('readerBtn').addEventListener('click', () => {
  document.getElementById('editor').classList.add('hidden');
  document.getElementById('reader').classList.remove('hidden');
});