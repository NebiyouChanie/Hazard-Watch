// components/AnalysisPanel.jsx
'use client'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { X } from 'lucide-react'

export default function AnalysisPanel({
  selectedDate,
  onDateChange,
  activeLayer,
  onClose
}) {
  const [startDate, setStartDate] = useState(selectedDate ? new Date(selectedDate) : null)

  const handleDateChange = (date) => {
    setStartDate(date)
    const formattedDate = date ? formatDate(date) : ''
    onDateChange(formattedDate)
  }

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 relative">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">ANALYSIS</h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">
            {activeLayer === "rainfall" ? "Daily Rainfall" : "Daily Temperature"}: {selectedDate}
          </p>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded"
            placeholderText="Select Date"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
          />
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-medium mb-2">Data Type:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm">Type:</p>
              <p className="font-medium">Daily</p>
            </div>
            <div>
              <p className="text-sm">Unit:</p>
              <p className="font-medium">{activeLayer === "rainfall" ? "mm" : "°C"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}