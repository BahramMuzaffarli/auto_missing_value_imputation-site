class MissingValueImputer {
    constructor() {
        this.originalData = [];
        this.processedData = [];
        this.headers = [];
        this.missingCounts = {};
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    init() {
        this.bindEvents();
        // İmputation bölməsini başlanğıcda yığcam et (CSV Yüklə düyməsi görünən)
        document.getElementById('imputationSection').classList.add('collapsed');
    }

    bindEvents() {
        // File upload events - iki fərqli input
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileInput2 = document.getElementById('fileInput2');
        const uploadBtn = document.getElementById('uploadBtn');

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        fileInput2.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        uploadArea.addEventListener('click', () => fileInput.click());

        // Imputation events
        document.getElementById('columnSelect').addEventListener('change', (e) => {
            this.updateColumnStats(e.target.value);
        });

        document.querySelectorAll('.imputation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.target.dataset.method;
                const column = document.getElementById('columnSelect').value;
                if (column) {
                    this.applyImputation(column, method);
                } else {
                    this.showMessage('Zəhmət olmasa sütun seçin', 'error');
                }
            });
        });

        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetData());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadCSV());
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showMessage('Zəhmət olmasa CSV faylı seçin', 'error');
            return;
        }

        this.showLoading(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                this.parseCSV(e.target.result);
                this.showLoading(false);
                this.showMessage('Fayl uğurla yükləndi!', 'success');
            } catch (error) {
                this.showLoading(false);
                this.showMessage('Fayl oxuma xətası: ' + error.message, 'error');
            }
        };

        reader.onerror = () => {
            this.showLoading(false);
            this.showMessage('Fayl oxuma xətası', 'error');
        };

        reader.readAsText(file);
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('Fayl boşdur');
        }

        // Parse headers
        this.headers = this.parseCSVLine(lines[0]);

        // Parse data rows
        this.originalData = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === this.headers.length) {
                const row = {};
                this.headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                this.originalData.push(row);
            }
        }

        this.processedData = JSON.parse(JSON.stringify(this.originalData)); // Deep copy
        this.analyzeMissingValues();
        this.displayData();
        this.updateStats();
        this.populateColumnSelect();

        document.getElementById('dataSection').classList.remove('hidden');
        document.getElementById('imputationSection').classList.remove('collapsed');
        this.currentPage = 1; // Reset sayfalamayı
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    analyzeMissingValues() {
        this.missingCounts = {};

        this.headers.forEach(header => {
            this.missingCounts[header] = 0;
        });

        this.processedData.forEach(row => {
            this.headers.forEach(header => {
                const value = row[header];
                if (this.isMissing(value)) {
                    this.missingCounts[header]++;
                }
            });
        });
    }

    isMissing(value) {
        return value === '' ||
               value === null ||
               value === undefined ||
               value.toString().toLowerCase() === 'na' ||
               value.toString().toLowerCase() === 'n/a' ||
               value.toString().toLowerCase() === 'null' ||
               value.toString().toLowerCase() === 'none';
    }

    displayData() {
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');

        // Create headers
        tableHead.innerHTML = '<tr>' +
            this.headers.map(header =>
                `<th>${header} (${this.missingCounts[header]} missing)</th>`
            ).join('') +
            '</tr>';

        // Pagination hesabı
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const displayData = this.processedData.slice(startIndex, endIndex);

        // Create data rows
        tableBody.innerHTML = displayData.map(row =>
            '<tr>' +
            this.headers.map(header => {
                const value = row[header];
                const isMissing = this.isMissing(value);
                return `<td class="${isMissing ? 'missing-cell' : ''}">${value}</td>`;
            }).join('') +
            '</tr>'
        ).join('');

        // Pagination əlavə et
        this.renderPagination();
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.processedData.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = `<div class="pagination-info">Səhifə ${this.currentPage} / ${totalPages}</div>`;
        paginationHTML += '<button class="prev-btn" ' + (this.currentPage === 1 ? 'disabled' : '') + '>← Əvvəl</button>';

        // Səhifə nömrələri
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        paginationHTML += `<button class="next-btn" ${this.currentPage === totalPages ? 'disabled' : ''}>Sonra →</button>`;

        pagination.innerHTML = paginationHTML;

        // Event listeners
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPage = parseInt(btn.dataset.page);
                this.displayData();
                document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
            });
        });

        document.querySelector('.prev-btn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayData();
                document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
            }
        });

        document.querySelector('.next-btn').addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.displayData();
                document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    updateStats() {
        document.getElementById('totalRows').textContent = this.processedData.length;
        document.getElementById('totalColumns').textContent = this.headers.length;
        document.getElementById('missingValues').textContent =
            Object.values(this.missingCounts).reduce((sum, count) => sum + count, 0);
    }

    populateColumnSelect() {
        const select = document.getElementById('columnSelect');
        select.innerHTML = '<option value="">Sütun seçin...</option>' +
            this.headers.map(header =>
                `<option value="${header}">${header} (${this.missingCounts[header]} missing)</option>`
            ).join('');
    }

    updateColumnStats(columnName) {
        if (!columnName) return;

        const columnData = this.processedData.map(row => row[columnName])
            .filter(value => !this.isMissing(value))
            .map(value => parseFloat(value))
            .filter(value => !isNaN(value));

        if (columnData.length === 0) {
            this.showMessage('Bu sütunda riyazi əməliyyat üçün uyğun qiymət yoxdur', 'error');
            return;
        }

        // Could add more detailed stats here if needed
        this.showMessage(`${columnName} sütunu seçildi (${columnData.length} numeric qiymət)`, 'success');
    }

    applyImputation(columnName, method) {
        this.processedData = JSON.parse(JSON.stringify(this.originalData)); // Reset to original

        switch (method) {
            case 'mean':
                this.imputeMean(columnName);
                break;
            case 'median':
                this.imputeMedian(columnName);
                break;
            case 'delete':
                this.deleteRowsWithMissing(columnName);
                break;
            default:
                this.showMessage('Naməlum imputasiya metodu', 'error');
                return;
        }

        this.analyzeMissingValues();
        this.currentPage = 1; // Reset sayfalamayı
        this.displayData();
        this.updateStats();
        this.populateColumnSelect();

        const methodNames = {
            'mean': 'Orta qiymət',
            'median': 'Median',
            'delete': 'Sətir silmə'
        };

        this.showMessage(`${methodNames[method]} imputasiyası ${columnName} sütununa tətbiq edildi`, 'success');
    }

    imputeMean(columnName) {
        const values = this.processedData.map(row => row[columnName])
            .filter(value => !this.isMissing(value))
            .map(value => parseFloat(value))
            .filter(value => !isNaN(value));

        if (values.length === 0) {
            this.showMessage('Orta qiymət hesablanmaq üçün kifayət qədər numeric qiymət yoxdur', 'error');
            return;
        }

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

        this.processedData.forEach(row => {
            if (this.isMissing(row[columnName])) {
                row[columnName] = mean.toFixed(4);
            }
        });
    }

    imputeMedian(columnName) {
        const values = this.processedData.map(row => row[columnName])
            .filter(value => !this.isMissing(value))
            .map(value => parseFloat(value))
            .filter(value => !isNaN(value))
            .sort((a, b) => a - b);

        if (values.length === 0) {
            this.showMessage('Median hesablanmaq üçün kifayət qədər numeric qiymət yoxdur', 'error');
            return;
        }

        const median = values.length % 2 === 0
            ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
            : values[Math.floor(values.length / 2)];

        this.processedData.forEach(row => {
            if (this.isMissing(row[columnName])) {
                row[columnName] = median.toFixed(4);
            }
        });
    }

    deleteRowsWithMissing(columnName) {
        this.processedData = this.processedData.filter(row => !this.isMissing(row[columnName]));
    }

    resetData() {
        this.processedData = JSON.parse(JSON.stringify(this.originalData));
        this.analyzeMissingValues();
        this.currentPage = 1; // Reset sayfalamayı
        this.displayData();
        this.updateStats();
        this.populateColumnSelect();
        this.showMessage('Verilənlər sıfırlandı', 'success');
    }

    downloadCSV() {
        if (this.processedData.length === 0) {
            this.showMessage('Yükləmək üçün verilənlər yoxdur', 'error');
            return;
        }

        const csvContent = [
            this.headers.join(','),
            ...this.processedData.map(row =>
                this.headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma or quote
                    if (value.toString().includes(',') || value.toString().includes('"')) {
                        return '"' + value.toString().replace(/"/g, '""') + '"';
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'processed_data.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        this.showMessage('CSV faylı yükləndi!', 'success');
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.classList.remove('hidden');

        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MissingValueImputer();
});
