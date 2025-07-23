"use client";

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export default function RichTextViewer({
  content,
  className = "",
}: RichTextViewerProps) {
  return (
    <div
      className={`prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
