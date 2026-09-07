import Button from "./Button"

export default function ConfirmLogout({ 
  isOpen, 
  onConfirm, 
  onCancel 
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-gray-500 rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-gray-700 dark:text-gray-100 text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="text-gray-600 dark:text-gray-100 mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-400 text-gray-700 dark:text-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
