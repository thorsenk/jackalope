import Markdown from "react-markdown";
import { ChevronDown, FileText } from "lucide-react";

export function SourceReference({
  source,
  label = "Source notes",
}: {
  source: string;
  label?: string;
}) {
  return (
    <details className="source-reference">
      <summary>
        <FileText aria-hidden="true" />
        {label}
        <ChevronDown className="disclosure-icon" aria-hidden="true" />
      </summary>
      <div className="markdown-content source-reading">
        <Markdown>{source}</Markdown>
      </div>
    </details>
  );
}
