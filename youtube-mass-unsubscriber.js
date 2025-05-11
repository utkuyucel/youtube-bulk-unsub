/**
 * YouTube Mass Unsubscriber
 * 
 * A simple script to automatically unsubscribe from all YouTube channels.
 * This script will scroll through your subscription list and unsubscribe from each channel.
 * 
 * Author: @utkuyucel
 * License: GNU GPLv3
 *
 * How to use:
 * 1. Go to https://www.youtube.com/feed/channels
 * 2. Open your browser's developer console (F12 or Ctrl+Shift+J)
 * 3. Paste this script and press Enter
 * 4. Watch as it unsubscribes from all channels
 */
(async function() {
  // Helper functions
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  const click = el => el.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
  );
  
  // Configuration
  const SCROLL_DELAY = 300;       // Time to wait after scrolling (ms)
  const BUTTON_DELAY = 200;       // Time to wait between button clicks (ms)
  const VERBOSE = false;          // Only show success messages
  
  // Statistics tracking
  let totalUnsubscribed = 0;
  const seenButtons = new Set();
  
  // Console styling
  const log = {
    info: msg => console.log(`%c[INFO] ${msg}`, 'color: #3498db'),
    success: msg => console.log(`%c[SUCCESS] ${msg}`, 'color: #2ecc71'),
    warning: msg => console.log(`%c[WARNING] ${msg}`, 'color: #f39c12'),
    error: msg => console.log(`%c[ERROR] ${msg}`, 'color: #e74c3c')
  };
  
  // Find unsubscribe buttons in different YouTube language interfaces
  function findUnsubscribeButtons() {
    const possibleLabels = [
      'unsubscribe',
      'aboneliğinden çık',
      'désabonner',
      'cancelar suscripción',
      'отписаться',
      'abbestellen'
    ];
    
    return Array.from(document.querySelectorAll('button[aria-label]'))
      .filter(btn => {
        const label = btn.getAttribute('aria-label').toLowerCase();
        return possibleLabels.some(term => label.includes(term));
      });
  }
  
  // Find confirmation buttons in different YouTube language interfaces
  function findConfirmButton() {
    const possibleLabels = [
      'unsubscribe',
      'abonelikten çık',
      'désabonner',
      'cancelar suscripción',
      'отписаться',
      'abbestellen'
    ];
    
    for (const label of possibleLabels) {
      const buttons = Array.from(document.querySelectorAll('button[aria-label]'))
        .filter(btn => btn.getAttribute('aria-label').toLowerCase() === label);
      
      if (buttons.length > 0) return buttons[0];
    }
    
    const dialogButtons = Array.from(document.querySelectorAll('yt-confirm-dialog-renderer button'));
    return dialogButtons.length > 1 ? dialogButtons[1] : null; // Second button is usually confirm
  }
  
  async function processVisibleButtons() {
    const buttons = findUnsubscribeButtons();
    if (VERBOSE) log.info(`Found ${buttons.length} unsubscribe buttons in view`);
    
    for (const btn of buttons) {
      if (seenButtons.has(btn)) continue;
      seenButtons.add(btn);
      
      try {
        const channelElement = btn.closest('ytd-channel-renderer');
        const channelName = channelElement ? 
          channelElement.querySelector('#channel-title')?.textContent.trim() : 
          'Unknown Channel';
        
        click(btn);
        await sleep(BUTTON_DELAY);
        
        const confirmBtn = findConfirmButton();
        if (confirmBtn) {
          click(confirmBtn);
          totalUnsubscribed++;
          console.log(`%c${channelName}`, 'color: #2ecc71');
        }
        
        await sleep(BUTTON_DELAY);
      } catch (err) {
        log.error(`Error processing button: ${err.message}`);
      }
    }
  }

  console.log("%cYouTube unsubscribe process starting", 'color: #2ecc71; font-weight: bold;');
  
  // First scroll to the bottom to load all channels
  let prevHeight = 0;
  let noChangeCount = 0;
  
  while (true) {
    await processVisibleButtons();
    
    const currHeight = document.documentElement.scrollHeight;
    if (currHeight === prevHeight) {
      noChangeCount++;
      if (noChangeCount >= 3) {
        break;
      }
    } else {
      noChangeCount = 0;
    }
    
    window.scrollTo(0, currHeight);
    prevHeight = currHeight;
    await sleep(SCROLL_DELAY);
  }

  await processVisibleButtons();

  console.log(`%cTotal unsubscribed: ${totalUnsubscribed}`, 'color: #2ecc71; font-weight: bold;');
})();