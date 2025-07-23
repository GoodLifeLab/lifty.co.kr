"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 px-2 py-1 flex flex-wrap gap-1 items-center">
      {/* 텍스트 스타일 */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive("bold") ? "bg-gray-200" : ""
        }`}
        title="굵게"
      >
        <BoldIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive("italic") ? "bg-gray-200" : ""
        }`}
        title="기울임"
      >
        <ItalicIcon className="h-4 w-4" />
      </button>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 목록 */}
      <button
        onClick={() => {
          console.log("Bullet list clicked");
          editor.chain().focus().toggleBulletList().run();
        }}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("bulletList") ? "bg-gray-200" : ""
        }`}
        title="글머리 기호 목록"
      >
        <ListBulletIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          console.log("Ordered list clicked");
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("orderedList") ? "bg-gray-200" : ""
        }`}
        title="번호 매기기 목록"
      >
        <div className="flex items-center justify-center w-4 h-4">
          <span className="text-xs font-bold">1.</span>
        </div>
      </button>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 인용 */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("blockquote") ? "bg-gray-200" : ""
        }`}
        title="인용"
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" />
      </button>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 실행 취소/다시 실행 */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="실행 취소"
      >
        <ArrowUturnLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="다시 실행"
      >
        <ArrowUturnRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  className = "",
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div
      className={`border border-gray-300 rounded-md overflow-hidden ${className}`}
    >
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:border-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}
