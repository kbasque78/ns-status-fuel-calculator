document.addEventListener('DOMContentLoaded', () => {
    const pumpInput = document.getElementById('pumpPriceInput');
    const statusDisplay = document.getElementById('statusPriceDisplay');
    const generateBtn = document.getElementById('generateBtn');
    const exampleOutput = document.getElementById('exampleOutput');
    const historyList = document.getElementById('historyList');

    const stripHeader1 = document.getElementById('stripHeader1');
    const stripHeader2 = document.getElementById('stripHeader2');
    const stripBody1 = document.getElementById('stripBody1');
    const stripBody2 = document.getElementById('stripBody2');

    const printBtn = document.getElementById('printBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    // Load History from localStorage
    let history = JSON.parse(localStorage.getItem('ns_fuel_history')) || [];
    renderHistory();

    // Auto-calculate live status price when typing
    pumpInput.addEventListener('input', () => {
        const pumpPrice = parseFloat(pumpInput.value);
        if (!isNaN(pumpPrice) && pumpPrice > 0) {
            const statusPrice = calculateStatusPrice(pumpPrice);
            statusDisplay.textContent = `$${statusPrice.toFixed(3)}`;
            updateExample(pumpPrice, statusPrice);
        } else {
            statusDisplay.textContent = '$--.--';
            exampleOutput.innerHTML = '<span style="color:var(--text-muted);">Enter a valid pump price.</span>';
        }
    });

    // Generate Button Action
    generateBtn.addEventListener('click', () => {
        const pumpPrice = parseFloat(pumpInput.value);
        if (isNaN(pumpPrice) || pumpPrice <= 0) {
            alert('Please enter a valid pump price.');
            return;
        }

        const statusPrice = calculateStatusPrice(pumpPrice);
        generateCheatSheet(pumpPrice);
        saveToHistory(pumpPrice);
    });

    // Core Calculation Formulas
    function calculateStatusPrice(pumpPrice) {
        // Formula: Status Price = (Pump Price / 1.14) - 0.155
        return (pumpPrice / 1.14) - 0.155;
    }

    function updateExample(pumpPrice, statusPrice) {
        const customerAmount = 5.00;
        // Litres = Customer Amount / Status Price
        const litres = customerAmount / statusPrice;
        // Pump Amount = Litres * Pump Price (Unrounded intermediate, round final display)
        const exactPumpAmount = litres * pumpPrice;
        const roundedPumpAmount = Math.round(exactPumpAmount * 100) / 100;

        exampleOutput.innerHTML = `
            <p><strong>Status Price:</strong> $${statusPrice.toFixed(3)}</p>
            <p><strong>Litres given:</strong> ${litres.toFixed(3)} L</p>
            <p><strong>Customer Pays:</strong> $${customerAmount.toFixed(2)}</p>
            <p><strong>Pump Total to Enter:</strong> <span style="color:var(--accent-green); font-weight:bold;">$${roundedPumpAmount.toFixed(2)}</span></p>
        `;
    }

    function generateCheatSheet(pumpPrice) {
        const statusPrice = calculateStatusPrice(pumpPrice);
        const headerText = `${pumpPrice.toFixed(3)}/L`;
        
        stripHeader1.textContent = headerText;
        stripHeader2.textContent = headerText;

        let rowsHTML = '';
        for (let amount = 5; amount <= 100; amount += 5) {
            const litres = amount / statusPrice;
            const exactPumpTotal = litres * pumpPrice;
            const finalPumpTotal = Math.round(exactPumpTotal * 100) / 100;

            rowsHTML += `
                <div class="strip-row">
                    <span>${amount}</span>
                    <span class="col-dash">-</span>
                    <span class="col-val">${finalPumpTotal.toFixed(2)}</span>
                </div>
            `;
        }

        stripBody1.innerHTML = rowsHTML;
        stripBody2.innerHTML = rowsHTML;
    }

    // LocalStorage Management
    function saveToHistory(price) {
        const formatted = price.toFixed(3);
        if (!history.includes(formatted)) {
            history.unshift(formatted);
            if (history.length > 10) history.pop();
            localStorage.setItem('ns_fuel_history', JSON.stringify(history));
            renderHistory();
        }
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<li style="color:var(--text-muted); font-size:0.85rem; padding:4px;">No previous prices.</li>';
            return;
        }
        history.forEach(price => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `<span>$${price}</span> <i class="fa-solid fa-arrow-rotate-left"></i>`;
            li.addEventListener('click', () => {
                pumpInput.value = price;
                pumpInput.dispatchEvent(new Event('input'));
                generateBtn.click();
            });
            historyList.appendChild(li);
        });
    }

    // Helper to print/save isolated temporary document without ever navigating to about:blank
    function triggerIsolatedPrint() {
        const stripsContainerHtml = document.querySelector('.strips-container').outerHTML;
        if (stripBody1.querySelector('.placeholder-text')) {
            alert('Please generate the cheat sheet first.');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups for printing.');
            return;
        }

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>NS Fuel Cheat Sheet</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #fff;
            color: #000;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        .strips-container {
            display: flex;
            gap: 24px;
            justify-content: center;
        }
        .strip {
            width: 220px;
            border: 1px solid #000;
            background: #fff;
            font-family: Arial, sans-serif;
        }
        .strip-header {
            border-bottom: 1px solid #000;
            text-align: center;
            font-weight: bold;
            font-size: 1.15rem;
            padding: 8px 0;
            background: #fff;
        }
        .strip-body {
            padding: 4px 12px;
        }
        .strip-row {
            display: flex;
            justify-content: space-between;
            font-size: 1rem;
            padding: 3px 0;
            font-weight: 500;
        }
        .strip-row .col-val {
            text-align: right;
        }
        .strip-row .col-dash {
            text-align: center;
            padding: 0 6px;
        }
        @page {
            size: letter portrait;
            margin: 0.4in;
        }
    </style>
</head>
<body>
    ${stripsContainerHtml}
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // Attempt to close window safely; if blocked by browser/Safari policy, leave it open instead of about:blank
                setTimeout(function() {
                    try {
                        window.close();
                    } catch(e) {}
                }, 500);
            }, 250);
        };
    <\/script>
