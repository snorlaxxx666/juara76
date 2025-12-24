document.getElementById('scrapeBtn').addEventListener('click', async () => {
    try {
        let [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: ultimateScraper
        });
    } catch (error) {
        alert("Gagal WOI");
    }
});

async function ultimateScraper() {
    const modal = document.querySelector('div[role="dialog"]');
    if (!modal) {
        alert("Buka dulu daftar member woi (View All)");
        return;
    }

    const scrollableArea = modal.querySelector('div[style*="overflow-y: scroll"]') || 
                           modal.querySelector('div[tabindex="-1"]') || 
                           modal;

    let allNumbers = new Set();
    let lastSize = 0;
    let retries = 0;

    while (retries < 8) {
        const elements = modal.querySelectorAll('span[dir="auto"], .copyable-text');
        elements.forEach(el => {
            let text = el.innerText || "";
            let clean = text.replace(/[^\d+]/g, "");
            if (clean.length >= 10 && clean.length <= 16) {
                allNumbers.add(`'${clean}`);
            }
        });

        scrollableArea.scrollTop += 600;
        await new Promise(r => setTimeout(r, 1200));

        if (allNumbers.size === lastSize) {
            retries++;
        } else {
            retries = 0;
            lastSize = allNumbers.size;
        }
    }

    if (allNumbers.size === 0) {
        alert("Nomor tidak ditemukan");
        return;
    }

    const csvContent = "\uFEFFNomor Telepon\n" + Array.from(allNumbers).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export${allNumbers.size}_Nomor.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`berhasil mbut total ${allNumbers.size} ter export.`);
}