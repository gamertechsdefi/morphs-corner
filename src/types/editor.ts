export interface RichTextEditorProps {
  /** The HTML content of the editor */
  value: string;
  /** Callback when the content changes */
  onChange: (value: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to disable editing */
  disabled?: boolean;
}

export interface XPostEmbedAttributes {
  embedHtml: string;
}
