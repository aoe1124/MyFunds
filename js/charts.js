// 图表配置
const chartOptions = {
    chart: {
        type: 'area',
        height: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
    annotations: {
        points: []  // 将在数据中动态设置
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
};

// 初始化图表
function initTotalAssetChart(data) {
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

    const series = [{
        name: '总资产',
        data: data
    }];

    const chart = new ApexCharts(
        document.querySelector("#totalAssetChart"),
        { 
            ...chartOptions, 
            series,
            annotations: {
                points: annotations
            }
        }
    );

    chart.render();
    return chart;
} 