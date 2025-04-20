
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { QuoteNode } from "@lexical/rich-text";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";

const editorConfig = {
  namespace: "email-editor",
  theme: {
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "line-through",
      underlineStrikethrough: "underline line-through",
    },
    paragraph: "my-2",
    quote: "border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4",
    heading: {
      h1: "text-3xl font-bold my-4",
      h2: "text-2xl font-bold my-3",
      h3: "text-xl font-bold my-2",
    },
    list: {
      ul: "list-disc ml-4 my-2",
      ol: "list-decimal ml-4 my-2",
    },
  },
  nodes: [
    HeadingNode,
    LinkNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    TableNode,
    TableCellNode,
    TableRowNode,
  ],
  onError(error: Error) {
    console.error(error);
  },
};

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  className?: string;
}

export const RichTextEditor = ({ initialContent, onChange, className }: RichTextEditorProps) => {
  const { theme } = useTheme();

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className={cn(
        "relative min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        theme === "dark" ? "prose-invert" : "prose",
        className
      )}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              className="min-h-[200px] outline-none" 
            />
          }
          placeholder={
            <div className="absolute top-3 left-3 text-muted-foreground">
              Write your reply...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
      </div>
    </LexicalComposer>
  );
};
