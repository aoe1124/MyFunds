// 数据存储管理
const Storage = {
    // 获取所有资产数据
    getAllAssets() {
        try {
            const data = localStorage.getItem('assetData');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('读取数据失败：', error);
            return [];
        }
    },

    // 获取总资产数据（按月汇总）
    getTotalAssetsByMonth() {
        const assets = this.getAllAssets();
        if (!Array.isArray(assets)) {
            console.error('资产数据格式错误');
            return [];
        }

        const monthlyTotals = {};

        // 按月汇总所有账户的资产
        assets.forEach(asset => {
            const month = asset.date.substring(0, 7); // 格式：YYYY-MM
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = {
                    amount: 0
                };
            }
            monthlyTotals[month].amount += parseFloat(asset.amount);
        });

        // 获取所有月度备注
        const monthNotes = {};
        try {
            const data = localStorage.getItem('monthNotes');
            if (data) {
                Object.assign(monthNotes, JSON.parse(data));
            }
        } catch (error) {
            console.error('读取月度备注失败：', error);
        }

        // 转换为图表所需的数据格式
        return Object.entries(monthlyTotals)
            .map(([month, data]) => ({
                x: new Date(month).getTime(),
                y: data.amount,
                note: monthNotes[month] || ''  // 使用相同的月份格式作为键
            }))
            .sort((a, b) => a.x - b.x); // 按时间排序
    },

    // 保存资产数据
    saveAsset(asset) {
        const assets = this.getAllAssets();
        const newAssets = Array.isArray(assets) ? assets : [];
        newAssets.push(asset);
        localStorage.setItem('assetData', JSON.stringify(newAssets));
    },

    // 获取所有账户
    getAccounts() {
        try {
            const data = localStorage.getItem('accounts');
            console.log('读取账户数据：', data);
            const accounts = data ? JSON.parse(data) : [];
            console.log('解析后的账户数据：', accounts);
            return Array.isArray(accounts) ? accounts : [];
        } catch (error) {
            console.error('读取账户数据失败：', error);
            return [];
        }
    },

    // 添加新账户
    addAccount(account) {
        const accounts = this.getAccounts();
        // 检查账户是否已存在
        if (!accounts.some(a => a.name === account.name)) {
            accounts.push(account);
            localStorage.setItem('accounts', JSON.stringify(accounts));
            console.log('保存账户数据：', accounts);
        }
    },

    // 更新账户信息
    updateAccount(account) {
        const accounts = this.getAccounts();
        const index = accounts.findIndex(a => a.name === account.name);
        if (index !== -1) {
            accounts[index] = account;
            localStorage.setItem('accounts', JSON.stringify(accounts));
            console.log('更新账户数据：', accounts);
        }
    },

    // 删除账户
    deleteAccount(accountName) {
        const accounts = this.getAccounts();
        const newAccounts = accounts.filter(a => a.name !== accountName);
        localStorage.setItem('accounts', JSON.stringify(newAccounts));
        console.log('删除账户后的数据：', newAccounts);

        // 删除该账户的所有金额数据
        const data = localStorage.getItem('accountData');
        const accountData = data ? JSON.parse(data) : {};
        Object.keys(accountData).forEach(key => {
            if (key.startsWith(`${accountName}-`)) {
                delete accountData[key];
            }
        });
        localStorage.setItem('accountData', JSON.stringify(accountData));
    },

    // 获取指定账户在指定月份的金额
    getAccountAmount(accountName, monthKey) {
        try {
            const data = localStorage.getItem('accountData');
            const accountData = data ? JSON.parse(data) : {};
            const amount = accountData[`${accountName}-${monthKey}`];
            return amount !== undefined ? amount : 0;
        } catch (error) {
            console.error('读取账户金额数据失败：', error);
            return 0;
        }
    },

    // 设置指定账户在指定月份的金额
    setAccountAmount(accountName, monthKey, amount) {
        try {
            const data = localStorage.getItem('accountData');
            const accountData = data ? JSON.parse(data) : {};
            accountData[`${accountName}-${monthKey}`] = amount;
            localStorage.setItem('accountData', JSON.stringify(accountData));
            console.log(`设置金额：${accountName}, ${monthKey}, ${amount}`);

            // 同步更新资产数据
            const assets = this.getAllAssets();
            const existingIndex = assets.findIndex(asset => 
                asset.account === accountName && asset.date.startsWith(monthKey)
            );

            if (existingIndex >= 0) {
                assets[existingIndex].amount = amount;
            } else {
                assets.push({
                    account: accountName,
                    date: `${monthKey}-01`,
                    amount: amount
                });
            }
            localStorage.setItem('assetData', JSON.stringify(assets));
        } catch (error) {
            console.error('保存账户金额数据失败：', error);
        }
    },

    // 获取指定月份的总金额
    getMonthlyTotal(monthKey) {
        try {
            const accounts = this.getAccounts();
            return accounts.reduce((total, account) => {
                const amount = this.getAccountAmount(account.name, monthKey);
                return total + (amount || 0);
            }, 0);
        } catch (error) {
            console.error('计算月度总额失败：', error);
            return 0;
        }
    },

    // 获取月度备注
    getMonthNote(monthKey) {
        try {
            const data = localStorage.getItem('monthNotes');
            const notes = data ? JSON.parse(data) : {};
            // monthKey 格式：YYYY-MM，我们需要确保不同年份的相同月份不会混淆
            return notes[monthKey] || '';
        } catch (error) {
            console.error('读取月度备注失败：', error);
            return '';
        }
    },

    // 设置月度备注
    setMonthNote(monthKey, note) {
        try {
            const data = localStorage.getItem('monthNotes');
            const notes = data ? JSON.parse(data) : {};
            // monthKey 格式：YYYY-MM，我们需要确保不同年份的相同月份不会混淆
            if (note.trim()) {
                notes[monthKey] = note.trim();
            } else {
                delete notes[monthKey];
            }
            localStorage.setItem('monthNotes', JSON.stringify(notes));
            
            // 调试日志
            console.log('保存备注：', {
                monthKey,
                note,
                allNotes: notes
            });
        } catch (error) {
            console.error('保存月度备注失败：', error);
        }
    },

    // 获取所有记录数据
    getAllRecords() {
        return {
            accountData: localStorage.getItem('accountData') ? JSON.parse(localStorage.getItem('accountData')) : {},
            monthNotes: localStorage.getItem('monthNotes') ? JSON.parse(localStorage.getItem('monthNotes')) : {},
            assetData: this.getAllAssets()
        };
    },

    // 清除所有数据（用于测试）
    clearAll() {
        localStorage.removeItem('accounts');
        localStorage.removeItem('accountData');
        localStorage.removeItem('assetData');
        localStorage.removeItem('monthNotes');
        console.log('已清除所有数据');
    }
}; 