</body>
</html>`);
        printWindow.document.close();
    }

    // Toolbar Action Handlers
    printBtn.addEventListener('click', () => {
        triggerIsolatedPrint();
    });

    pdfBtn.addEventListener('click', () => {
        triggerIsolatedPrint();
    });

    downloadBtn.addEventListener('click', () => {
        const sheetHtml = document.getElementById('cheatSheet').outerHTML;
        const blob = new Blob([`<!DOCTYPE html><html><head><title>Cheat Sheet</title><style>body{font-family:Arial,sans-serif;padding:20px;display:flex;justify-content:center;}.strips-container{display:flex;gap:24px;}.strip{width:220px;border:1px solid #000;background:#fff;}.strip-header{border-bottom:1px solid #000;text-align:center;font-weight:bold;font-size:1.15rem;padding:8px 0;}.strip-body{padding:4px 12px;}.strip-row{display:flex;justify-content:space-between;font-size:1rem;padding:3px 0;font-weight:500;}.col-dash{padding:0 6px;}</style></head><body>${sheetHtml}</body></html>`], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NS_Fuel_Cheat_Sheet_${pumpInput.value || 'custom'}.html`;
        a.click();
        URL.revokeObjectURL(url);
    });

    copyBtn.addEventListener('click', () => {
        const rows = stripBody1.querySelectorAll('.strip-row');
        if (rows.length === 0 || stripBody1.querySelector('.placeholder-text')) {
            alert('Please generate the cheat sheet first.');
            return;
        }
        let textToCopy = `Nova Scotia Tax-Exempt Fuel Cheat Sheet (${stripHeader1.textContent})\n\n`;
        rows.forEach(row => {
            const spans = row.querySelectorAll('span');
            textToCopy += `${spans[0].innerText} - ${spans[2].innerText}\n`;
        });
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Cheat sheet strip copied to clipboard!');
        });
    });
});
