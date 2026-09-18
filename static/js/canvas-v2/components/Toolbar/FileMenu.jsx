import React, { useRef, useEffect } from 'react'
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react'
import { toPng, toSvg } from 'html-to-image'
import { FileDown, ImageDown, Network, Trash2, Upload } from 'lucide-react'
import { parseCanvasDocument, validateCanvasDocument } from '../../../../../src/canvas_document.mjs'
import { buildWikiLinkCanvas, fetchMarkdownForWikiGraph } from '../../model/wikiGraphGenerator.mjs'

export function FileMenu({ isOpen = false, onClose, store }) {
    const fileInputRef = useRef(null)
    const menuRef = useRef(null)
    const reactFlow = useReactFlow()

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose?.()
            }
        }

        const handlePointerDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose?.()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('pointerdown', handlePointerDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result
                const parsed = parseCanvasDocument(text, { allowFallback: false })
                const validated = validateCanvasDocument(parsed)
                store.getState().loadDocument(validated)
                store.getState().setDirty(true)
                window.showToast?.(zh ? '已成功匯入 Canvas 檔案' : 'Canvas imported successfully')
            } catch (err) {
                console.error('[canvas-v2] import failed:', err)
                window.showToast?.(zh ? '匯入失敗：格式不正確' : 'Import failed: Invalid format')
            }
        }
        reader.readAsText(file)
        e.target.value = ''
        onClose?.()
    }

    const handleExport = () => {
        try {
            const jsonCanvas = store.getState().toJsonCanvas()
            const blob = new Blob([JSON.stringify(jsonCanvas, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            const title = window.APP_STATE?.title || 'canvas'
            a.href = url
            a.download = `${title}.canvas`
            a.click()
            URL.revokeObjectURL(url)
            onClose?.()
        } catch (err) {
            console.error('[canvas-v2] export failed:', err)
        }
    }

    const downloadDataUrl = (dataUrl, extension) => {
        const title = String(window.APP_STATE?.title || 'canvas').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '_')
        const anchor = document.createElement('a')
        anchor.href = dataUrl
        anchor.download = `${title}.${extension}`
        anchor.click()
    }

    const getExportTarget = () => {
        const target = document.querySelector('.canvas-v2-root .react-flow__viewport')
        if (!target) throw new Error('Canvas viewport is not ready')
        const nodes = reactFlow.getNodes()
        if (nodes.length === 0) throw new Error(zh ? '畫布目前沒有可匯出的卡片' : 'There are no cards to export')
        const bounds = getNodesBounds(nodes)
        const width = Math.max(640, Math.ceil(bounds.width + 160))
        const height = Math.max(420, Math.ceil(bounds.height + 160))
        const viewport = getViewportForBounds(bounds, width, height, 0.1, 2, 0.15)
        return {
            target,
            options: {
                backgroundColor: '#ffffff',
                cacheBust: true,
                pixelRatio: 2,
                width,
                height,
                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                    transformOrigin: '0 0',
                },
            },
        }
    }

    const handleExportImage = async (format) => {
        try {
            const { target, options } = getExportTarget()
            const dataUrl = format === 'svg'
                ? await toSvg(target, options)
                : await toPng(target, options)
            downloadDataUrl(dataUrl, format)
            onClose?.()
        } catch (err) {
            console.error(`[canvas-v2] ${format} export failed:`, err)
            window.showToast?.(zh ? `匯出 ${format.toUpperCase()} 失敗：${err.message}` : `${format.toUpperCase()} export failed: ${err.message}`)
        }
    }

    const handleGraphFromWiki = async () => {
        const path = window.prompt(zh ? '輸入要解析的 Markdown 筆記路徑' : 'Enter the Markdown note path to parse')
        if (!path) return
        try {
            const source = await fetchMarkdownForWikiGraph(path)
            const graph = buildWikiLinkCanvas(source)
            store.getState().loadDocument(graph)
            store.getState().setDirty(true)
            requestAnimationFrame(() => reactFlow.fitView({ padding: 0.2, duration: 450 }))
            window.showToast?.(zh ? `已產生 ${graph.nodes.length} 張卡片與 ${graph.edges.length} 條關係線` : `Generated ${graph.nodes.length} cards and ${graph.edges.length} edges`)
            onClose?.()
        } catch (err) {
            console.error('[canvas-v2] WikiLink graph failed:', err)
            window.showToast?.(zh ? `關聯圖產生失敗：${err.message}` : `WikiLink graph failed: ${err.message}`)
        }
    }

    const handleClear = () => {
        if (confirm(zh ? '確定要清空畫布上的所有卡片與連線嗎？（可透過 Undo 復原）' : 'Are you sure you want to clear the canvas? (Undoable)')) {
            store.getState().clearDocument()
        }
        onClose?.()
    }

    return (
        <div
            ref={menuRef}
            className="canvas-menu-dropdown nodrag nopan"
            role="menu"
            aria-label={zh ? '檔案選單' : 'File Menu'}
            onClick={(e) => e.stopPropagation()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".canvas,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <button type="button" role="menuitem" className="canvas-menu-item" onClick={handleImportClick}>
                <span className="canvas-menu-icon"><Upload size={14} /></span>
                <span>{zh ? '匯入 .canvas 檔案' : 'Import .canvas'}</span>
            </button>

            <button type="button" role="menuitem" className="canvas-menu-item" onClick={handleExport}>
                <span className="canvas-menu-icon"><FileDown size={14} /></span>
                <span>{zh ? '匯出 .canvas 檔案' : 'Export .canvas'}</span>
            </button>

            <button type="button" role="menuitem" className="canvas-menu-item" onClick={() => handleExportImage('svg')}>
                <span className="canvas-menu-icon"><ImageDown size={14} /></span>
                <span>{zh ? '匯出 SVG 圖片' : 'Export SVG'}</span>
            </button>

            <button type="button" role="menuitem" className="canvas-menu-item" onClick={() => handleExportImage('png')}>
                <span className="canvas-menu-icon"><ImageDown size={14} /></span>
                <span>{zh ? '匯出 PNG 圖片' : 'Export PNG'}</span>
            </button>

            <div className="canvas-toolbar-divider" style={{ width: '100%', height: '1px' }} />

            <button type="button" role="menuitem" className="canvas-menu-item" onClick={handleGraphFromWiki}>
                <span className="canvas-menu-icon"><Network size={14} /></span>
                <span>{zh ? '從 WikiLink 產生關聯圖' : 'Generate WikiLink Graph'}</span>
            </button>

            <div className="canvas-toolbar-divider" style={{ width: '100%', height: '1px' }} />

            <button type="button" role="menuitem" className="canvas-menu-item" style={{ color: 'var(--canvas-danger)' }} onClick={handleClear}>
                <span className="canvas-menu-icon"><Trash2 size={14} /></span>
                <span>{zh ? '清空畫布' : 'Clear Canvas'}</span>
            </button>
        </div>
    )
}
