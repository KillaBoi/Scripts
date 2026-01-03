document.addEventListener('copy', (event) => {
  const selection = window.getSelection().toString();
  if (selection.includes('x.com')) {
    const rewrittenUrl = selection.replace(/x\.com/g, 'fixupx.com');
    event.clipboardData.setData('text/plain', rewrittenUrl);
    event.preventDefault();
  }
});

// S64 Decoding functionality
function decodeS64(encodedStr) {
  // 1. Remove Prefix
  if (encodedStr.startsWith("$s64$")) {
    encodedStr = encodedStr.substring(5);
  }
  
  console.log("removed prefix");
  
  // 2. Base64 Decode
  // Add padding if necessary
  let padding = encodedStr.length % 4;
  if (padding) {
    encodedStr += "=".repeat(4 - padding);
  }
  
  console.log("added padding: ", encodedStr);
  
  // Decode base64 to binary string
  let decodedBytes = atob(encodedStr);
  
  console.log("base64 decoded: ", decodedBytes);
  
  // 3. XOR with Key
  const key = "415e9ac4fd948ee55";
  let result = [];
  
  for (let i = 0; i < decodedBytes.length; i++) {
    const byte = decodedBytes.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    console.log("key_char: ", keyChar);
    result.push(String.fromCharCode(byte ^ keyChar));
    console.log("result: ", result);
  }
  
  return result.join("");
}

// Function to fetch Steam profile data
async function fetchSteamProfile(steamId) {
  // Method 1: Use background script to call Steam API (avoids CORS issues)
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'fetchSteamProfile',
      steamId: steamId
    });
    
    if (response && response.success) {
      console.log("Steam API response:", response);
      return {
        name: response.name,
        avatar: response.avatar
      };
    }
  } catch (error) {
    console.log("Background script API call failed, trying alternative method:", error);
  }
  
  // Method 2: Fetch from Steam Community profile page using CORS proxy (no API key needed)
  try {
    const profileUrl = `https://steamcommunity.com/profiles/${steamId}`;
    // Use a CORS proxy service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(profileUrl)}`;
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
      throw new Error('Proxy request failed');
    }
    
    const proxyData = await proxyResponse.json();
    
    if (proxyData.contents) {
      // Parse HTML to extract profile name and avatar
      const parser = new DOMParser();
      const doc = parser.parseFromString(proxyData.contents, 'text/html');
      
      // Try to find profile name - Steam uses various selectors
      let name = null;
      const nameSelectors = [
        '.actual_persona_name',
        '.profile_header_name',
        '[class*="persona_name"]',
        'title'
      ];
      
      for (const selector of nameSelectors) {
        const nameElement = doc.querySelector(selector);
        if (nameElement) {
          name = nameElement.textContent.trim();
          // Clean up title format (remove "Steam Community :: " prefix)
          if (name.includes('::')) {
            name = name.split('::')[1].trim();
          }
          if (name && name.length > 0 && name !== 'Steam Community') {
            break;
          }
        }
      }
      
      // Try to find avatar - be more specific to avoid footer/logo images
      let avatar = null;
      const avatarSelectors = [
        '.playerAvatar img',
        '.profile_avatar img',
        '.playerAvatarAutoSizeInner img',
        'img[src*="/avatars/"][src*="_full"]',  // More specific - must contain /avatars/ and _full
        'img[src*="/avatars/"][src*="_medium"]'
      ];
      
      // Get all images and filter for actual avatars
      const allImages = doc.querySelectorAll('img[src*="avatars"]');
      for (const img of allImages) {
        const src = img.src || img.getAttribute('src');
        if (src) {
          // Exclude footer, logo, and other non-avatar images
          if (src.includes('/avatars/') && 
              !src.includes('footer') && 
              !src.includes('logo') && 
              !src.includes('responsive') &&
              (src.includes('_full') || src.includes('_medium') || src.includes('_small'))) {
            avatar = src;
            // Prefer full-size avatar
            if (src.includes('_full')) {
              break;
            }
          }
        }
      }
      
      if (name || avatar) {
        return { name, avatar };
      }
    }
  } catch (error) {
    console.log("Steam Community fetch failed:", error);
  }
  
  // Method 3: Fallback - return null to avoid showing broken images
  // We can't reliably get avatar without API or successful proxy fetch
  console.warn("Could not fetch Steam profile data, avatar will not be updated");
  return {
    name: null,
    avatar: null
  };
}

