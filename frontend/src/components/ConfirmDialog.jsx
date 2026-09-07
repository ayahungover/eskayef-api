export default function ConfirmDialog({ message, error, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                <p className="text-slate-700 text-sm mb-6">{message}</p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </div>
            </div>
        </div>
    )
}