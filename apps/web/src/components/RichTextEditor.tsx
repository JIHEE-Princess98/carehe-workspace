"use client";

import { Bold, Eye, ImagePlus, Italic, Link2, List, ListOrdered } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type RichTextEditorProps = { value: string; onChange: (value: string) => void; label: string };

export function sanitizeRichTextHtml(value: string) {
  if (typeof window === "undefined") return value;
  const documentNode = new DOMParser().parseFromString(value, "text/html");
  documentNode.querySelectorAll("script,style,iframe,object,embed").forEach((node) => node.remove());
  documentNode.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const safeUrl = name === "href" || name === "src";
      if (name.startsWith("on") || (!safeUrl && name !== "alt" && name !== "title")) node.removeAttribute(attribute.name);
      if (safeUrl && /^(javascript|data:text\/html):/i.test(attribute.value)) node.removeAttribute(attribute.name);
    });
  });
  return documentNode.body.innerHTML;
}

export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor || editor.innerHTML === value) return;
    editor.innerHTML = value;
  }, [value]);

  function emitChange() { onChange(sanitizeRichTextHtml(editorRef.current?.innerHTML ?? "")); }
  function format(command: string, commandValue?: string) { editorRef.current?.focus(); document.execCommand(command, false, commandValue); emitChange(); }
  function insertImage(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => { format("insertImage", String(reader.result)); };
    reader.readAsDataURL(file);
  }
  function insertLink() {
    const href = window.prompt("URL");
    if (href) format("createLink", href);
  }

  return <section aria-label={label}>
    <div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-sm font-medium text-[#4D405F]">{label}</span><span className="text-xs text-[#978BAA]">{"\uC774\uBBF8\uC9C0\uC640 \uD30C\uC77C\uC740 API \uC5F0\uB3D9 \uC804 \uB370\uBAA8\uC785\uB2C8\uB2E4."}</span></div>
    <div className="overflow-hidden rounded-xl border border-[#DAD3E9] bg-white focus-within:border-violet focus-within:ring-2 focus-within:ring-lavender">
      <div className="flex flex-wrap gap-1 border-b border-[#F0ECF6] bg-[#FAF8FF] p-2">
        <button type="button" onClick={() => format("bold")} className="rounded p-2 text-[#625775] hover:bg-lavender" aria-label={"\uAD75\uAC8C"}><Bold size={16} /></button>
        <button type="button" onClick={() => format("italic")} className="rounded p-2 text-[#625775] hover:bg-lavender" aria-label={"\uAE30\uC6B8\uC784"}><Italic size={16} /></button>
        <button type="button" onClick={() => format("insertUnorderedList")} className="rounded p-2 text-[#625775] hover:bg-lavender" aria-label={"\uAE00\uBA38\uB9AC\uD45C"}><List size={16} /></button>
        <button type="button" onClick={() => format("insertOrderedList")} className="rounded p-2 text-[#625775] hover:bg-lavender" aria-label={"\uBC88\uD638 \uBAA9\uB85D"}><ListOrdered size={16} /></button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertLink} className="rounded p-2 text-[#625775] hover:bg-lavender" aria-label={"\uB9C1\uD06C \uC0BD\uC785"}><Link2 size={16} /></button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => imageInputRef.current?.click()} className="rounded p-2 text-[#625775] hover:bg-lavender" aria-label={"\uC774\uBBF8\uC9C0 \uC0BD\uC785"}><ImagePlus size={16} /></button>
        <button type="button" onClick={() => setPreview((current) => !current)} className={`ml-auto rounded px-2 py-1 text-xs font-semibold ${preview ? "bg-lavender text-violet" : "text-[#625775] hover:bg-lavender"}`}><Eye size={14} className="mr-1 inline" />{"\uBBF8\uB9AC\uBCF4\uAE30"}</button>
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => { insertImage(event.target.files?.[0]); event.currentTarget.value = ""; }} />
      {preview ? <div className="min-h-36 px-3 py-3 text-sm leading-6 text-[#4D405F] [&_img]:my-3 [&_img]:max-h-64 [&_img]:max-w-full [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(value) }} /> : <div ref={editorRef} contentEditable suppressContentEditableWarning onCompositionStart={() => { isComposingRef.current = true; }} onCompositionEnd={(event) => { isComposingRef.current = false; onChange(sanitizeRichTextHtml(event.currentTarget.innerHTML)); }} onInput={(event) => { if (!isComposingRef.current) onChange(sanitizeRichTextHtml(event.currentTarget.innerHTML)); }} onPaste={(event) => { const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/")); if (image) { event.preventDefault(); insertImage(image); } }} onDrop={(event) => { const image = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/")); if (image) { event.preventDefault(); insertImage(image); } }} onDragOver={(event) => event.preventDefault()} className="min-h-36 px-3 py-3 text-sm leading-6 text-[#4D405F] outline-none [&_img]:my-3 [&_img]:max-h-64 [&_img]:max-w-full [&_img]:rounded-lg" />}
    </div>
  </section>;
}