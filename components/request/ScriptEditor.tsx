'use client'
import dynamic from 'next/dynamic'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'
import { indentUnit } from '@codemirror/language'
import { useSettingsStore } from '@/stores/settingsStore'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function ScriptEditor({ value, onChange, placeholder }: Props) {
  const { fontSize, tabSize } = useSettingsStore()
  return (
    <div className="h-full min-h-[160px] p-2">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={oneDark}
        extensions={[javascript(), indentUnit.of(' '.repeat(tabSize))]}
        placeholder={placeholder}
        height="100%"
        basicSetup={{ lineNumbers: true, foldGutter: false }}
        style={{ fontSize: `${fontSize}px` }}
      />
    </div>
  )
}
