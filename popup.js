// Load and display blocked friends
function loadBlockedFriends(searchTerm = '') {
  chrome.storage.sync.get(['blockedFriends'], function(result) {
    const blockedList = document.getElementById('blocked-list');
    blockedList.innerHTML = '';
    
    if (result.blockedFriends && result.blockedFriends.length > 0) {
      // Reverse the array to show newest first
      const friends = [...result.blockedFriends].reverse();
      
      if (searchTerm) {
        // Show search results
        const filteredFriends = friends.filter(friend => 
          friend.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filteredFriends.length === 0) {
          blockedList.innerHTML = '<p>No matches found</p>';
          return;
        }
        
        filteredFriends.forEach(friend => displayFriend(friend, blockedList));
      } else {
        // Show recent friends (top 3)
        blockedList.innerHTML = '<h4>Recently Hidden</h4>';
        const recentFriends = friends.slice(0, 3);
        recentFriends.forEach(friend => displayFriend(friend, blockedList));
        
        // Show total count if more than 3 friends
        if (friends.length > 3) {
          const totalCount = document.createElement('p');
          totalCount.className = 'total-count';
          totalCount.textContent = `Total hidden friends: ${friends.length}`;
          blockedList.appendChild(totalCount);
        }
      }
    } else {
      blockedList.innerHTML = '<p>No hidden friends</p>';
    }
  });
}

// Helper function to display a friend entry
function displayFriend(friend, container) {
  const friendElement = document.createElement('div');
  friendElement.className = 'blocked-friend';
  friendElement.innerHTML = `
    <span>${friend.name} <small>(ID: ${friend.id})</small></span>
    <button class="remove-btn" data-id="${friend.id}">Remove</button>
  `;
  container.appendChild(friendElement);
}

// Search functionality
document.getElementById('search-input').addEventListener('input', function(e) {
  loadBlockedFriends(e.target.value.trim());
});

// Handle removing friends
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('remove-btn')) {
    const friendId = e.target.getAttribute('data-id');
    chrome.storage.sync.get(['blockedFriends'], function(result) {
      const blockedFriends = result.blockedFriends || [];
      const updatedFriends = blockedFriends.filter(friend => friend.id !== friendId);
      chrome.storage.sync.set({ 'blockedFriends': updatedFriends }, function() {
        loadBlockedFriends();
      });
    });
  }
});

// Export functionality
document.getElementById('export-btn').addEventListener('click', function() {
  chrome.storage.sync.get(['blockedFriends'], function(result) {
    const dataStr = JSON.stringify(result.blockedFriends || []);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', 'hidden_friends.json');
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
        const importedFriends = JSON.parse(e.target.result);
        if (Array.isArray(importedFriends)) {
          chrome.storage.sync.set({ 'blockedFriends': importedFriends }, function() {
            loadBlockedFriends();
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
    // Load blocked friends with empty search term to show recent
    loadBlockedFriends('');
}); 