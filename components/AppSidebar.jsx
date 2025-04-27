// components/AppSidebar.jsx
'use client'
import { useState } from 'react';
import {
    CloudRain, Thermometer, Droplets, Map,
    Settings, AlertTriangle, BarChart2, Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHazardDataContext } from '@/context/HazardDataContext';
import { useTimeSeriesDataContext } from '@/context/TimeSeriesDataContext';
import { useRouter } from 'next/navigation';
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

export function AppSidebar() {
    const { loadRegions } = useHazardDataContext();
    const { updateCurrentPeriod, currentPeriod } = useTimeSeriesDataContext(); // Properly destructure here
    const router = useRouter();
    
    const [activeHazard, setActiveHazard] = useState(null);

    const handleHazardClick = async (hazardSlug, periodValue) => {
        setActiveHazard(hazardSlug);
        updateCurrentPeriod(periodValue); // This should now work
        
        // Load regions if not already loaded
        if (loadRegions) {
            await loadRegions();
        }
    };

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
                                                            onClick={() => handleHazardClick(hazardItem.slug, period.value)}
                                                            className={cn(
                                                                "block w-full text-left rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                                                "text-gray-600 hover:bg-blue-100 hover:text-blue-800",
                                                                activeHazard === hazardItem.slug && currentPeriod === period.value ? "bg-blue-100 text-blue-800" : ""
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
        </div>
    );
}