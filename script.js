document.addEventListener('DOMContentLoaded', () => {
    const pumpInput = document.getElementById('pumpPriceInput');
    const statusDisplay = document.getElementById('statusPriceDisplay');
    const generateBtn = document.getElementById('generateBtn');
    const exampleOutput = document.getElementById('exampleOutput');
    const cheatSheetBody = document.getElementById('cheatSheetBody');
    const sheetMeta = document.getElementById('sheetMeta');
    const historyList = document.getElementById('historyList');

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
        generateCheatSheet(pumpPrice, statusPrice);
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

    function generateCheatSheet(pumpPrice, statusPrice) {
        sheetMeta.textContent = `Pump Price: $${pumpPrice.toFixed(3)} | Status Price: $${statusPrice.toFixed(3)}`;
        cheatSheetBody.innerHTML = '';

        // Generate values from $5 through $100 in steps of $5
        for (let amount = 5; amount <= 100; amount += 5) {
            const litres = amount / statusPrice;
            const exactPumpTotal = litres * pumpPrice;
            const finalPumpTotal = Math.round(exactPumpTotal * 100) / 100;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>$${amount.toFixed(2)}</strong></td>
                <td><strong>$${finalPumpTotal.toFixed(2)}</strong></td>
            `;
            cheatSheetBody.appendChild(row);
        }
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

    // Toolbar Action Handlers
    printBtn.addEventListener('click', () => {
        window.print();
    });

    pdfBtn.addEventListener('click', () => {
        window.print();
    });

    downloadBtn.addEventListener('click', () => {
        const sheetHtml = document.getElementById('cheatSheet').outerHTML;
        const blob = new Blob([`<!DOCTYPE html><html><head><title>Cheat Sheet</title><style>body{font-family:sans-serif;padding:20px;}.cheat-table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:right;}th:first-child,td:first-child{text-align:left;}th{background:#f0f0f0;}.sheet-header{text-align:center;margin-bottom:20px;}</style></head><body>${sheetHtml}</body></html>`], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NS_Fuel_Cheat_Sheet_${pumpInput.value || 'custom'}.html`;
        a.click();
        URL.revokeObjectURL(url);
    });

    copyBtn.addEventListener('click', () => {
        const rows = cheatSheetBody.querySelectorAll('tr');
        if (rows.length === 0 || rows[0].classList.contains('placeholder-row')) {
            alert('Please generate the cheat sheet first.');
            return;
        }
        let textToCopy = "Nova Scotia Tax-Exempt Fuel Cheat Sheet\n\n";
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            textToCopy += `Customer Pays: ${cols[0].innerText} | Pump Total to Enter: ${cols[1].innerText}\n`;
        });
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Cheat sheet copied to clipboard!');
        });
    });
});