// Function to update profile picture and name on the page
function updateProfileInfo(steamId, profileData) {
  // Wait for DOM to be ready
  const checkAndUpdate = () => {
    // Find the profile name element - more specific selector based on the HTML structure
    // Looking for: <div class="cursor-help font-bold text-base text-foreground sm:text-lg" data-tooltip="...">REDACTED</div>
    const nameElement = document.querySelector('div.cursor-help.font-bold[data-tooltip]') ||
                       document.querySelector('.cursor-help.font-bold.text-base') ||
                       document.querySelector('.cursor-help.font-bold.text-lg');
    
    if (nameElement && profileData.name) {
      // Only update if it says "REDACTED" or is empty
      const currentText = nameElement.textContent.trim();
      if (currentText === 'REDACTED' || !currentText || currentText.length < 3) {
        nameElement.textContent = profileData.name;
        // Update tooltip if it exists
        if (nameElement.hasAttribute('data-tooltip')) {
          nameElement.setAttribute('data-tooltip', profileData.name);
        }
        
        // Add a small "REDACTED" badge next to the name
        // The name element is inside a div with "flex items-center gap-2"
        const nameContainer = nameElement.parentElement;
        if (nameContainer && !nameContainer.querySelector('.redacted-badge')) {
          const badge = document.createElement('span');
          badge.className = 'redacted-badge';
          badge.textContent = 'REDACTED';
          badge.style.cssText = `
            padding: 2px 6px;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.5);
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #ef4444;
            text-transform: uppercase;
            line-height: 1.2;
          `;
          nameContainer.appendChild(badge);
        }
        
        console.log("Updated profile name to:", profileData.name);
      }
    }
    
    // Find the profile picture container
    // Looking for: <span class="relative flex shrink-0 overflow-hidden rounded-md size-32">
    //   <span class="flex h-full w-full items-center justify-center rounded-md bg-muted">
    //     <svg>...</svg>
    //   </span>
    // </span>
    const avatarOuter = document.querySelector('span.relative.flex.shrink-0.overflow-hidden.rounded-md.size-32');
    if (avatarOuter && profileData.avatar) {
      const avatarInner = avatarOuter.querySelector('span.flex.h-full.w-full.items-center.justify-center.rounded-md.bg-muted');
      
      if (avatarInner) {
        // Check if we've already added an image (avoid duplicates)
        if (avatarInner.querySelector('img[data-steam-avatar]')) {
          return; // Already updated
        }
        
        // Remove the SVG icon
        const svg = avatarInner.querySelector('svg');
        if (svg) {
          svg.remove();
        }
        
        // Create and insert the Steam avatar image
        const img = document.createElement('img');
        
        // Use the avatar URL directly from Steam API (should already be absolute)
        let avatarUrl = profileData.avatar;
        
        // Validate and fix the avatar URL
        if (!avatarUrl) {
          console.error("No avatar URL provided");
          return;
        }
        
        // Ensure it's an absolute URL
        if (!avatarUrl.startsWith('http')) {
          avatarUrl = 'https://' + avatarUrl.replace(/^\/\//, '');
        }
        
        // Steam API should return URLs like:
        // https://avatars.steamstatic.com/[hash]_full.jpg
        // https://cdn.steamstatic.com/steamcommunity/public/images/avatars/...
        // If we get something else, it might be invalid
        if (!avatarUrl.includes('steamstatic.com') && !avatarUrl.includes('steamcommunity.com')) {
          console.warn("Avatar URL doesn't look like a valid Steam URL:", avatarUrl);
        }
        
        // Log the URL we're trying to use
        console.log("Attempting to load avatar from:", avatarUrl);
        
        img.src = avatarUrl;
        img.alt = profileData.name || 'Steam Avatar';
        img.setAttribute('data-steam-avatar', 'true');
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 0.375rem;';
        
        // Don't set crossOrigin as it might cause CORS issues with Steam's CDN
        // Steam avatars should load fine without it
        
        let retryCount = 0;
        img.onerror = function() {
          retryCount++;
          console.error(`Avatar failed to load (attempt ${retryCount}):`, avatarUrl);
          
          // Only try one fallback - Steam's direct avatar endpoint
          // But this often redirects to Valve footer for private profiles
          if (retryCount === 1 && !avatarUrl.includes('steamcommunity.com/profiles')) {
            const fallbackUrl = `https://steamcommunity.com/profiles/${steamId}/avatarfull`;
            console.log("Trying fallback URL:", fallbackUrl);
            this.src = fallbackUrl;
          } else {
            // If all attempts fail, hide the broken image
            console.error("Avatar could not be loaded, hiding image element");
            this.style.display = 'none';
            // Optionally restore the SVG icon
            if (svg && avatarInner) {
              avatarInner.appendChild(svg.cloneNode(true));
            }
          }
        };
        
        img.onload = function() {
          console.log("Avatar loaded successfully from:", avatarUrl);
        };
        
        avatarInner.appendChild(img);
        console.log("Updated profile avatar to:", avatarUrl);
      }
    } else if (avatarOuter && !profileData.avatar) {
      console.log("No avatar URL available, skipping avatar update");
    }
    
    // Add profile link buttons (Steam, CSStats, Leetify)
    if (steamId) {
      // Find the container where buttons should go - look for the flex container with gap
      // Based on HTML: <div class="flex flex-wrap justify-center gap-1.5 sm:gap-2">
      let buttonsContainer = document.querySelector('div.flex.flex-wrap.justify-center[class*="gap"]');
      
      // If not found, try to find it near the avatar or create it
      if (!buttonsContainer) {
        // Look for the container after the avatar section
        const avatarSection = document.querySelector('span.relative.flex.shrink-0.overflow-hidden.rounded-md.size-32');
        if (avatarSection) {
          // Find the parent flex container
          let parent = avatarSection.closest('.flex.flex-col');
          if (parent) {
            // Look for existing button container
            buttonsContainer = parent.querySelector('div.flex.flex-wrap.justify-center');
            if (!buttonsContainer) {
              // Create the container - find where to insert it
              // Look for the div with "flex flex-col items-center justify-center gap-2" that comes after avatar
              const gapContainer = parent.querySelector('div.flex.flex-col.items-center.justify-center.gap-2');
              if (gapContainer) {
                buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'flex flex-wrap justify-center gap-1.5 sm:gap-2';
                gapContainer.parentElement.insertBefore(buttonsContainer, gapContainer);
              } else {
                // Fallback: insert after avatar's parent
                const avatarParent = avatarSection.closest('.flex.justify-center');
                if (avatarParent && avatarParent.parentElement) {
                  buttonsContainer = document.createElement('div');
                  buttonsContainer.className = 'flex flex-wrap justify-center gap-1.5 sm:gap-2';
                  avatarParent.parentElement.insertBefore(buttonsContainer, avatarParent.nextSibling);
                }
              }
            }
          }
        }
      }
      
      if (buttonsContainer) {
        // Check if buttons already exist
        const existingButtons = buttonsContainer.querySelectorAll('a[href*="steamcommunity.com"], a[href*="csstats.gg"], a[href*="leetify.com"]');
        if (existingButtons.length === 0) {
          // Create Steam button
          const steamBtn = document.createElement('a');
          steamBtn.href = `https://steamcommunity.com/profiles/${steamId}`;
          steamBtn.target = '_blank';
          steamBtn.rel = 'noopener noreferrer';
          steamBtn.className = 'flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-secondary/80 sm:h-10 sm:w-10 sm:rounded-xl';
          steamBtn.setAttribute('data-steam-links', 'true');
          steamBtn.innerHTML = `<svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px" class="size-4 sm:size-5"><path d="M 25 3 C 13.59 3 4.209375 11.680781 3.109375 22.800781 L 14.300781 28.529297 C 15.430781 27.579297 16.9 27 18.5 27 L 18.550781 27 C 18.940781 26.4 19.389375 25.649141 19.859375 24.869141 C 20.839375 23.259141 21.939531 21.439062 23.019531 20.039062 C 23.259531 15.569063 26.97 12 31.5 12 C 36.19 12 40 15.81 40 20.5 C 40 25.03 36.430937 28.740469 31.960938 28.980469 C 30.560938 30.060469 28.750859 31.160859 27.130859 32.130859 C 26.350859 32.610859 25.6 33.059219 25 33.449219 L 25 33.5 C 25 37.09 22.09 40 18.5 40 C 14.91 40 12 37.09 12 33.5 C 12 33.33 12.009531 33.17 12.019531 33 L 3.2792969 28.519531 C 4.9692969 38.999531 14.05 47 25 47 C 37.15 47 47 37.15 47 25 C 47 12.85 37.15 3 25 3 z M 31.5 14 C 27.92 14 25 16.92 25 20.5 C 25 24.08 27.92 27 31.5 27 C 35.08 27 38 24.08 38 20.5 C 38 16.92 35.08 14 31.5 14 z M 31.5 16 C 33.99 16 36 18.01 36 20.5 C 36 22.99 33.99 25 31.5 25 C 29.01 25 27 22.99 27 20.5 C 27 18.01 29.01 16 31.5 16 z M 18.5 29 C 17.71 29 16.960313 29.200312 16.320312 29.570312 L 19.640625 31.269531 C 20.870625 31.899531 21.350469 33.410625 20.730469 34.640625 C 20.280469 35.500625 19.41 36 18.5 36 C 18.11 36 17.729375 35.910469 17.359375 35.730469 L 14.029297 34.019531 C 14.289297 36.259531 16.19 38 18.5 38 C 20.99 38 23 35.99 23 33.5 C 23 31.01 20.99 29 18.5 29 z"></path></svg>`;
          buttonsContainer.appendChild(steamBtn);
          
          // Create CSStats button
          const csstatsBtn = document.createElement('a');
          csstatsBtn.href = `https://csstats.gg/player/${steamId}`;
          csstatsBtn.target = '_blank';
          csstatsBtn.rel = 'noopener noreferrer';
          csstatsBtn.className = 'flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-secondary/80 sm:h-10 sm:w-10 sm:rounded-xl';
          csstatsBtn.setAttribute('data-steam-links', 'true');
          csstatsBtn.innerHTML = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4 sm:size-5"><path fill="#ffffff" d="M10.6875 38.625C8.38194 38.625 6.52082 38.3472 5.10416 37.7917C3.68749 37.2361 2.64582 36.3611 1.97915 35.1667C1.31248 33.9445 0.965278 32.375 0.9375 30.4583C0.9375 28.5139 1.21527 26.1667 1.77083 23.4167C2.24305 20.8611 2.81248 18.6944 3.47915 16.9167C4.17359 15.1111 5.04861 13.6528 6.10416 12.5417C7.15972 11.4306 8.46527 10.625 10.0208 10.125C11.5764 9.625 13.493 9.375 15.7708 9.375C16.6875 9.375 17.6597 9.44444 18.6875 9.58333C19.7153 9.69444 20.7014 9.84722 21.6458 10.0417C22.5903 10.2083 23.4097 10.3611 24.1042 10.5L23.2292 16.2083C22.7014 16.125 22.0625 16.0556 21.3125 16C20.5625 15.9167 19.7847 15.8472 18.9792 15.7917C18.1736 15.7361 17.4375 15.7083 16.7708 15.7083C15.5486 15.7083 14.5208 15.8611 13.6875 16.1667C12.8542 16.4444 12.1458 16.9306 11.5625 17.625C11.0069 18.2917 10.5208 19.1944 10.1042 20.3333C9.71528 21.4444 9.36804 22.8472 9.06249 24.5417C8.75693 26.0972 8.56249 27.375 8.47916 28.375C8.4236 29.375 8.52082 30.1667 8.77082 30.75C9.02082 31.3056 9.46528 31.7083 10.1042 31.9583C10.7431 32.1806 11.6042 32.2917 12.6875 32.2917C13.9097 32.2917 15.1736 32.2361 16.4792 32.125C17.8125 32.0139 18.9236 31.9167 19.8125 31.8333L19.2708 37.6667C18.5764 37.8056 17.743 37.9583 16.7708 38.125C15.7986 38.2639 14.7847 38.375 13.7292 38.4583C12.6736 38.5695 11.6597 38.625 10.6875 38.625Z"></path><path fill="#3872FC" d="M32.7907 38.625C31.4851 38.625 30.1379 38.5417 28.749 38.375C27.3879 38.2361 26.124 38.0694 24.9573 37.875C23.7907 37.6528 22.8046 37.4583 21.999 37.2917L23.0407 31.625C23.9018 31.7361 24.9018 31.8611 26.0407 32C27.2074 32.1111 28.3601 32.2222 29.499 32.3333C30.6379 32.4167 31.624 32.4583 32.4574 32.4583C33.5963 32.4583 34.4851 32.3333 35.124 32.0833C35.7629 31.8056 36.2213 31.4444 36.499 31C36.7768 30.5278 36.9574 30.0278 37.0407 29.5C37.124 29.0278 37.0824 28.6667 36.9157 28.4167C36.749 28.1667 36.4018 27.9583 35.874 27.7917C35.374 27.5972 34.6101 27.4028 33.5824 27.2083C31.7768 26.9306 30.2768 26.5694 29.0824 26.125C27.8879 25.6528 26.9574 25.0694 26.2907 24.375C25.6518 23.6528 25.249 22.7639 25.0824 21.7083C24.9435 20.6528 25.0129 19.3889 25.2907 17.9167C25.7351 15.6111 26.4712 13.8472 27.499 12.625C28.5546 11.4028 29.874 10.5556 31.4574 10.0833C33.0407 9.61111 34.874 9.375 36.9574 9.375C38.0407 9.375 39.2074 9.43056 40.4574 9.54167C41.7074 9.65278 42.9296 9.79166 44.124 9.95833C45.3185 10.0972 46.3324 10.25 47.1657 10.4167L46.2074 16.1667C45.4018 16.0833 44.4435 16 43.3324 15.9167C42.249 15.8056 41.1657 15.7222 40.0824 15.6667C38.999 15.5833 38.0546 15.5417 37.249 15.5417C36.1101 15.5417 35.2213 15.6806 34.5824 15.9583C33.9713 16.2083 33.5268 16.5278 33.249 16.9167C32.999 17.2778 32.8324 17.6806 32.749 18.125C32.6657 18.5972 32.7073 18.9722 32.874 19.25C33.0407 19.5278 33.3879 19.7639 33.9157 19.9583C34.4435 20.125 35.2073 20.3472 36.2073 20.625C37.9851 21.0139 39.4712 21.4306 40.6657 21.875C41.8601 22.2917 42.7768 22.8333 43.4157 23.5C44.0824 24.1389 44.4851 24.9722 44.624 26C44.7907 27 44.7213 28.2778 44.4157 29.8333C43.999 32.0556 43.2768 33.8056 42.249 35.0833C41.2213 36.3611 39.9157 37.2778 38.3324 37.8333C36.749 38.3611 34.9018 38.625 32.7907 38.625Z"></path></svg>`;
          buttonsContainer.appendChild(csstatsBtn);
          
          // Create Leetify button
          const leetifyBtn = document.createElement('a');
          leetifyBtn.href = `https://leetify.com/app/profile/${steamId}`;
          leetifyBtn.target = '_blank';
          leetifyBtn.rel = 'noopener noreferrer';
          leetifyBtn.className = 'flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-secondary/80 sm:h-10 sm:w-10 sm:rounded-xl';
          leetifyBtn.setAttribute('data-steam-links', 'true');
          leetifyBtn.innerHTML = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4 sm:size-5"><path fill-rule="evenodd" clip-rule="evenodd" d="M73.9185 69.0713L82.7853 27H182.343C187.676 27 192 31.3603 192 36.7391C192 37.4225 191.929 38.1041 191.787 38.7724L167.453 153.726C166.185 159.717 160.936 164 154.861 164L115.137 164L133.363 78.5002C134.26 74.2934 131.605 70.1498 127.434 69.2454C126.9 69.1297 126.356 69.0713 125.81 69.0713H73.9185Z" fill="#BF3B68"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M62.9551 76.2187C62.9071 76.3944 62.8637 76.5723 62.8251 76.7522L55.6099 110.406C54.8585 113.911 57.0667 117.366 60.542 118.124C60.989 118.222 61.4451 118.271 61.9025 118.271H84.6352C88.1908 118.271 91.0732 121.178 91.0732 124.764C91.0732 125.221 91.0253 125.676 90.9304 126.123L82.8868 164H9.65702C4.3236 164 0 159.64 0 154.261C0 153.577 0.0713305 152.896 0.212812 152.228L24.5465 37.2744C25.8149 31.2825 31.0636 27 37.1388 27H73.2707L62.9551 76.2187Z" fill="#F84982"></path></svg>`;
          buttonsContainer.appendChild(leetifyBtn);
          
          console.log("Added profile link buttons for Steam ID:", steamId);
        }
      }
    }
  };
  
  // Try immediately
  checkAndUpdate();
  
  // Also try after delays in case DOM isn't ready (SPA might load content dynamically)
  setTimeout(checkAndUpdate, 500);
  setTimeout(checkAndUpdate, 1500);
  setTimeout(checkAndUpdate, 3000);
  
  // Watch for DOM changes (useful for SPAs)
  const observer = new MutationObserver(() => {
    checkAndUpdate();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Stop observing after 10 seconds to avoid performance issues
  setTimeout(() => observer.disconnect(), 10000);
}

// Function to extract and decode s64 from URL
async function processS64InURL() {
  const url = window.location.href;
  // Only process if URL contains $s64$ prefix
  const s64Match = url.match(/\$s64\$[A-Za-z0-9+/=]+/);
  
  // Remove display element if it exists and URL doesn't have $s64$
  let displayDiv = document.getElementById('s64-decoder-result');
  if (!s64Match) {
    if (displayDiv) {
      displayDiv.remove();
    }
    return; // Exit early if no $s64$ found
  }
  
  // Only proceed if $s64$ is present
  const encodedStr = s64Match[0];
  try {
    const decoded = decodeS64(encodedStr);
    
    // Create or update display element
    if (!displayDiv) {
      displayDiv = document.createElement('div');
      displayDiv.id = 's64-decoder-result';
      displayDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a1a1a;
        color: #00ff00;
        padding: 15px 20px;
        border-radius: 8px;
        border: 2px solid #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        word-break: break-all;
      `;
      document.body.appendChild(displayDiv);
    }
    
    displayDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: #00ff00;">Decoded S64:</div>
      <div style="color: #ffffff; font-size: 16px;">${decoded}</div>
      <div style="margin-top: 8px; font-size: 11px; color: #888; opacity: 0.7;">Encoded: ${encodedStr.substring(0, 30)}...</div>
    `;
    
    console.log("Decoded result:", decoded);
    
    // Fetch and update Steam profile info
    try {
      const profileData = await fetchSteamProfile(decoded);
      if (profileData) {
        updateProfileInfo(decoded, profileData);
        console.log("Profile data fetched:", profileData);
      }
    } catch (error) {
      console.error("Error fetching Steam profile:", error);
    }
    
  } catch (error) {
    console.error("Error decoding s64:", error);
    // Remove display on error
    if (displayDiv) {
      displayDiv.remove();
    }
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', processS64InURL);
} else {
  processS64InURL();
}

// Also run when URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    processS64InURL();
  }
}).observe(document, { subtree: true, childList: true });

