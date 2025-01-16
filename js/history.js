// 账户历史模块
const History = {
    // 图表实例
    chart: null,
    // 当前选中的账户
    selectedAccounts: [],
    // 是否处于对比模式
    isCompareMode: false,

    // 初始化
    init() {
        this.initTabs();
        this.initChart();
        this.initEventListeners();
        this.updateStats();
    },

    // 初始化账户标签
    initTabs() {
        const tabHeader = document.querySelector('.tab-header');
        const accounts = Storage.getAccounts();
        
        tabHeader.innerHTML = accounts.map(account => `
            <div class="account-tab" data-account="${account.name}">
                ${account.name}
            </div>
        `).join('');

        // 默认选中第一个账户
        if (accounts.length > 0) {
            this.selectAccount(accounts[0].name);
        }
    },

    // 初始化图表
    initChart() {
        const options = {
            chart: {
                type: 'line',
                height: '100%',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            grid: {
                borderColor: '#f1f1f1'
            },
            xaxis: {
                type: 'category',
                labels: {
                    formatter: function(value) {
                        return value.replace(/^(\d{4})-(\d{2})$/, '$1年$2月');
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function(value) {
                        return value.toLocaleString('zh-CN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                }
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function(value) {
                        return '￥' + value.toLocaleString('zh-CN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left'
            }
        };

        this.chart = new ApexCharts(
            document.querySelector("#account-history-chart"),
            options
        );
        this.chart.render();
    },

    // 初始化事件监听
    initEventListeners() {
        // 账户标签点击事件
        document.querySelector('.tab-header').addEventListener('click', (e) => {
            const tab = e.target.closest('.account-tab');
            if (tab) {
                const account = tab.dataset.account;
                if (this.isCompareMode) {
                    this.toggleAccount(account);
                } else {
                    this.selectAccount(account);
                }
            }
        });

        // 对比模式切换
        document.querySelector('.compare-mode-btn').addEventListener('click', (e) => {
            this.toggleCompareMode();
        });

        // 时间范围选择
        document.querySelector('.time-range-select select').addEventListener('change', (e) => {
            this.updateChartData(this.filterDataByTimeRange(e.target.value));
        });
    },

    // 选择账户
    selectAccount(account) {
        this.selectedAccounts = [account];
        this.updateUI();
        this.updateChartData();
    },

    // 切换账户（对比模式）
    toggleAccount(account) {
        const index = this.selectedAccounts.indexOf(account);
        if (index === -1) {
            this.selectedAccounts.push(account);
        } else {
            this.selectedAccounts.splice(index, 1);
        }
        this.updateUI();
        this.updateChartData();
    },

    // 切换对比模式
    toggleCompareMode() {
        this.isCompareMode = !this.isCompareMode;
        if (!this.isCompareMode) {
            // 退出对比模式时，只保留第一个选中的账户
            this.selectedAccounts = this.selectedAccounts.slice(0, 1);
        }
        this.updateUI();
        this.updateChartData();
    },

    // 更新UI
    updateUI() {
        // 更新标签状态
        document.querySelectorAll('.account-tab').forEach(tab => {
            const account = tab.dataset.account;
            tab.classList.toggle('active', this.selectedAccounts.includes(account));
        });

        // 更新对比模式按钮状态
        document.querySelector('.compare-mode-btn').classList.toggle('active', this.isCompareMode);
    },

    // 更新图表数据
    updateChartData(timeRange = 'all') {
        const data = Storage.getAccountData();
        const months = Object.keys(data);
        const filteredMonths = this.filterDataByTimeRange(timeRange, months);

        const series = this.selectedAccounts.map(account => ({
            name: account,
            data: filteredMonths.map(month => 
                parseFloat(data[month]?.[account] || 0)
            )
        }));

        this.chart.updateOptions({
            xaxis: {
                categories: filteredMonths
            }
        });

        this.chart.updateSeries(series);
        this.updateStats();
    },

    // 根据时间范围筛选数据
    filterDataByTimeRange(range, months = null) {
        if (!months) {
            months = Object.keys(Storage.getAccountData());
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        switch (range) {
            case '1y':
                return months.filter(month => {
                    const [year, monthNum] = month.split('-').map(Number);
                    return (currentYear - year) * 12 + (currentMonth - monthNum) <= 12;
                });
            case '3y':
                return months.filter(month => {
                    const [year, monthNum] = month.split('-').map(Number);
                    return (currentYear - year) * 12 + (currentMonth - monthNum) <= 36;
                });
            case '5y':
                return months.filter(month => {
                    const [year, monthNum] = month.split('-').map(Number);
                    return (currentYear - year) * 12 + (currentMonth - monthNum) <= 60;
                });
            default:
                return months;
        }
    },

    // 更新统计信息
    updateStats() {
        if (this.selectedAccounts.length !== 1) {
            // 对比模式下不显示统计信息
            document.querySelector('.account-stats').style.display = 'none';
            return;
        }

        document.querySelector('.account-stats').style.display = 'grid';
        const account = this.selectedAccounts[0];
        const data = Storage.getAccountData();
        const values = Object.values(data)
            .map(monthData => parseFloat(monthData[account] || 0))
            .filter(value => !isNaN(value));

        if (values.length === 0) return;

        // 计算年度增长率
        const currentValue = values[values.length - 1];
        const lastYearValue = values[values.length - 13] || values[0];
        const growthRate = ((currentValue - lastYearValue) / lastYearValue * 100).toFixed(2);

        // 更新统计值
        document.getElementById('yearly-growth').textContent = 
            `${growthRate}%`;
        document.getElementById('highest-amount').textContent = 
            `￥${Math.max(...values).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`;
        document.getElementById('lowest-amount').textContent = 
            `￥${Math.min(...values).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`;
        document.getElementById('average-amount').textContent = 
            `￥${(values.reduce((a, b) => a + b, 0) / values.length).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`;
    }
}; 