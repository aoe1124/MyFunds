// 账户历史页面逻辑
const History = {
    // 当前选中的账户
    currentAccount: null,
    chart: null, // 保存图表实例
    
    // 图表配置
    chartOptions: {
        chart: {
            type: 'area',
            height: '100%',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            background: '#ffffff',
            toolbar: {
                show: true,
                tools: {
                    download: false,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                },
                autoSelected: 'zoom'
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        markers: {
            size: 4,
            strokeWidth: 0,
            hover: {
                size: 6
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        colors: ['#7BB7A5'],
        xaxis: {
            type: 'datetime',
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                formatter: function(value) {
                    return value.toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) + ' 元';
                }
            }
        },
        tooltip: {
            x: {
                format: 'yyyy年MM月'
            },
            y: {
                formatter: function(value) {
                    return value.toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) + ' 元';
                }
            },
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const data = w.config.series[seriesIndex].data[dataPointIndex];
                const note = data.note;
                const date = new Date(data.x);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const amount = data.y.toLocaleString('zh-CN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                return `
                    <div class="custom-tooltip">
                        <div class="tooltip-date">${year}年${month}月</div>
                        <div class="tooltip-amount">${amount} 元</div>
                        ${note ? `<div class="tooltip-note">📝 ${note}</div>` : ''}
                    </div>
                `;
            }
        }
    },
    
    // 初始化
    init() {
        // 渲染账户标签
        this.renderAccountTabs();
        
        // 选择第一个账户
        const accounts = Storage.getAccounts();
        if (accounts.length > 0) {
            this.selectAccount(accounts[0].name);
        }
    },
    
    // 渲染账户标签
    renderAccountTabs() {
        const accounts = Storage.getAccounts();
        const tabsContainer = document.querySelector('.account-tabs');
        tabsContainer.innerHTML = accounts.map(account => `
            <div class="account-tab" data-account="${account.name}">
                ${account.name}
            </div>
        `).join('');
        
        // 添加点击事件
        tabsContainer.querySelectorAll('.account-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const accountName = tab.dataset.account;
                this.selectAccount(accountName);
            });
        });
    },
    
    // 选择账户
    selectAccount(accountName) {
        this.currentAccount = accountName;
        
        // 更新标签状态
        document.querySelectorAll('.account-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.account === accountName);
        });

        // 获取账户数据
        const data = this.getAccountData(accountName);

        // 找出所有有备注的数据点
        const annotations = data
            .filter(point => point.note)
            .map(point => ({
                x: point.x,
                y: point.y,
                marker: {
                    size: 8,
                    fillColor: '#fff',
                    strokeColor: '#7BB7A5',
                    strokeWidth: 2,
                    shape: 'circle',
                    radius: 2
                },
                label: {
                    borderColor: '#7BB7A5',
                    text: '📝',
                    style: {
                        color: '#fff',
                        background: '#7BB7A5'
                    }
                }
            }));

        // 如果已有图表实例，先销毁它
        if (this.chart) {
            this.chart.destroy();
        }

        // 创建新的图表实例
        this.chart = new ApexCharts(
            document.querySelector("#accountChart"),
            {
                ...this.chartOptions,
                series: [{
                    name: accountName,
                    data: data
                }],
                annotations: {
                    points: annotations
                }
            }
        );

        this.chart.render();
    },
    
    // 获取账户数据
    getAccountData(accountName) {
        const data = [];
        const currentDate = new Date();
        const startDate = new Date(2016, 0, 1); // 从2016年1月开始

        for (let date = startDate; date <= currentDate; date.setMonth(date.getMonth() + 1)) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const amount = Storage.getAccountAmount(accountName, monthKey);
            const note = Storage.getMonthNote(monthKey);
            
            data.push({
                x: new Date(date).getTime(),
                y: amount,
                note: note
            });
        }

        return data;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    History.init();
}); 