const VIEWPORT_PADDING = 8
const FLOATING_GAP = 8

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))

export function positionFloatingElement(anchor, floating, { preferBelow = false, viewport = window } = {}) {
    const anchorRect = anchor.getBoundingClientRect()
    const floatingRect = floating.getBoundingClientRect()
    const viewportWidth = viewport.innerWidth || viewport.document?.documentElement?.clientWidth || 0
    const viewportHeight = viewport.innerHeight || viewport.document?.documentElement?.clientHeight || 0
    const width = floatingRect.width || floating.offsetWidth || 0
    const height = floatingRect.height || floating.offsetHeight || 0
    const spaceAbove = anchorRect.top - FLOATING_GAP
    const spaceBelow = viewportHeight - anchorRect.bottom - FLOATING_GAP
    const placeBelow = preferBelow || (height > spaceAbove && spaceBelow > spaceAbove)
    const idealLeft = anchorRect.left + (anchorRect.width - width) / 2
    const left = clamp(idealLeft, VIEWPORT_PADDING, viewportWidth - width - VIEWPORT_PADDING)
    const top = placeBelow
        ? clamp(anchorRect.bottom + FLOATING_GAP, VIEWPORT_PADDING, viewportHeight - height - VIEWPORT_PADDING)
        : clamp(anchorRect.top - height - FLOATING_GAP, VIEWPORT_PADDING, viewportHeight - height - VIEWPORT_PADDING)

    floating.style.position = 'fixed'
    floating.style.left = `${Math.round(left)}px`
    floating.style.top = `${Math.round(top)}px`
    floating.style.right = 'auto'
    floating.style.bottom = 'auto'
    floating.classList.toggle('floating-placement-below', placeBelow)
    return { left, top, placeBelow }
}

export function setupFloatingTooltips(documentRef = document, windowRef = window) {
    if (documentRef.documentElement.dataset.floatingTooltipsReady === 'true') return
    documentRef.documentElement.dataset.floatingTooltipsReady = 'true'

    const tooltip = documentRef.createElement('div')
    tooltip.className = 'floating-tooltip'
    tooltip.setAttribute('role', 'tooltip')
    tooltip.hidden = true
    documentRef.body.append(tooltip)

    let activeTarget = null
    let touchTimer = null

    const hide = target => {
        if (target && activeTarget && target !== activeTarget) return
        activeTarget = null
        tooltip.hidden = true
        tooltip.textContent = ''
        windowRef.clearTimeout(touchTimer)
    }

    const show = target => {
        const text = target?.dataset?.tooltip?.trim()
        if (!text) return
        if (target.hasAttribute('title')) target.removeAttribute('title')
        activeTarget = target
        tooltip.textContent = text
        tooltip.hidden = false
        positionFloatingElement(target, tooltip, {
            preferBelow: Boolean(target.closest('.markdown-editor-toolbar')),
            viewport: windowRef,
        })
    }

    const tooltipTarget = event => event.target?.closest?.('[data-tooltip]') || null

    documentRef.addEventListener('pointerover', event => show(tooltipTarget(event)))
    documentRef.addEventListener('pointerout', event => {
        const target = tooltipTarget(event)
        if (target && !target.contains(event.relatedTarget)) hide(target)
    })
    documentRef.addEventListener('focusin', event => show(tooltipTarget(event)))
    documentRef.addEventListener('focusout', event => hide(tooltipTarget(event)))
    documentRef.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'touch') return
        const target = tooltipTarget(event)
        show(target)
        windowRef.clearTimeout(touchTimer)
        touchTimer = windowRef.setTimeout(() => hide(target), 1400)
    }, { passive: true })
    documentRef.addEventListener('scroll', () => {
        if (activeTarget) {
            positionFloatingElement(activeTarget, tooltip, {
                preferBelow: Boolean(activeTarget.closest('.markdown-editor-toolbar')),
                viewport: windowRef,
            })
        }
    }, true)
    windowRef.addEventListener('resize', () => hide())

    return { tooltip, show, hide }
}

export function setupDropdownMenus(documentRef = document, windowRef = window) {
    const controllers = []

    const closeAll = except => {
        controllers.forEach(controller => {
            if (controller !== except) controller.close()
        })
    }

    documentRef.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        if (trigger.dataset.floatingDropdownReady === 'true') return
        const container = trigger.closest('.dropdown-container')
        const menu = container?.querySelector('.dropdown-menu')
        if (!container || !menu) return
        trigger.dataset.floatingDropdownReady = 'true'

        const placeholder = documentRef.createComment('dropdown-menu-home')
        menu.before(placeholder)
        const getItems = () => Array.from(menu.querySelectorAll('.dropdown-item, .dropdown-item-toggle button'))
            .filter(item => !item.closest('[hidden]'))

        const position = () => positionFloatingElement(trigger, menu, { viewport: windowRef })
        const close = ({ restoreFocus = false } = {}) => {
            if (!container.classList.contains('show')) return
            container.classList.remove('show')
            menu.classList.remove('floating-menu-open')
            trigger.setAttribute('aria-expanded', 'false')
            placeholder.parentNode?.insertBefore(menu, placeholder.nextSibling)
            menu.removeAttribute('style')
            if (restoreFocus) trigger.focus()
        }
        const open = ({ focusFirst = false } = {}) => {
            closeAll(controller)
            const tooltip = documentRef.querySelector('.floating-tooltip')
            if (tooltip) tooltip.hidden = true
            container.classList.add('show')
            menu.classList.add('floating-menu-open')
            trigger.setAttribute('aria-expanded', 'true')
            documentRef.body.append(menu)
            position()
            if (focusFirst) getItems()[0]?.focus()
        }
        const controller = { close, open, position, container, menu, trigger }
        controllers.push(controller)

        menu.setAttribute('role', 'menu')
        getItems().forEach(item => item.setAttribute('role', 'menuitem'))

        trigger.addEventListener('click', event => {
            event.stopPropagation()
            if (container.classList.contains('show')) close()
            else open()
        })
        trigger.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                open({ focusFirst: event.key === 'ArrowDown' })
                const items = getItems()
                if (event.key === 'ArrowUp') items.at(-1)?.focus()
            } else if (event.key === 'Escape') {
                event.preventDefault()
                close()
            }
        })
        menu.addEventListener('keydown', event => {
            const items = getItems()
            const currentIndex = items.indexOf(documentRef.activeElement)
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                if (!items.length) return
                const delta = event.key === 'ArrowDown' ? 1 : -1
                items[(currentIndex + delta + items.length) % items.length].focus()
            } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault()
                ;(event.key === 'Home' ? items[0] : items.at(-1))?.focus()
            } else if (event.key === 'Escape') {
                event.preventDefault()
                close({ restoreFocus: true })
            }
        })
    })

    documentRef.addEventListener('click', () => closeAll())
    documentRef.addEventListener('scroll', () => {
        controllers.forEach(controller => {
            if (controller.container.classList.contains('show')) controller.position()
        })
    }, true)
    windowRef.addEventListener('resize', () => closeAll())

    return controllers
}

const initialize = () => {
    setupFloatingTooltips()
    setupDropdownMenus()
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true })
    else initialize()
}
