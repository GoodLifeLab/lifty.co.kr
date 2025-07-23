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
      className={`prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-800 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_a]:text-gray-700 [&_a]:hover:text-gray-900 ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
