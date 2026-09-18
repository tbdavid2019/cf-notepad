import React, { useState, useRef, useCallback } from 'react'
import { FlowNode } from './FlowNode.jsx'
import { NODE_DIMENSIONS } from '../../model/canvasTypes.mjs'
import {
    uploadCanvasAsset,
    formatFileSize,
    detectMimeType,
    isImageFile,
    isAudioFile,
    isVideoFile,
} from '../../model/assetUpload.mjs'
import {
    Upload,
    RefreshCw,
    ExternalLink,
    FileText,
    Music,
    Film,
    Image as ImageIcon,
    Download,
    AlertCircle,
} from 'lucide-react'

export function AssetNode(props) {
    const { id, data = {}, selected = false } = props
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef(null)

    const isZh = () => {
        const lang = document.documentElement.getAttribute('lang')
        return lang && lang.startsWith('zh')
    }
    const zh = isZh()

    const assetMeta = data.david888?.asset || {}
    const fileUrl = data.file || ''
    const fileName = assetMeta.name || (fileUrl ? fileUrl.split('/').pop().split('?')[0] : '')
    const mimeType = assetMeta.mime || detectMimeType(null, fileUrl)
    const fileSizeStr = formatFileSize(assetMeta.size)
    const provider = assetMeta.provider || (fileUrl.includes('s3.wiki') ? 'r2' : '888box')

    const isImg = isImageFile({ type: mimeType, name: fileName }) || mimeType.startsWith('image/')
    const isAud = isAudioFile({ type: mimeType, name: fileName }) || mimeType.startsWith('audio/')
    const isVid = isVideoFile({ type: mimeType, name: fileName }) || mimeType.startsWith('video/')

    const nodeIcon = isImg ? '🖼️' : isAud ? '🎵' : isVid ? '🎬' : '📎'
    const nodeTitle = fileName || (zh ? '圖片／檔案資源' : 'Asset Resource')

    const handleUploadFile = useCallback(async (file) => {
        if (!file) return
        setIsUploading(true)
        setUploadError(null)
        try {
            const result = await uploadCanvasAsset(file)
            data.onUpdateContent?.(id, {
                file: result.url,
                david888: {
                    ...(data.david888 || {}),
                    subType: 'asset',
                    asset: {
                        name: result.name,
                        mime: result.mime,
                        size: result.size,
                        provider: result.provider,
                    },
                },
            })
        } catch (err) {
            console.error('[AssetNode] Upload error:', err)
            setUploadError(err?.message || (zh ? '上傳失敗，請重試' : 'Upload failed'))
        } finally {
            setIsUploading(false)
        }
    }, [id, data, zh])

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUploadFile(file)
        }
        e.target.value = ''
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
        if (data.isEdit === false) return
        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleUploadFile(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (data.isEdit !== false && !isDragOver) {
            setIsDragOver(true)
        }
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }

    const headerRight = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {data.isEdit !== false && (
                <button
                    type="button"
                    className="canvas-btn-icon nodrag"
                    title={zh ? '替換檔案' : 'Replace file'}
                    onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                    }}
                >
                    <RefreshCw size={12} />
                </button>
            )}
            {fileUrl && (
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canvas-btn-icon nodrag"
                    title={zh ? '開新視窗檢視' : 'Open in new tab'}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink size={12} />
                </a>
            )}
        </div>
    )

    return (
        <FlowNode
            id={id}
            type="asset"
            data={data}
            selected={selected}
            minWidth={NODE_DIMENSIONS.asset?.minWidth || 220}
            minHeight={NODE_DIMENSIONS.asset?.minHeight || 140}
            icon={nodeIcon}
            title={nodeTitle}
            isEdit={data.isEdit !== false}
            onDuplicate={data.onDuplicate}
            onDelete={data.onDelete}
            onChangeColor={data.onChangeColor}
            headerRight={headerRight}
        >
            <div
                className={`canvas-asset-card ${isDragOver ? 'is-dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                />

                {isUploading ? (
                    <div className="canvas-asset-uploading">
                        <div className="canvas-asset-spinner" />
                        <span className="canvas-asset-uploading-text">
                            {zh ? '正在上傳至雲端...' : 'Uploading file...'}
                        </span>
                    </div>
                ) : uploadError ? (
                    <div className="canvas-asset-error nodrag">
                        <AlertCircle size={20} className="canvas-asset-error-icon" />
                        <div className="canvas-asset-error-msg">{uploadError}</div>
                        <button
                            type="button"
                            className="canvas-wiki-link-btn"
                            style={{ marginTop: 8 }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={12} />
                            <span>{zh ? '重新選擇檔案' : 'Try Again'}</span>
                        </button>
                    </div>
                ) : !fileUrl ? (
                    <div
                        className="canvas-asset-dropzone nodrag"
                        onClick={() => data.isEdit !== false && fileInputRef.current?.click()}
                    >
                        <Upload size={24} className="canvas-asset-dropzone-icon" />
                        <div className="canvas-asset-dropzone-title">
                            {zh ? '點擊或拖曳檔案至此' : 'Click or drop file here'}
                        </div>
                        <div className="canvas-asset-dropzone-hint">
                            {zh ? '圖片走 R2 上傳，文件/影音走 888box' : 'Images to R2, docs/media to 888box'}
                        </div>
                    </div>
                ) : isImg ? (
                    <div className="canvas-asset-image-container">
                        <img
                            src={fileUrl}
                            alt={fileName || 'Image'}
                            className="canvas-asset-image"
                            loading="lazy"
                        />
                        <div className="canvas-asset-footer-overlay">
                            <span className="canvas-asset-name-truncate" title={fileName}>{fileName}</span>
                            <div className="canvas-asset-badge-group">
                                {fileSizeStr && <span className="canvas-asset-pill">{fileSizeStr}</span>}
                                <span className="canvas-asset-pill is-provider">{provider.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                ) : isAud ? (
                    <div className="canvas-asset-audio-container">
                        <div className="canvas-asset-audio-header">
                            <div className="canvas-asset-audio-icon-wrap">
                                <Music size={18} />
                            </div>
                            <div className="canvas-asset-info-col">
                                <div className="canvas-asset-filename" title={fileName}>{fileName}</div>
                                <div className="canvas-asset-badge-group">
                                    {fileSizeStr && <span className="canvas-asset-pill">{fileSizeStr}</span>}
                                    <span className="canvas-asset-pill is-provider">{provider.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                        <audio
                            src={fileUrl}
                            controls
                            className="canvas-asset-audio-player nodrag"
                            preload="metadata"
                        />
                    </div>
                ) : isVid ? (
                    <div className="canvas-asset-video-container">
                        <video
                            src={fileUrl}
                            controls
                            className="canvas-asset-video-player nodrag"
                            preload="metadata"
                        />
                        <div className="canvas-asset-footer-overlay">
                            <span className="canvas-asset-name-truncate" title={fileName}>{fileName}</span>
                            <div className="canvas-asset-badge-group">
                                {fileSizeStr && <span className="canvas-asset-pill">{fileSizeStr}</span>}
                                <span className="canvas-asset-pill is-provider">{provider.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="canvas-asset-file-container">
                        <div className="canvas-asset-file-icon-wrap">
                            <FileText size={28} />
                        </div>
                        <div className="canvas-asset-file-details">
                            <div className="canvas-asset-filename" title={fileName}>{fileName}</div>
                            <div className="canvas-asset-badge-group">
                                {fileSizeStr && <span className="canvas-asset-pill">{fileSizeStr}</span>}
                                <span className="canvas-asset-pill is-provider">{provider.toUpperCase()}</span>
                            </div>
                        </div>
                        <a
                            href={fileUrl}
                            download={fileName || true}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="canvas-wiki-link-btn nodrag canvas-asset-download-btn"
                        >
                            <Download size={13} />
                            <span>{zh ? '下載檔案' : 'Download'}</span>
                        </a>
                    </div>
                )}
            </div>
        </FlowNode>
    )
}
