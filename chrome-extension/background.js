// Create a context menu item when you right-click on an image
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scanWithRaksha",
    title: "🛡️ Scan with RAKSHA",
    contexts: ["image"]
  });
});

// Listen for clicks on the context menu
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "scanWithRaksha") {
    // URL of the live deployed Vercel app
    const rakshaUrl = "https://frontend-brwr.vercel.app";
    
    // Open the Raksha dashboard in a new tab
    chrome.tabs.create({ url: rakshaUrl });
  }
});

// Also open the dashboard if the user clicks the extension icon in the toolbar
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "https://frontend-brwr.vercel.app" });
});
