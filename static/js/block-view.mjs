const loadScript = src => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = () => reject(new Error(`Could not load ${src}`))
    document.head.append(script)
})

async function renderMermaid() {
    const nodes = document.querySelectorAll('.mermaid-block-container .mermaid')
    if (!nodes.length) return
    try {
        const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')).default
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' })
        await mermaid.run({ nodes: Array.from(nodes) })
    } catch (error) {
        console.error('Mermaid block render failed', error)
    }
}

async function renderEcharts() {
    const nodes = document.querySelectorAll('.echarts-block-container .echarts')
    if (!nodes.length) return
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js')
        const { renderEchartsChart } = await import('/js/echarts-renderer.mjs')
        nodes.forEach(node => {
            try {
                renderEchartsChart(node, node.dataset.echartsOptions || '', window.echarts)
            } catch (error) {
                node.textContent = `ECharts Render Error: ${error.message || error}`
            }
        })
    } catch (error) {
        console.error('ECharts block render failed', error)
    }
}

await Promise.all([renderMermaid(), renderEcharts()])
