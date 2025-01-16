// 全局变量保存图表实例
let chart;

document.addEventListener('DOMContentLoaded', function() {
    // 如果没有资产数据，生成测试数据
    if (!Storage.getAllAssets().length) {
        generateTestData();
    }

    // 初始化图表
    const totalAssetData = Storage.getTotalAssetsByMonth();
    chart = initTotalAssetChart(totalAssetData);

    // 监听备注输入框的变化
    document.addEventListener('blur', function(event) {
        if (event.target.classList.contains('note-input')) {
            // 获取更新后的数据
            const totalAssetData = Storage.getTotalAssetsByMonth();
            
            // 找出所有有备注的数据点
            const annotations = totalAssetData
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

            // 更新图表数据和标记
            chart.updateOptions({
                series: [{
                    name: '总资产',
                    data: totalAssetData
                }],
                annotations: {
                    points: annotations
                }
            });
        }
    }, true);
});

// 生成测试数据（仅用于演示，后续删除）
function generateTestData() {
    const testData = [];
    const startDate = new Date('2016-01');
    const endDate = new Date();
    let currentDate = new Date(startDate);
    let baseAmount = 100000;

    while (currentDate <= endDate) {
        // 随机波动 -5% 到 +5%
        const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
        baseAmount *= fluctuation;

        testData.push({
            date: currentDate.toISOString().substring(0, 7),
            amount: baseAmount
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return testData;
} 