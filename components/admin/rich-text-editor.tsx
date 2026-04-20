"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link, 
  Code,
  ChevronDown
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

const FONT_SIZES = [
  { label: "Small", value: "1" },
  { label: "Normal", value: "3" },
  { label: "Medium", value: "4" },
  { label: "Large", value: "5" },
  { label: "X-Large", value: "6" },
  { label: "XX-Large", value: "7" },
]

export default function RichTextEditor({ value, onChange, placeholder, rows = 4 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false)
  const [currentFontSize, setCurrentFontSize] = useState("Normal")
  const isInternalChange = useRef(false)

  // Initialize editor content only once when value changes externally
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ""
      }
    }
    isInternalChange.current = false
  }, [value])

  const execCommand = useCallback((command: string, cmdValue: string | undefined = undefined) => {
    document.execCommand(command, false, cmdValue)
    editorRef.current?.focus()
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleFormat = (command: string, cmdValue?: string) => {
    execCommand(command, cmdValue)
  }

  const handleHeading = (level: string) => {
    execCommand("formatBlock", level)
  }

  const handleFontSize = (size: { label: string, value: string }) => {
    execCommand("fontSize", size.value)
    setCurrentFontSize(size.label)
    setShowFontSizeDropdown(false)
  }

  const handleLink = () => {
    if (showLinkInput && linkUrl) {
      execCommand("createLink", linkUrl)
      setLinkUrl("")
      setShowLinkInput(false)
    } else {
      setShowLinkInput(!showLinkInput)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }

  const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void, active?: boolean, children: React.ReactNode, title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-slate-600 transition ${active ? 'bg-slate-600 text-purple-400' : 'text-gray-300'}`}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-slate-600 mx-1" />

  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-700">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-600 bg-slate-800">
        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
            className="flex items-center gap-1 px-3 py-1.5 rounded hover:bg-slate-600 transition text-gray-300 text-sm min-w-[100px] justify-between"
            title="Font Size"
          >
            <span>{currentFontSize}</span>
            <ChevronDown size={14} />
          </button>
          
          {showFontSizeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 min-w-[120px] py-1">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => handleFontSize(size)}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-600 transition ${
                    currentFontSize === size.label ? 'text-purple-400 bg-slate-600' : 'text-gray-300'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton onClick={() => handleFormat("bold")} title="Bold">
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat("italic")} title="Italic">
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat("underline")} title="Underline">
          <Underline size={16} />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton onClick={() => handleHeading("h1")} title="Heading 1">
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => handleHeading("h2")} title="Heading 2">
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => handleHeading("h3")} title="Heading 3">
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => handleFormat("insertUnorderedList")} title="Bullet List">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat("insertOrderedList")} title="Numbered List">
          <ListOrdered size={16} />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => handleFormat("justifyLeft")} title="Align Left">
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat("justifyCenter")} title="Align Center">
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat("justifyRight")} title="Align Right">
          <AlignRight size={16} />
        </ToolbarButton>

        <Divider />

        {/* Link & Code */}
        <ToolbarButton onClick={handleLink} title="Insert Link">
          <Link size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat("formatBlock", "pre")} title="Code Block">
          <Code size={16} />
        </ToolbarButton>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 border-b border-slate-600 bg-slate-750">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL..."
            className="flex-1 px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={handleLink}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-500 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        dir="ltr"
        className="w-full px-4 py-3 text-white focus:outline-none overflow-y-auto prose prose-invert prose-sm max-w-none text-left"
        style={{ minHeight: `${rows * 1.5}rem`, direction: "ltr", unicodeBidi: "plaintext" }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Formatting Help */}
      <div className="px-3 py-2 border-t border-slate-600 bg-slate-800">
        <p className="text-xs text-gray-400">
          <span className="font-medium">Formatting:</span> **bold**, *italic*, __underline__, `code`, # Heading, • List, [link](url)
        </p>
      </div>
    </div>
  )
}