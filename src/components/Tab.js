'use client'
import { useState } from 'react'
import ComplaintList from '@/components/form/ComplaintList'
import ComplaintTable from '@/components/ComplaintTable'

const TabComponent = () => {
  const [activeTab, setActiveTab] = useState('agent')

  const tabs = [
    { id: 'agent', label: 'List Open Ticket' },
    { id: 'eskalasi', label: 'List Progress' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'agent':
        return <ComplaintList />
      case 'eskalasi':
        return <ComplaintTable />
      default:
        return <ComplaintList />
    }
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  )
}

export default TabComponent