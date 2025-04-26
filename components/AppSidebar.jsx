'use client'
import { useState, useRef, useEffect } from 'react';
import {
    CloudRain, Thermometer, Droplets, Map,
    Settings, AlertTriangle, BarChart2, Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHazardDataContext } from '@/context/HazardDataContext';
import { useTimeSeriesDataContext } from '@/context/TimeSeriesDataContext';
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
import { hazardConfig } from '@/config/hazardConfig';
import Link from 'next/link';

const mainItems = [{ title: "Dashboard", url: "/", icon: Map }]

const analysisItems = [
    { title: "Reports", url: "#", icon: BarChart2 },
    { title: "Layers", url: "#", icon: Layers }
]

const seasonOptions = ['MAM', 'JJAS', 'OND']; // Available season keys

export function AppSidebar() {
    const { loadHazardData, loadRegions } = useHazardDataContext();
    const { fetchTimeSeries } = useTimeSeriesDataContext();
    const router = useRouter();
    
    // State for date pickers
    const [openCalendarFor, setOpenCalendarFor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    
    // State for month/year picker
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [monthYearPickerPosition, setMonthYearPickerPosition] = useState({ top: 0, left: 0 });
    const [selectedMonthYear, setSelectedMonthYear] = useState(new Date());
    
    // State for year picker
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [yearPickerPosition, setYearPickerPosition] = useState({ top: 0, left: 0 });
    const [selectedYear, setSelectedYear] = useState(new Date());
    
    // State for seasonal picker
    const [showSeasonalPicker, setShowSeasonalPicker] = useState(false);
    const [seasonalPickerPosition, setSeasonalPickerPosition] = useState({ top: 0, left: 0 });
    const [selectedSeason, setSelectedSeason] = useState('MAM');
    
    const [activeHazard, setActiveHazard] = useState(null);
    const buttonRefs = useRef({});

    useEffect(() => {
        loadRegions();
    }, [loadRegions]);

    const handleHazardClick = async (hazardSlug, periodValue, needsDate, event) => {
        setActiveHazard(hazardSlug);
        if (needsDate) {
            const buttonRect = event.currentTarget.getBoundingClientRect();
            
            if (periodValue === 'seasonal') {
                setSeasonalPickerPosition({
                    top: buttonRect.top + window.scrollY,
                    left: buttonRect.right + window.scrollX + 10
                });
                setShowSeasonalPicker(openCalendarFor === `${hazardSlug}-${periodValue}` ? false : true);
                setOpenCalendarFor(openCalendarFor === `${hazardSlug}-${periodValue}` ? null : `${hazardSlug}-${periodValue}`);
                setShowMonthYearPicker(false);
                setShowYearPicker(false);
                return;
            } else if (periodValue === 'monthly') {
                setMonthYearPickerPosition({
                    top: buttonRect.top + window.scrollY,
                    left: buttonRect.right + window.scrollX + 10
                });
                setShowMonthYearPicker(openCalendarFor === `${hazardSlug}-${periodValue}` ? false : true);
                setOpenCalendarFor(openCalendarFor === `${hazardSlug}-${periodValue}` ? null : `${hazardSlug}-${periodValue}`);
                setShowYearPicker(false);
            } else if (periodValue === 'annual') {
                setYearPickerPosition({
                    top: buttonRect.top + window.scrollY,
                    left: buttonRect.right + window.scrollX + 10
                });
                setShowYearPicker(true);
                setOpenCalendarFor(`${hazardSlug}-${periodValue}`);
                setShowMonthYearPicker(false);
            } else {
                setCalendarPosition({
                    top: buttonRect.top + window.scrollY,
                    left: buttonRect.right + window.scrollX + 10
                });
                setShowMonthYearPicker(false);
                setShowYearPicker(false);
                setOpenCalendarFor(openCalendarFor === `${hazardSlug}-${periodValue}` ? null : `${hazardSlug}-${periodValue}`);
            }
        } else {
            console.log('Calling loadHazardData without date for:', hazardSlug, periodValue);
            try {
                await loadHazardData(null, periodValue, hazardSlug);
                if (periodValue === 'all') {
                    fetchTimeSeries('total');
                }
            } catch (error) {
                console.error('Error loading hazard data:', error);
            }
        }
    };

    const formatDateForTimeSeries = (date, aggregation) => {
        if (!date) return null;
        if (aggregation === 'daily_by_day') {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}-${day}`;
        } else if (aggregation === 'monthly') {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}-${year}`;
        } else if (aggregation === 'yearly') {
            return String(date.getFullYear());
        }
        return null;
    };

    const handleDateChange = async (date) => {
        if (!date) return;
        setSelectedDate(date);
        if (openCalendarFor && !showMonthYearPicker && !showYearPicker && !showSeasonalPicker) {
            const [slug, period] = openCalendarFor.split('-');
            try {
                await loadHazardData(date, period, slug);
                let timeSeriesAggregation = '';
                if (period === 'daily') {
                    timeSeriesAggregation = 'daily_by_day';
                }
                if (timeSeriesAggregation) {
                    fetchTimeSeries(timeSeriesAggregation, period, formatDateForTimeSeries(date, timeSeriesAggregation));
                }
            } catch (error) {
                console.error(`Error loading ${period} data for ${slug}:`, error);
            }
            setOpenCalendarFor(null);
        }
    };

    const handleMonthYearChange = async (date) => {
        if (!date) return;
        setSelectedMonthYear(date);
        if (openCalendarFor && showMonthYearPicker) {
            const [slug, period] = openCalendarFor.split('-');
            try {
                const formattedMonthYear = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear())}`;
                await loadHazardData(date, period, slug);
                if (period === 'monthly') {
                    fetchTimeSeries('monthly', period, formattedMonthYear);
                }
            } catch (error) {
                console.error(`Error loading ${period} data for ${slug}:`, error);
            }
            setShowMonthYearPicker(false);
            setOpenCalendarFor(null);
        }
    };

    const handleYearChange = async (date) => {
        if (!date) return;
        setSelectedYear(date);
        if (openCalendarFor && showYearPicker) {
            const [slug, period] = openCalendarFor.split('-');
            try {
                await loadHazardData(date, period, slug);
                if (period === 'annual') {
                    fetchTimeSeries('annual', period, formatDateForTimeSeries(date, 'yearly'));
                }
            } catch (error) {
                console.error(`Error loading ${period} data for ${slug}:`, error);
            }
            setShowYearPicker(false);
            setOpenCalendarFor(null);
        }
    };

    const handleSeasonalSubmit = async () => {
        if (openCalendarFor && showSeasonalPicker) {
            const [slug, period] = openCalendarFor.split('-');
            try {
                const seasonKey = `${selectedSeason}-${selectedYear.getFullYear()}`;
                await loadHazardData(seasonKey, period, slug);
                fetchTimeSeries('seasonal', period, seasonKey);
            } catch (error) {
                console.error(`Error loading ${period} data for ${slug}:`, error);
            }
            setShowSeasonalPicker(false);
            setOpenCalendarFor(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openCalendarFor &&
                !event.target.closest('.calendar-container') &&
                !event.target.closest('.react-datepicker-wrapper') &&
                !Object.values(buttonRefs.current).some(ref => ref && ref.contains(event.target))) {
                setOpenCalendarFor(null);
                setShowMonthYearPicker(false);
                setShowYearPicker(false);
                setShowSeasonalPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openCalendarFor, showMonthYearPicker, showYearPicker, showSeasonalPicker]);

    return (
        <div className="relative flex z-[1000]">
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
                                {hazardConfig.map((hazardItem) => (
                                    <SidebarMenuItem key={hazardItem.title}>
                                        <div className="space-y-1">
                                            <SidebarMenuButton asChild className={cn(
                                                "group flex w-full items-center rounded-lg px-3 py-2 text-gray-700 transition-all",
                                                "hover:bg-blue-50 hover:text-blue-700"
                                            )}>
                                                <Link href="/dashboard" className="w-full flex items-center">
                                                    <hazardItem.icon className="h-5 w-5 flex-shrink-0" />
                                                    <span className="ml-3">{hazardItem.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                            <div className="ml-8 space-y-1">
                                                {hazardItem.periods.map((period) => (
                                                    <div key={period.value} className="relative">
                                                        <button
                                                            ref={el => buttonRefs.current[`${hazardItem.slug}-${period.value}`] = el}
                                                            onClick={(e) => handleHazardClick(hazardItem.slug, period.value, period.needsDate, e)}
                                                            className={cn(
                                                                "block w-full text-left rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                                                "text-gray-600 hover:bg-blue-100 hover:text-blue-800"
                                                            )}
                                                        >
                                                            {period.label}
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
                </SidebarContent>
            </Sidebar>

            {/* Daily Date Picker */}
            {openCalendarFor && openCalendarFor.endsWith('-daily') && (
                <div
                    className="calendar-container absolute z-1000 bg-white p-2 rounded-md shadow-lg border"
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

            {/* Monthly Date Picker */}
            {openCalendarFor && openCalendarFor.endsWith('-monthly') && (
                <div
                    className="calendar-container absolute z-1000 bg-white p-2 rounded-md shadow-lg border"
                    style={{
                        top: `${monthYearPickerPosition.top}px`,
                        left: `${monthYearPickerPosition.left}px`
                    }}
                >
                    <DatePicker
                        selected={selectedMonthYear}
                        onChange={handleMonthYearChange}
                        inline
                        showMonthYearPicker
                        dateFormat="MM/yyyy"
                        showYearDropdown
                        dropdownMode="select"
                    />
                </div>
            )}

            {/* Annual Year Picker */}
            {openCalendarFor && openCalendarFor.endsWith('-annual') && (
                <div
                    className="calendar-container absolute z-1000 bg-white p-2 rounded-md shadow-lg border"
                    style={{
                        top: `${yearPickerPosition.top}px`,
                        left: `${yearPickerPosition.left}px`
                    }}
                >
                    <DatePicker
                        selected={selectedYear}
                        onChange={handleYearChange}
                        inline
                        showYearPicker
                        dateFormat="yyyy"
                        showYearDropdown
                        dropdownMode="select"
                    />
                </div>
            )}

            {/* Seasonal Picker */}
            {openCalendarFor && openCalendarFor.endsWith('-seasonal') && (
                <div
                    className="calendar-container absolute z-1000 bg-white p-4 rounded-md shadow-lg border"
                    style={{
                        top: `${seasonalPickerPosition.top}px`,
                        left: `${seasonalPickerPosition.left}px`
                    }}
                >
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                        <div className="flex space-x-2">
                            {seasonOptions.map(season => (
                                <button
                                    key={season}
                                    onClick={() => setSelectedSeason(season)}
                                    className={`px-3 py-1 text-sm rounded ${selectedSeason === season 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {season}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <DatePicker
                            selected={selectedYear}
                            onChange={date => setSelectedYear(date)}
                            showYearPicker
                            dateFormat="yyyy"
                            className="border rounded p-1 w-full"
                        />
                    </div>
                    
                    <button
                        onClick={handleSeasonalSubmit}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                    >
                        Load Data
                    </button>
                </div>
            )}
        </div>
    );
}