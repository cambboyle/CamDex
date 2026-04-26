import { useState } from 'react'
import type { Box } from '@/types/collection'
import styles from './BoxHeader.module.css'

interface BoxHeaderProps {
  boxes: Box[]
  activeBoxId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function BoxHeader({ boxes, activeBoxId, onSelect, onRename, onDelete, onNew }: BoxHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')

  const activeBox = boxes.find((b) => b.id === activeBoxId)

  const startEdit = () => {
    if (!activeBox) return
    setEditName(activeBox.name)
    setEditing(true)
  }

  const commitEdit = () => {
    if (!activeBox || !editName.trim()) return
    onRename(activeBox.id, editName.trim())
    setEditing(false)
  }

  const activeIndex = boxes.findIndex((b) => b.id === activeBoxId)

  const prev = () => {
    if (activeIndex > 0) onSelect(boxes[activeIndex - 1].id)
  }
  const next = () => {
    if (activeIndex < boxes.length - 1) onSelect(boxes[activeIndex + 1].id)
  }

  return (
    <div className={styles.header}>
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={prev} disabled={activeIndex <= 0} aria-label="Previous box">
          ‹
        </button>

        {editing ? (
          <input
            className={styles.nameInput}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            maxLength={20}
            autoFocus
          />
        ) : (
          <button className={styles.name} onClick={startEdit} title="Click to rename">
            {activeBox?.name ?? 'Select a box'}
          </button>
        )}

        <button
          className={styles.navBtn}
          onClick={next}
          disabled={activeIndex >= boxes.length - 1}
          aria-label="Next box"
        >
          ›
        </button>
      </div>

      <div className={styles.actions}>
        <span className={styles.boxCount}>
          Box {activeIndex + 1} / {boxes.length}
        </span>
        <button className={styles.btn} onClick={onNew}>+ New Box</button>
        {activeBox && (
          <button
            className={`${styles.btn} ${styles.danger}`}
            onClick={() => onDelete(activeBox.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
