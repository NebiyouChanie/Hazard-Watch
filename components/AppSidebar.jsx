'use client'
import { useState, useRef, useEffect } from 'react';
import {
  CloudRain, Thermometer, Droplets, Map,
  Settings, AlertTriangle, BarChart2, Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHazardData } from '../hooks/useHazardData';
import { useRouter } from 'next/navigation';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainItems = [{ title: "Dashboard", url: "#", icon: Map }]

const hazardItems = [
  {
    title: "Rainfall",
    url: "#",
    icon: CloudRain,
    subItems: [
      { title: "Daily", value: "daily" },
      { title: "Monthly", value: "monthly" },
      { title: "Seasonal", value: "belg" },
      { title: "Annual", value: "annual" },
    ]
  },
  {
    title: "Temperature",
    url: "#",
    icon: Thermometer,
    subItems: [
      { title: "Daily", value: "daily" },
      { title: "Monthly", value: "monthly" },
      { title: "Seasonal", value: "summer" },
      { title: "Annual", value: "annual" },
    ]
  }
]

const analysisItems = [
  { title: "Reports", url: "#", icon: BarChart2 },
  { title: "Layers", url: "#", icon: Layers }
]

export function AppSidebar() {
  const { loadRainfall, activeLayers, toggleLayerVisibility, removeLayer } = useHazardData()
  const router = useRouter();
  const [openCalendarFor, setOpenCalendarFor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});

  const handleHazardClick = (hazardType, periodValue, event) => {
    if (periodValue === 'daily') {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setCalendarPosition({
        top: buttonRect.top + window.scrollY,
        left: buttonRect.right + window.scrollX + 10
      });
      setOpenCalendarFor(openCalendarFor === hazardType ? null : hazardType);
    } else if (periodValue) {
      loadRainfall(hazardType.toLowerCase(), periodValue);
    }
  };

  const handleDateChange = async (date) => {
    if (!date) return;
    setSelectedDate(date);
    if (openCalendarFor) {

      try {
        await loadRainfall(date);
      } catch (error) {
        console.error('API Error:', error);
       }
      setOpenCalendarFor(null);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openCalendarFor && 
          !event.target.closest('.calendar-container') && 
          !Object.values(buttonRefs.current).some(ref => ref && ref.contains(event.target))) {
        setOpenCalendarFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openCalendarFor]);

  return (
    <div className="relative flex">
      <Sidebar className="w-64 border-r bg-gradient-to-b from-blue-50/20 to-white">
        <SidebarContent className="px-3 py-4">
          <div className="mb-6 px-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-blue-900">Hazard Watch</h1>
          </div>

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={cn(
                      "group flex items-center rounded-lg px-3 py-2 text-gray-700 transition-all",
                      "hover:bg-blue-50 hover:text-blue-700"
                    )}>
                      <a href={item.url}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="ml-3">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Hazard Data
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu>
                {hazardItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <div className="space-y-1">
                      <SidebarMenuButton asChild className={cn(
                        "group flex w-full items-center rounded-lg px-3 py-2 text-gray-700 transition-all",
                        "hover:bg-blue-50 hover:text-blue-700"
                      )}>
                        <a href={item.url}>
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="ml-3">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                      <div className="ml-8 space-y-1">
                        {item.subItems.map((subItem) => (
                          <div key={subItem.title} className="relative">
                            <button
                              ref={el => buttonRefs.current[`${item.title}-${subItem.value}`] = el}
                              onClick={(e) => handleHazardClick(item.title, subItem.value, e)}
                              className={cn(
                                "block w-full text-left rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                "text-gray-600 hover:bg-blue-100 hover:text-blue-800"
                              )}
                            >
                              {subItem.title}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Layers
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              {activeLayers.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">No active layers</p>
              ) : (
                <div className="space-y-1">
                  {activeLayers.map(layer => (
                    <div key={layer.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-blue-50">
                      <span className="text-sm font-medium">
                        {layer.type} - {layer.periodValue || layer.date}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleLayerVisibility(layer.id)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                        >
                          {layer.visible ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <button
                          onClick={() => removeLayer(layer.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto pt-6">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-gray-700 transition-all",
                  "hover:bg-blue-50 hover:text-blue-700"
                )}>
                  <a href="#">
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
      </Sidebar>

      {openCalendarFor && (
        <div 
          className="calendar-container absolute z-50 bg-white p-2 rounded-md shadow-lg border"
          style={{
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`
          }}
        >
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      )}
    </div>
  )
}