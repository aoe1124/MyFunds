// 初始化数据存储
let assetData = JSON.parse(localStorage.getItem('assetData')) || {
    accounts: {},
    notes: {}
};

// 初始化图表
let totalChart = null;
let accountsChart = null;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateCharts();
    
    // 表单提交处理
    document.getElementById('assetForm').addEventListener('submit', handleFormSubmit);
});

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('date').value;
    const account = document.getElementById('account').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const note = document.getElementById('note').value.trim();
    
    // 保存数据
    if (!assetData.accounts[account]) {
        assetData.accounts[account] = {};
    }
    assetData.accounts[account][date] = amount;
    
    // 如果有备注，保存备注
    if (note) {
        if (!assetData.notes[date]) {
            assetData.notes[date] = {};
        }
        assetData.notes[date][account] = note;
    }
    
    // 保存到localStorage
    localStorage.setItem('assetData', JSON.stringify(assetData));
    
    // 更新图表
    updateCharts();
    
    // 重置表单
    e.target.reset();
}

// 初始化图表
function initializeCharts() {
    // 总资产图表
    const totalCtx = document.getElementById('totalChart').getContext('2d');
    totalChart = new Chart(totalCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '总资产',
                data: [],
                borderColor: '#0071e3',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const date = context[0].label;
                            if (assetData.notes[date]) {
                                return Object.values(assetData.notes[date]).join('\n');
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });
    
    // 账户明细图表
    const accountsCtx = document.getElementById('accountsChart').getContext('2d');
    accountsChart = new Chart(accountsCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const date = context[0].label;
                            const account = context[0].dataset.label;
                            if (assetData.notes[date]?.[account]) {
                                return assetData.notes[date][account];
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });
}

// 更新图表
function updateCharts() {
    // 获取所有日期并排序
    const dates = new Set();
    Object.values(assetData.accounts).forEach(accountData => {
        Object.keys(accountData).forEach(date => dates.add(date));
    });
    const sortedDates = Array.from(dates).sort();
    
    // 计算每个日期的总资产
    const totalData = sortedDates.map(date => {
        let total = 0;
        Object.values(assetData.accounts).forEach(accountData => {
            if (accountData[date]) {
                total += accountData[date];
            }
        });
        return total;
    });
    
    // 更新总资产图表
    totalChart.data.labels = sortedDates;
    totalChart.data.datasets[0].data = totalData;
    totalChart.update();
    
    // 更新总资产显示
    const latestTotal = totalData[totalData.length - 1] || 0;
    document.getElementById('totalAmount').textContent = latestTotal.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // 更新账户明细图表
    const colors = ['#0071e3', '#5856d6', '#ff2d55', '#34c759', '#ff9500'];
    const datasets = Object.entries(assetData.accounts).map(([account, data], index) => {
        return {
            label: account,
            data: sortedDates.map(date => data[date] || null),
            borderColor: colors[index % colors.length],
            tension: 0.1
        };
    });
    
    accountsChart.data.labels = sortedDates;
    accountsChart.data.datasets = datasets;
    accountsChart.update();
} 