import { useEffect, useRef } from "react";

type KeyboardShortcutCallback = (e: KeyboardEvent) => void;

interface ShortcutOptions {
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  ignoreInput?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: KeyboardShortcutCallback,
  options: ShortcutOptions = {}
) {
  const callbackRef = useRef<KeyboardShortcutCallback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey = false, metaKey = false, altKey = false, shiftKey = false, ignoreInput = true } = options;

      // Check if target is an input field (inputs, textareas, select, contenteditable)
      if (ignoreInput) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // Check key and modifiers
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatches = !ctrlKey || event.ctrlKey;
      const metaMatches = !metaKey || event.metaKey;
      const altMatches = !altKey || event.altKey;
      const shiftMatches = !shiftKey || event.shiftKey;

      if (keyMatches && ctrlMatches && metaMatches && altMatches && shiftMatches) {
        event.preventDefault();
        callbackRef.current(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, options]);
}
