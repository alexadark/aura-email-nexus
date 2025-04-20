
import { useEffect } from "react";
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
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
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

  // Function to handle content changes and pass HTML to parent
  const handleChange = (editorState: any) => {
    if (onChange) {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editorState);
        onChange(htmlString);
      });
    }
  };

  // Function to initialize content from HTML
  const initialEditorState = (editor: any) => {
    if (initialContent) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialContent, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        $insertNodes(nodes);
      });
    }
  };

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
        <OnChangePlugin onChange={handleChange} />
        {initialContent && (
          <InitialContentPlugin content={initialContent} onInit={initialEditorState} />
        )}
      </div>
    </LexicalComposer>
  );
};

// Custom plugin to initialize content
const InitialContentPlugin = ({ 
  content, 
  onInit 
}: { 
  content: string; 
  onInit: (editor: any) => void 
}) => {
  useEffect(() => {
    // Get the editor instance and call onInit with it
    const editor = document.querySelector("[data-lexical-editor]")?.__lexicalEditor;
    if (editor) {
      onInit(editor);
    }
    // No return or clean-up needed here
  }, [content, onInit]);

  return null;
};
