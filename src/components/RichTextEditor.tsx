"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useCallback, useEffect, useState } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type EditorMode = "visual" | "html";

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors disabled:opacity-40 ${
        active
          ? "bg-[var(--toolbar-active-bg)] text-[var(--accent)] shadow-sm"
          : "text-[var(--text-muted)] hover:bg-[var(--toolbar-hover-bg)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your message here…",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [htmlSource, setHtmlSource] = useState(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[var(--accent)] underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      setHtmlSource(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] px-4 py-4 focus:outline-none text-[var(--text-primary)]",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (mode === "visual" && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      setHtmlSource(value);
    }
  }, [editor, mode, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const switchToHtml = () => {
    if (editor) setHtmlSource(editor.getHTML());
    setMode("html");
  };

  const switchToVisual = () => {
    if (editor) {
      editor.commands.setContent(htmlSource, { emitUpdate: false });
      onChange(htmlSource);
    }
    setMode("visual");
  };

  const handleHtmlChange = (nextHtml: string) => {
    setHtmlSource(nextHtml);
    onChange(nextHtml);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--input-bg)] px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {mode === "visual" && editor && (
            <>
              <ToolbarButton
                title="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <strong className="text-xs">B</strong>
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <em className="text-xs">I</em>
              </ToolbarButton>
              <ToolbarButton
                title="Underline"
                active={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <span className="text-xs underline">U</span>
              </ToolbarButton>
              <span className="mx-1 h-5 w-px bg-[var(--toolbar-divider)]" />
              <ToolbarButton
                title="Bullet list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </ToolbarButton>
              <ToolbarButton
                title="Numbered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <span className="text-xs font-medium">1.</span>
              </ToolbarButton>
              <span className="mx-1 h-5 w-px bg-[var(--toolbar-divider)]" />
              <ToolbarButton title="Insert link" onClick={setLink}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </ToolbarButton>
            </>
          )}
        </div>

        <div className="flex rounded-lg bg-[var(--surface-elevated)] p-0.5 text-xs shadow-sm ring-1 ring-[var(--border)]">
          <button
            type="button"
            onClick={switchToVisual}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              mode === "visual"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={switchToHtml}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              mode === "html"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            HTML
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={htmlSource}
          onChange={(e) => handleHtmlChange(e.target.value)}
          spellCheck={false}
          className="min-h-[260px] w-full resize-y bg-[var(--html-bg)] px-4 py-4 font-mono text-sm leading-relaxed text-[var(--html-text)] focus:outline-none"
          placeholder="<p>Your HTML email content…</p>"
        />
      )}
    </div>
  );
}
