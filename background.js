chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
      id: "convertToPDF",
      title: "Convert page text to PDF",
      contexts: ["page", "selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertToPDF") {
      console.log("Getting convertToPDF");
      const selectedText = info.selectionText;
      console.log("Selected text:", selectedText);

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const tab = tabs[0];

          // Prevent execution on chrome://, about://, and other restricted URLs
          if (!tab || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("about://")) {
              console.warn("Cannot run on restricted URLs:", tab?.url);
              return;
          }

          if (selectedText) {
              chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  function: function (selectedText) {
                      fetch('https://texttopdfconverter2.onrender.com/api/generate-pdf', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ text: selectedText })
                      })
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Failed to generate PDF');
                          }
                          return response.arrayBuffer();
                      })
                      .then(arrayBuffer => {
                          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'output.pdf';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                      })
                      .catch(error => console.error('Error:', error));
                  },
                  args: [selectedText]
              });
          } else {
              console.log("Hit in all");
              chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  function: function () {
                      const allText = document.body.innerText;
                      fetch('https://texttopdfconverter2.onrender.com/api/generate-pdf', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ text: allText })
                      })
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Failed to generate PDF');
                          }
                          return response.arrayBuffer();
                      })
                      .then(arrayBuffer => {
                          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'output.pdf';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                      })
                      .catch(error => console.error('Error:', error));
                  },
                  args: []
              });
          }
      });
  }
});

function getPageText() {
  return document.body.innerText;
}
