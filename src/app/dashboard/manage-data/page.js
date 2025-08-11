export default function ManageDataPage() {
    return (
        <div>
            <div className="bg-green-600 text-white px-4 py-2 rounded mb-6 inline-block">
                <span className="font-medium">MANAGE DATA</span>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex space-x-4">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded">
                            <span>➕</span>
                            <span>Add</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded">
                            <span>👁️</span>
                            <span>View</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded">
                            <span>✏️</span>
                            <span>Edit</span>
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
                        <div className="col-span-1">No</div>
                        <div className="col-span-1">Tgl Input</div>
                        <div className="col-span-1">No. Tiket</div>
                        <div className="col-span-1">Channel</div>
                        <div className="col-span-1">Category</div>
                        <div className="col-span-2">Customer Name</div>
                        <div className="col-span-1">Number</div>
                        <div className="col-span-1">Card Number</div>
                        <div className="col-span-1">Created By Unit</div>
                        <div className="col-span-1">Unit Now</div>
                        <div className="col-span-1">Status</div>
                    </div>
                    <div className="py-8 text-center text-gray-500">
                        No data available
                    </div>
                </div>
            </div>
        </div>
    )
}