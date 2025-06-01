// Initialize story data
let story = { nodes: [] };
let currentNodeId = 1;
let editingNodeId = null; // Track node being edited

// DOM elements
const nodeForm = document.getElementById('nodeForm');
const nodeList = document.getElementById('nodeList');
const currentNodeDiv = document.getElementById('currentNode');
const choiceButtonsDiv = document.getElementById('choiceButtons');
const canvas = document.getElementById('storyGraph');
const ctx = canvas.getContext('2d');

// Load story from local storage
function loadStory() {
  const savedStory = localStorage.getItem('story');
  if (savedStory) {
    story = JSON.parse(savedStory);
  }
}

// Save story to local storage
function saveStory() {
  localStorage.setItem('story', JSON.stringify(story));
}

// Toggle between editor and reader modes
document.getElementById('editorBtn').addEventListener('click', () => {
  document.getElementById('editor').classList.remove('hidden');
  document.getElementById('reader').classList.add('hidden');
});

document.getElementById('readerBtn').addEventListener('click', () => {
  document.getElementById('editor').classList.add('hidden');
  document.getElementById('reader').classList.remove('hidden');
  displayCurrentNode();
});

// Handle form submission for adding or editing nodes
nodeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nodeText = document.getElementById('nodeText').value;
  const choicesInput = document.getElementById('choices').value.split(',').map(c => c.trim());
  const choiceLinks = document.getElementById('choiceLinks').value.split(',').map(id => parseInt(id.trim()) || null);

  if (editingNodeId) {
    // Update existing node
    const node = story.nodes.find(n => n.id === editingNodeId);
    if (node) {
      node.text = nodeText;
      node.choices = choicesInput.map((text, index) => ({
        text,
        nextNodeId: choiceLinks[index] || null
      }));
      editingNodeId = null;
      nodeForm.querySelector('button[type="submit"]').textContent = 'Add Node';
    }
  } else {
    // Create new node
    const newNode = {
      id: story.nodes.length + 1,
      text: nodeText,
      choices: choicesInput.map((text, index) => ({
        text,
        nextNodeId: choiceLinks[index] || null
      }))
    };
    story.nodes.push(newNode);
  }

  saveStory();
  nodeForm.reset();
  displayNodes();
  drawGraph();
});

// Display all nodes in editor
function displayNodes() {
  nodeList.innerHTML = '';
  story.nodes.forEach(node => {
    const nodeDiv = document.createElement('div');
    nodeDiv.innerHTML = `
      <p><strong>Node ${node.id}</strong>: ${node.text}</p>
      <p>Choices: ${node.choices.map(c => `${c.text} -> ${c.nextNodeId || 'None'}`).join(', ')}</p>
      <button onclick="editNode(${node.id})">Edit</button>
      <button onclick="deleteNode(${node.id})">Delete</button>
    `;
    nodeList.appendChild(nodeDiv);
  });
}

// Edit a node
function editNode(id) {
  const node = story.nodes.find(n => n.id === id);
  if (node) {
    editingNodeId = id;
    document.getElementById('nodeText').value = node.text;
    document.getElementById('choices').value = node.choices.map(c => c.text).join(', ');
    document.getElementById('choiceLinks').value = node.choices.map(c => c.nextNodeId || '').join(', ');
    nodeForm.querySelector('button[type="submit"]').textContent = 'Save Changes';
  }
}

// Delete a node and update references
function deleteNode(id) {
  story.nodes = story.nodes.filter(n => n.id !== id);
  story.nodes.forEach(node => {
    node.choices = node.choices.map(c => ({
      text: c.text,
      nextNodeId: c.nextNodeId === id ? null : c.nextNodeId
    }));
  });
  saveStory();
  displayNodes();
  drawGraph();
}

// Display current node in reader mode
function displayCurrentNode() {
  const node = story.nodes.find(n => n.id === currentNodeId);
  if (!node) {
    currentNodeDiv.innerHTML = '<p>Story is empty or node not found.</p>';
    choiceButtonsDiv.innerHTML = '';
    return;
  }

  currentNodeDiv.innerHTML = `<p>${node.text}</p>`;
  choiceButtonsDiv.innerHTML = '';
  node.choices.forEach(choice => {
    if (choice.nextNodeId) {
      const button = document.createElement('button');
      button.textContent = choice.text;
      button.addEventListener('click', () => {
        currentNodeId = choice.nextNodeId;
        displayCurrentNode();
      });
      choiceButtonsDiv.appendChild(button);
    }
  });
}

// Draw story graph on canvas
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const nodeRadius = 30;
  const startX = 50;
  const startY = 50;
  const offsetX = 150;
  const offsetY = 100;

  // Draw nodes
  story.nodes.forEach((node, index) => {
    const x = startX + (index % 3) * offsetX;
    const y = startY + Math.floor(index / 3) * offsetY;
    node.canvasX = x; // Store for arrows
    node.canvasY = y;

    // Draw node
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#36b9cc';
    ctx.fill();
    ctx.strokeStyle = '#2c9faf';
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`Node ${node.id}`, x - 20, y + 5);
  });

  // Draw arrows for choices
  story.nodes.forEach(node => {
    node.choices.forEach(choice => {
      if (choice.nextNodeId) {
        const targetNode = story.nodes.find(n => n.id === choice.nextNodeId);
        if (targetNode) {
          ctx.beginPath();
          ctx.moveTo(node.canvasX, node.canvasY);
          ctx.lineTo(targetNode.canvasX, targetNode.canvasY);
          ctx.strokeStyle = '#1cc88a';
          ctx.stroke();
        }
      }
    });
  });
}

// Initialize
loadStory();
displayNodes();
drawGraph();