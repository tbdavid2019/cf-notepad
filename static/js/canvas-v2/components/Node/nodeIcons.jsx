import React from 'react'
import {
    Puzzle,
    TrendingUp,
    Lightbulb,
    GitFork,
    CheckSquare,
    AlertTriangle,
    HelpCircle,
    FileText,
    StickyNote,
    BookOpen,
    ExternalLink,
    Boxes,
} from 'lucide-react'

export const NODE_LUCIDE_ICONS = {
    problem: Puzzle,
    benefit: TrendingUp,
    solution: Lightbulb,
    cause: GitFork,
    criterion: CheckSquare,
    detriment: AlertTriangle,
    question: HelpCircle,
    note: FileText,
    sticky: StickyNote,
    file: BookOpen,
    wiki: BookOpen,
    link: ExternalLink,
    group: Boxes,
}

export function NodeLucideIcon({ type = 'note', size = 12, className = '' }) {
    const IconComponent = NODE_LUCIDE_ICONS[type] || FileText
    return <IconComponent size={size} className={className} />
}
