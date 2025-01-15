// Load and display blocked games
function loadBlockedGames(searchTerm = '') {
  chrome.storage.sync.get(['blockedGames'], function(result) {
    const blockedList = document.getElementById('blocked-list');
    blockedList.innerHTML = '';
    
    if (result.blockedGames && result.blockedGames.length > 0) {
      // Reverse the array to show newest first
      const games = [...result.blockedGames].reverse();
      
      if (searchTerm) {
        // Show search results
        const filteredGames = games.filter(game => 
          game.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filteredGames.length === 0) {
          blockedList.innerHTML = '<p>No matches found</p>';
          return;
        }
        
        filteredGames.forEach(game => displayGame(game, blockedList));
      } else {
        // Show recent games (top 3)
        blockedList.innerHTML = '<h4>Recently Blocked</h4>';
        const recentGames = games.slice(0, 3);
        recentGames.forEach(game => displayGame(game, blockedList));
        
        // Show total count if more than 3 games
        if (games.length > 3) {
          const totalCount = document.createElement('p');
          totalCount.className = 'total-count';
          totalCount.textContent = `Total blocked games: ${games.length}`;
          blockedList.appendChild(totalCount);
        }
      }
    } else {
      blockedList.innerHTML = '<p>No blocked games</p>';
    }
  });
}

// Helper function to display a game entry
function displayGame(game, container) {
  const gameElement = document.createElement('div');
  gameElement.className = 'blocked-game';
  gameElement.innerHTML = `
    <span>${game.title} <small>(ID: ${game.id})</small></span>
    <button class="remove-btn" data-id="${game.id}">Remove</button>
  `;
  container.appendChild(gameElement);
}

// Search functionality
document.getElementById('search-input').addEventListener('input', function(e) {
  loadBlockedGames(e.target.value.trim());
});

// Handle removing games
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('remove-btn')) {
    const gameId = e.target.getAttribute('data-id');
    chrome.storage.sync.get(['blockedGames'], function(result) {
      const blockedGames = result.blockedGames || [];
      const updatedGames = blockedGames.filter(game => game.id !== gameId);
      chrome.storage.sync.set({ 'blockedGames': updatedGames }, function() {
        loadBlockedGames();
      });
    });
  }
});

// Export functionality
document.getElementById('export-btn').addEventListener('click', function() {
  chrome.storage.sync.get(['blockedGames'], function(result) {
    const dataStr = JSON.stringify(result.blockedGames || []);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', 'blocked_games.json');
    exportLink.click();
  });
});

// Import functionality
document.getElementById('import-btn').addEventListener('click', function() {
  document.getElementById('import-input').click();
});

document.getElementById('import-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedGames = JSON.parse(e.target.result);
        if (Array.isArray(importedGames)) {
          chrome.storage.sync.set({ 'blockedGames': importedGames }, function() {
            loadBlockedGames();
          });
        }
      } catch (error) {
        console.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  }
});

// Initial load
document.addEventListener('DOMContentLoaded', function() {
    // Clear search input on popup open
    document.getElementById('search-input').value = '';
    // Load blocked games with empty search term to show recent
    loadBlockedGames('');
}); 