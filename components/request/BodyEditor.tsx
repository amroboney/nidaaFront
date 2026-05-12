'use client'
import dynamic from 'next/dynamic'
import { oneDark } from '@codemirror/theme-one-dark'
import { json } from '@codemirror/lang-json'
import { javascript } from '@codemirror/lang-javascript'
import { indentUnit } from '@codemirror/language'
import { KVEditor } from './KVEditor'
import { useSettingsStore } from '@/stores/settingsStore'
import type { KVPair } from '@/lib/types'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

interface Props {
  bodyType: 'json' | 'form' | 'raw' | 'none'
  body: string
  formData: KVPair[]
  onBodyChange: (v: string) => void
  onFormDataChange: (pairs: KVPair[]) => void
}

export function BodyEditor({ bodyType, body, formData, onBodyChange, onFormDataChange }: Props) {
  const { fontSize, tabSize } = useSettingsStore()
  if (bodyType === 'none') {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No body for this request
      </div>
    )
  }

  if (bodyType === 'form') {
    return (
      <div className="p-2">
        <KVEditor pairs={formData} onChange={onFormDataChange} keyPlaceholder="Field name" valuePlaceholder="Value" />
      </div>
    )
  }

  const extensions = [
    indentUnit.of(' '.repeat(tabSize)),
    ...(bodyType === 'json' ? [json()] : bodyType === 'raw' ? [javascript()] : []),
  ]

  return (
    <div className="h-full min-h-[200px]">
      <CodeMirror
        value={body}
        onChange={onBodyChange}
        theme={oneDark}
        extensions={extensions}
        height="100%"
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          autocompletion: bodyType === 'json',
          highlightActiveLine: false,
        }}
        style={{ fontSize: `${fontSize}px` }}
      />
    </div>
  )
}
