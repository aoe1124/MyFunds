// 数据管理页面逻辑
const Management = {
    // 年份范围
    years: Array.from({length: 10}, (_, i) => 2025 - i),
    
    // 初始化
    init() {
        // 初始化事件监听
        this.initEvents();
        
        // 渲染账户列表
        this.renderAccountList();
        
        // 生成年份表格
        this.renderYearList();
    },

    // 初始化事件监听
    initEvents() {
        // 添加账户按钮
        document.querySelector('.add-account-btn').addEventListener('click', () => {
            this.showAddAccountDialog();
        });

        // 导出数据按钮
        document.querySelector('.export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // 导入数据按钮
        document.querySelector('.import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        // 文件选择变化
        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
    },

    // 渲染账户列表
    renderAccountList() {
        const container = document.querySelector('.account-list');
        const accounts = Storage.getAccounts();
        
        container.innerHTML = accounts.map(account => `
            <div class="account-item">
                <div class="account-item-header">
                    <span class="account-name">${account.name}</span>
                <div class="account-actions">
                        <button class="action-btn edit-btn" data-account="${account.name}">编辑</button>
                        <button class="action-btn delete-btn" data-account="${account.name}">删除</button>
                    </div>
                </div>
                <div class="account-time">
                    ${account.startDate} ~ ${account.endDate || '至今'}
                </div>
            </div>
        `).join('');

        // 添加编辑和删除事件监听
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const accountName = btn.dataset.account;
                const account = accounts.find(a => a.name === accountName);
                if (account) {
                    this.showEditAccountDialog(account);
                }
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const accountName = btn.dataset.account;
                if (confirm(`确定要删除账户"${accountName}"吗？`)) {
                    Storage.deleteAccount(accountName);
                    this.renderAccountList();
                    this.renderYearList();
                }
            });
        });
    },

    // 显示编辑账户对话框
    showEditAccountDialog(account) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>编辑账户</h3>
                <div class="dialog-content">
                    <div class="form-group">
                        <label>账户名称</label>
                        <input type="text" id="accountName" value="${account.name}">
                    </div>
                    <div class="form-group">
                        <label>起始时间</label>
                        <div class="date-selects">
                            <select id="startYear">
                                ${this.years.map(year => 
                                    `<option value="${year}" ${account.startDate.startsWith(year) ? 'selected' : ''}>${year}年</option>`
                                ).join('')}
                            </select>
                            <select id="startMonth">
                                ${Array.from({length: 12}, (_, i) => {
                                    const month = (i + 1).toString().padStart(2, '0');
                                    return `<option value="${month}" ${account.startDate.endsWith(month) ? 'selected' : ''}>${i + 1}月</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>结束时间</label>
                        <div class="date-selects">
                            <select id="endYear">
                                <option value="">无结束时间</option>
                                ${this.years.map(year => 
                                    `<option value="${year}" ${account.endDate?.startsWith(year) ? 'selected' : ''}>${year}年</option>`
                                ).join('')}
                            </select>
                            <select id="endMonth" ${!account.endDate ? 'disabled' : ''}>
                                ${Array.from({length: 12}, (_, i) => {
                                    const month = (i + 1).toString().padStart(2, '0');
                                    return `<option value="${month}" ${account.endDate?.endsWith(month) ? 'selected' : ''}>${i + 1}月</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-btn">取消</button>
                    <button class="confirm-btn">确定</button>
                </div>
            </div>
        `;

        // 添加事件监听
        const endYear = dialog.querySelector('#endYear');
        const endMonth = dialog.querySelector('#endMonth');
        
        // 结束年份变化时启用/禁用月份选择
        endYear.addEventListener('change', () => {
            endMonth.disabled = !endYear.value;
        });

        // 取消按钮
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        // 确定按钮
        dialog.querySelector('.confirm-btn').addEventListener('click', () => {
            const newName = dialog.querySelector('#accountName').value.trim();
            const startYear = dialog.querySelector('#startYear').value;
            const startMonth = dialog.querySelector('#startMonth').value;
            const endYear = dialog.querySelector('#endYear').value;
            const endMonth = dialog.querySelector('#endMonth').value;

            if (!newName) {
                alert('请输入账户名称');
                return;
            }

            const startDate = `${startYear}-${startMonth}`;
            const endDate = endYear ? `${endYear}-${endMonth}` : null;

            // 验证结束时间不早于开始时间
            if (endDate && endDate < startDate) {
                alert('结束时间不能早于开始时间');
                return;
            }

            // 如果账户名称发生变化，需要删除旧账户并创建新账户
            if (newName !== account.name) {
                Storage.deleteAccount(account.name);
                Storage.addAccount({
                    name: newName,
                    startDate,
                    endDate
                });
            } else {
                // 更新账户
                Storage.updateAccount({
                    name: account.name,
                    startDate,
                    endDate
                });
            }

            document.body.removeChild(dialog);
            this.renderAccountList();
            this.renderYearList();
        });

        // 显示对话框
        document.body.appendChild(dialog);
        dialog.querySelector('#accountName').focus();
    },

    // 显示添加账户对话框
    showAddAccountDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>添加新账户</h3>
                <div class="dialog-content">
                    <div class="form-group">
                        <label>账户名称</label>
                        <input type="text" id="accountName" placeholder="请输入账户名称">
                    </div>
                    <div class="form-group">
                        <label>起始时间</label>
                        <div class="date-selects">
                            <select id="startYear">
                                ${this.years.map(year => 
                                    `<option value="${year}">${year}年</option>`
                                ).join('')}
                            </select>
                            <select id="startMonth">
                                ${Array.from({length: 12}, (_, i) => 
                                    `<option value="${(i + 1).toString().padStart(2, '0')}">${i + 1}月</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>结束时间</label>
                        <div class="date-selects">
                            <select id="endYear">
                                <option value="">无结束时间</option>
                                ${this.years.map(year => 
                                    `<option value="${year}">${year}年</option>`
                                ).join('')}
                            </select>
                            <select id="endMonth" disabled>
                                ${Array.from({length: 12}, (_, i) => 
                                    `<option value="${(i + 1).toString().padStart(2, '0')}">${i + 1}月</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-btn">取消</button>
                    <button class="confirm-btn">确定</button>
                </div>
            </div>
        `;

        // 添加事件监听
        const endYear = dialog.querySelector('#endYear');
        const endMonth = dialog.querySelector('#endMonth');
        
        // 结束年份变化时启用/禁用月份选择
        endYear.addEventListener('change', () => {
            endMonth.disabled = !endYear.value;
        });

        // 取消按钮
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        // 确定按钮
        dialog.querySelector('.confirm-btn').addEventListener('click', () => {
            const name = dialog.querySelector('#accountName').value.trim();
            const startYear = dialog.querySelector('#startYear').value;
            const startMonth = dialog.querySelector('#startMonth').value;
            const endYear = dialog.querySelector('#endYear').value;
            const endMonth = dialog.querySelector('#endMonth').value;

            if (!name) {
                alert('请输入账户名称');
                return;
            }

            const startDate = `${startYear}-${startMonth}`;
            const endDate = endYear ? `${endYear}-${endMonth}` : null;

            // 验证结束时间不早于开始时间
            if (endDate && endDate < startDate) {
                alert('结束时间不能早于开始时间');
                return;
            }

            // 添加账户
            Storage.addAccount({
                name,
                startDate,
                endDate
            });

            document.body.removeChild(dialog);
            this.renderAccountList();
            this.renderYearList();
        });

        // 显示对话框
        document.body.appendChild(dialog);
        dialog.querySelector('#accountName').focus();
    },

    // 创建表格结构
    createYearTable(year) {
        const section = document.createElement('div');
        section.className = 'year-section';
        
        // 创建标题
        const title = document.createElement('h2');
        title.textContent = `${year}年度账户数据`;
        section.appendChild(title);

        // 创建表格包装器
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        section.appendChild(wrapper);

        // 创建表格
        const table = document.createElement('table');
        table.className = 'data-table';
        wrapper.appendChild(table);

        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const nameHeader = document.createElement('th');
        nameHeader.textContent = '账户';
        headerRow.appendChild(nameHeader);

        // 添加月份表头
        for (let i = 1; i <= 12; i++) {
            const monthHeader = document.createElement('th');
            monthHeader.textContent = `${i}月`;
            headerRow.appendChild(monthHeader);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // 创建表体
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        // 创建表尾
        const tfoot = document.createElement('tfoot');
        
        // 创建备注行
        const noteRow = document.createElement('tr');
        noteRow.className = 'note-row';
        const noteLabel = document.createElement('td');
        noteLabel.textContent = '备注';
        noteRow.appendChild(noteLabel);

        // 添加备注输入框
        for (let month = 1; month <= 12; month++) {
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'note-input';
            input.placeholder = '-';
            input.dataset.month = monthKey;
            
            // 获取并设置备注内容
            const note = Storage.getMonthNote(monthKey);
            if (note) {
                input.value = note;
            }

            // 添加事件监听
            input.addEventListener('blur', () => {
                const currentNote = input.value;
                Storage.setMonthNote(monthKey, currentNote);
                
                // 刷新图表
                if (window.assetChart) {
                    const totalAssetData = Storage.getTotalAssetsByMonth();
                    window.assetChart.updateSeries([{
                        name: '总资产',
                        data: totalAssetData
                    }]);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });

            td.appendChild(input);
            noteRow.appendChild(td);
        }
        tfoot.appendChild(noteRow);

        // 创建总计行
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        const totalLabel = document.createElement('td');
        totalLabel.textContent = '月度总计';
        totalRow.appendChild(totalLabel);

        for (let i = 0; i < 12; i++) {
            const td = document.createElement('td');
            td.textContent = '-';
            totalRow.appendChild(td);
        }
        tfoot.appendChild(totalRow);
        table.appendChild(tfoot);

        return section;
    },

    // 创建可编辑单元格
    createEditableCell(accountName, monthKey, currentValue) {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cell-input';
        input.value = currentValue ? currentValue.toLocaleString('zh-CN') : '';
        input.placeholder = '-';
        
        // 添加失去焦点事件
        input.addEventListener('blur', () => {
            const amount = parseFloat(input.value.replace(/,/g, ''));
            if (!isNaN(amount)) {
                Storage.setAccountAmount(accountName, monthKey, amount);
                input.value = amount.toLocaleString('zh-CN');
                this.updateTotalRow(monthKey);
            } else if (input.value === '') {
                Storage.setAccountAmount(accountName, monthKey, 0);
                this.updateTotalRow(monthKey);
            }
        });

        // 添加键盘事件
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });

        td.appendChild(input);
        return td;
    },

    // 渲染年份列表
    renderYearList() {
        const container = document.querySelector('.year-list');
        container.innerHTML = '';

        // 生成每个年份的表格
        this.years.forEach(year => {
            const yearSection = this.createYearTable(year);
            container.appendChild(yearSection);
        });

        // 更新所有表格数据
        this.updateTables();
    },

    // 更新表格数据
    updateTables() {
        const accounts = Storage.getAccounts();

        this.years.forEach(year => {
            const table = document.querySelector(`.year-section:nth-child(${this.years.indexOf(year) + 1}) .data-table tbody`);
            if (!table) return;

            table.innerHTML = '';

            accounts.forEach(account => {
                // 检查账户在当前年份是否有效
                const yearStart = `${year}-01`;
                const yearEnd = `${year}-12`;
                if (account.startDate > yearEnd || (account.endDate && account.endDate < yearStart)) {
                    return; // 跳过此账户
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${account.name}</td>`;

                for (let month = 1; month <= 12; month++) {
                    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
                    // 检查月份是否在账户的有效期内
                    if (monthKey < account.startDate || (account.endDate && monthKey > account.endDate)) {
                        tr.innerHTML += '<td class="disabled">-</td>';
        } else {
                        const amount = Storage.getAccountAmount(account.name, monthKey);
                        const td = this.createEditableCell(account.name, monthKey, amount);
                        tr.appendChild(td);
                    }
                }

                table.appendChild(tr);
            });

            this.updateAllTotalRows(year);
        });
    },

    // 更新指定月份的总计
    updateTotalRow(monthKey) {
        const [year] = monthKey.split('-');
        const yearIndex = this.years.indexOf(parseInt(year));
        if (yearIndex === -1) return;

        const totalRow = document.querySelector(`.year-section:nth-child(${yearIndex + 1}) .total-row`);
        if (!totalRow) return;

        const month = parseInt(monthKey.split('-')[1]);
        const total = Storage.getMonthlyTotal(monthKey);
        totalRow.children[month].textContent = total ? total.toLocaleString('zh-CN') : '-';
    },

    // 更新指定年份的所有月份总计
    updateAllTotalRows(year) {
        const totalRow = document.querySelector(`.year-section:nth-child(${this.years.indexOf(year) + 1}) .total-row`);
        if (!totalRow) return;

        for (let month = 1; month <= 12; month++) {
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            const total = Storage.getMonthlyTotal(monthKey);
            totalRow.children[month].textContent = total ? total.toLocaleString('zh-CN') : '-';
        }
    },

    // 导出数据
    exportData(isBackup = false) {
        const data = {
            accounts: Storage.getAccounts(),
            records: Storage.getAllRecords()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 如果是备份，添加backup标记到文件名
        const date = new Date().toISOString().split('T')[0];
        a.download = isBackup 
            ? `myfunds_backup_before_import_${date}.json`
            : `myfunds_backup_${date}.json`;
            
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 导入数据
    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!data.accounts || !Array.isArray(data.accounts) || !data.records) {
                    throw new Error('数据格式不正确');
                }

                // 准备确认信息
                const accountCount = data.accounts.length;
                const monthCount = Object.keys(data.records.accountData || {}).length;
                const confirmMessage = `即将导入的数据包含：\n` +
                    `- ${accountCount} 个账户\n` +
                    `- ${monthCount} 条账户记录\n\n` +
                    `导入新数据将完全覆盖现有数据。\n` +
                    `为了安全起见，我们会自动备份当前数据。\n\n` +
                    `是否继续？`;

                // 确认导入
                if (confirm(confirmMessage)) {
                    // 先导出当前数据作为备份
                    this.exportData(true);
                    
                    // 导入新数据
                    localStorage.setItem('accounts', JSON.stringify(data.accounts));
                    localStorage.setItem('accountData', JSON.stringify(data.records.accountData));
                    localStorage.setItem('monthNotes', JSON.stringify(data.records.monthNotes));
                    localStorage.setItem('assetData', JSON.stringify(data.records.assetData));
                    
                    // 刷新页面显示
                    this.renderAccountList();
                    this.renderYearList();
                    
                    alert('数据导入成功！\n如需恢复之前的数据，请查看自动生成的备份文件。');
                }
            } catch (err) {
                alert('导入失败：' + err.message);
            }
        };
        reader.readAsText(file);
        // 清空文件选择，确保可以重复选择同一个文件
        document.getElementById('import-file').value = '';
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Management.init();
}); 