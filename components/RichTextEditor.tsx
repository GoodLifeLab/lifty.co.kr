"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Blockquote from "@tiptap/extension-blockquote";
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // 팔레트 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".color-palette-container")) {
        setIsPaletteOpen(false);
      }
    };

    if (isPaletteOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPaletteOpen]);

  const setLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setIsLinkModalOpen(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 px-2 py-1 flex flex-wrap gap-1 items-center">
      {/* 텍스트 스타일 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive("bold") ? "bg-gray-200" : ""
        }`}
        title="굵게"
      >
        <BoldIcon className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive("italic") ? "bg-gray-200" : ""
        }`}
        title="기울임"
      >
        <ItalicIcon className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive("underline") ? "bg-gray-200" : ""
        }`}
        title="밑줄"
      >
        <span className="text-sm font-bold underline">U</span>
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          if (editor.isActive("link")) {
            removeLink();
          } else {
            setIsLinkModalOpen(true);
          }
        }}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
        title="링크"
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 글씨 색상 */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            const colorPicker = e.currentTarget
              .nextElementSibling as HTMLInputElement;
            colorPicker.click();
          }}
          className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
          title="글씨 색상"
        >
          <div className="w-4 h-4 bg-black rounded border border-gray-300"></div>
        </button>
        <input
          type="color"
          onChange={(e) => {
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="absolute opacity-0 pointer-events-none"
        />
      </div>

      {/* 색상 팔레트 */}
      <div className="relative color-palette-container">
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsPaletteOpen(!isPaletteOpen);
          }}
          className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
          title="색상 팔레트"
        >
          <div className="w-4 h-4 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 rounded border border-gray-300"></div>
        </button>

        <div
          className={`absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50 transition-all duration-200 min-w-[200px] ${isPaletteOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          <div className="grid grid-cols-6 gap-1">
            {[
              "#000000",
              "#FFFFFF",
              "#FF0000",
              "#00FF00",
              "#0000FF",
              "#FFFF00",
              "#FF00FF",
              "#00FFFF",
              "#FFA500",
              "#800080",
              "#008000",
              "#FFC0CB",
              "#A52A2A",
              "#808080",
              "#C0C0C0",
              "#FFD700",
              "#FF6347",
              "#32CD32",
              "#4169E1",
              "#FF1493",
              "#00CED1",
              "#FF4500",
              "#9370DB",
              "#20B2AA",
            ].map((color) => (
              <button
                key={color}
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setColor(color).run();
                  setIsPaletteOpen(false);
                }}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={`색상: ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 목록 */}
      <button
        onClick={(e) => {
          e.preventDefault();
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
        onClick={(e) => {
          e.preventDefault();
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
        onClick={(e) => {
          e.preventDefault();
          console.log("Blockquote clicked");
          console.log("Editor state:", editor.state);
          console.log(
            "Can toggle blockquote:",
            editor.can().chain().focus().toggleBlockquote().run(),
          );
          console.log("Is blockquote active:", editor.isActive("blockquote"));

          if (editor.isActive("blockquote")) {
            editor.chain().focus().liftBlockquote().run();
          } else {
            editor.chain().focus().setBlockquote().run();
          }
        }}
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
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().undo().run();
        }}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="실행 취소"
      >
        <ArrowUturnLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().redo().run();
        }}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="다시 실행"
      >
        <ArrowUturnRightIcon className="h-4 w-4" />
      </button>

      {/* 링크 모달 */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              링크 추가
            </h3>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setLink();
                }
              }}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={setLink}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
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
      StarterKit.configure({
        blockquote: false, // StarterKit의 blockquote 비활성화
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color,
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-gray-800 pl-4 my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-gray-700 hover:text-gray-900",
        },
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // value prop이 변경될 때 에디터 내용 업데이트
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

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
