import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { shortcuts } = useKeyboardShortcuts();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-green-500" />
            <h2 className="text-white font-semibold">Keyboard Shortcuts</h2>
          </div>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-transparent border-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400 text-xs">
              <strong>Tip:</strong> These shortcuts work anywhere in the app when you're not typing in a text field.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 