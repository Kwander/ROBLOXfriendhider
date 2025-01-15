// Store blocked friend IDs
let blockedFriends = [];

// Load blocked friends from storage
chrome.storage.sync.get(['blockedFriends'], function(result) {
    if (result.blockedFriends) {
        blockedFriends = result.blockedFriends;
        hideBlockedFriends();
    }
});

function getUserId(element) {
    // First check if the element itself has an ID (list view)
    if (element.id && element.classList.contains('list-item')) {
        return element.id;
    }
    // Otherwise check for user link (carousel view)
    const userLink = element.querySelector('a[href*="/users/"]');
    if (userLink && userLink.href) {
        const userIdMatch = userLink.href.match(/\/users\/(\d+)/);
        if (userIdMatch) {
            return userIdMatch[1];
        }
    }
    return null;
}

function getUserName(element) {
    // Try carousel view name first
    const carouselName = element.querySelector('.friends-carousel-display-name')?.textContent;
    if (carouselName) return carouselName;
    
    // Try list view name
    const listViewName = element.querySelector('.avatar-name')?.textContent?.trim();
    if (listViewName) return listViewName;
    
    // Fallback to ID
    return getUserId(element);
}

function addBlockButtons() {
    // Target both carousel tiles and list items
    const friendElements = document.querySelectorAll('.friends-carousel-tile, .list-item.avatar-card');
    
    friendElements.forEach(element => {
        if (!element.querySelector('.friend-block-btn')) {
            const userId = getUserId(element);
            if (!userId) return;
            
            const userName = getUserName(element);
            
            const blockBtn = document.createElement('button');
            blockBtn.className = 'friend-block-btn';
            blockBtn.innerHTML = '✖';
            blockBtn.title = 'Hide this friend';
            
            blockBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!blockedFriends.some(friend => friend.id === userId)) {
                    blockedFriends.push({ id: userId, name: userName });
                    chrome.storage.sync.set({ 'blockedFriends': blockedFriends });
                    // Hide the content instead of removing the element
                    if (element.classList.contains('list-item')) {
                        const container = element.querySelector('.avatar-card-container');
                        if (container) {
                            container.style.display = 'none';
                        }
                    } else {
                        element.remove();
                    }
                }
            });
            
            // Add the button to the element
            element.style.position = 'relative';
            element.appendChild(blockBtn);
        }
    });
}

function hideBlockedFriends() {
    // Hide from both carousel and list view
    const friendElements = document.querySelectorAll('.friends-carousel-tile, .list-item.avatar-card');
    friendElements.forEach(element => {
        const userId = getUserId(element);
        if (userId && blockedFriends.some(friend => friend.id === userId)) {
            if (element.classList.contains('list-item')) {
                const container = element.querySelector('.avatar-card-container');
                if (container) {
                    container.style.display = 'none';
                }
            } else {
                element.parentElement.remove();
            }
        }
    });
}

// Create an observer to watch for new friend cards
const observer = new MutationObserver(() => {
    addBlockButtons();
    hideBlockedFriends();
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial run
setTimeout(() => {
    addBlockButtons();
    hideBlockedFriends();
}, 1000); 