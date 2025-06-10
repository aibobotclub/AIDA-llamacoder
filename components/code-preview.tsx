import { Sandpack } from "@codesandbox/sandpack-react";

interface CodePreviewProps {
  code: string;
}

export default function CodePreview({ code }: CodePreviewProps) {
  if (!code) return null;

  return (
    <div className="w-full h-full">
      <Sandpack
        template="react-ts"
        files={{
          "App.tsx": code,
        }}
        theme="light"
        options={{
          showNavigator: false,
          showTabs: false,
        }}
      />
    </div>
  );
} 