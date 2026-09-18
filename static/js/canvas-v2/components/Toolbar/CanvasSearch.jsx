import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { selectNodes } from '../../store/selectors.mjs'

function getSearchText(node) {
    const data = node.data || {}
    return [
        data.text,
        data.label,
        data.file,
        data.url,
        data.david888?.asset?.name,
    ].filter(Boolean).join(' ').toLowerCase()
}

export function CanvasSearch({ store }) {
    const nodes = store(selectNodes)
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const inputRef = useRef(null)
    const reactFlow = useReactFlow()
    const isZh = document.documentElement.getAttribute('lang')?.startsWith('zh')

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'f') return
            event.preventDefault()
            setIsOpen(true)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (isOpen) requestAnimationFrame(() => inputRef.current?.focus())
    }, [isOpen])

    const results = useMemo(() => {
        const normalized = query.trim().toLowerCase()
        if (!normalized) return nodes.slice(0, 12)
        return nodes.filter(node => getSearchText(node).includes(normalized)).slice(0, 20)
    }, [nodes, query])

    const close = () => {
        setIsOpen(false)
        setQuery('')
    }

    const focusNode = (node) => {
        store.getState().setSelectedNode(node.id)
        const target = reactFlow.getNode(node.id) || node
        reactFlow.fitView({ nodes: [target], padding: 0.45, duration: 450 })
        close()
    }

    return (
        <div className="canvas-search-shell">
            <button
                type="button"
                className="canvas-tb-btn"
                title={isZh ? '搜尋卡片 (Cmd/Ctrl+F)' : 'Search cards (Cmd/Ctrl+F)'}
                aria-label={isZh ? '搜尋卡片' : 'Search cards'}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(value => !value)}
            >
                <Search size={14} />
                <span>{isZh ? '搜尋' : 'Search'}</span>
            </button>

            {isOpen && (
                <div className="canvas-search-panel nodrag nopan" role="search">
                    <div className="canvas-search-input-row">
                        <Search size={14} aria-hidden="true" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            onKeyDown={event => {
                                if (event.key === 'Escape') close()
                                if (event.key === 'Enter' && results[0]) focusNode(results[0])
                            }}
                            placeholder={isZh ? '搜尋卡片文字、Wiki 路徑…' : 'Search card text or Wiki paths…'}
                            aria-label={isZh ? '搜尋畫布卡片' : 'Search canvas cards'}
                        />
                        <button type="button" className="canvas-search-close" onClick={close} aria-label={isZh ? '關閉搜尋' : 'Close search'}>
                            <X size={14} />
                        </button>
                    </div>
                    <div className="canvas-search-results">
                        {results.length === 0 && (
                            <div className="canvas-search-empty">{isZh ? '找不到相符卡片' : 'No matching cards'}</div>
                        )}
                        {results.map(node => (
                            <button key={node.id} type="button" className="canvas-search-result" onClick={() => focusNode(node)}>
                                <span className="canvas-search-result-title">
                                    {node.data?.label || node.data?.david888?.asset?.name || node.data?.file || node.data?.url || node.id}
                                </span>
                                <span className="canvas-search-result-preview">
                                    {(node.data?.text || node.data?.file || node.data?.url || '').slice(0, 72)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
