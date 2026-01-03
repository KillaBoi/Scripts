chrome.runtime.onInstalled.addListener(() => {
  console.log('Meow! Extension Installed :3');
});

// Handle Steam API requests from content script (avoids CORS issues)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchSteamProfile') {
    const STEAM_API_KEY = ''; // Paste Steam API Key here
    const steamId = request.steamId;
    
    if (STEAM_API_KEY && steamId) {
      const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;
      
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          if (data.response && data.response.players && data.response.players.length > 0) {
            const player = data.response.players[0];
            // Prefer full-size avatar
            const avatarUrl = player.avatarfull || player.avatarmedium || player.avatar;
            
            sendResponse({
              success: true,
              name: player.personaname,
              avatar: avatarUrl
            });
          } else {
            sendResponse({ success: false, error: 'No player data found' });
          }
        })
        .catch(error => {
          console.error('Steam API error:', error);
          sendResponse({ success: false, error: error.message });
        });
      
      // Return true to indicate we will send a response asynchronously
      return true;
    } else {
      sendResponse({ success: false, error: 'No API key or Steam ID' });
    }
  }
});
