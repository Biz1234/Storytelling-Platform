const nodeForm = document.getElementById('nodeForm');
const nodeList = document.getElementById('nodeList');

nodeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nodeText = document.getElementById('nodeText').value;
  const choicesInput = document.getElementById('choices').value.split(',').map(c => c.trim());

  // Create new node
  const newNode = {
    id: story.nodes.length + 1,
    text: nodeText,
    choices: choicesInput.map(text => ({ text, nextNodeId: null }))
  };

  // Add to story and save
  story.nodes.push(newNode);
  saveStory();
  nodeForm.reset();
  displayNodes();
});

// Display all nodes in editor
function displayNodes() {
  nodeList.innerHTML = '';
  story.nodes.forEach(node => {
    const nodeDiv = document.createElement('div');
    nodeDiv.innerHTML = `
      <p><strong>Node ${node.id}</strong>: ${node.text}</p>
      <p>Choices: ${node.choices.map(c => c.text || 'None').join(', ')}</p>
    `;
    nodeList.appendChild(nodeDiv);
  });
}