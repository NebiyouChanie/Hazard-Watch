// components/RainfallStatsCard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Assuming you are using Shadcn UI or a similar library

const RainfallStatsCard = ({ stats }) => {
    console.log("🚀 ~ RainfallStatsCard ~ stats:", stats);
    if (!stats || Object.keys(stats).length === 0) {
        return (
            <Card className="absolute bottom-4 left-4 z-2000 w-64 border border-gray-200 bg-white shadow-md rounded-lg p-4">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Rainfall Data</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                    No rainfall data available for the selected region and day.
                </CardContent>
            </Card>
        );
    }

    const years = Object.keys(stats).sort();

    return (
        <Card className="absolute bottom-4 left-4 z-2000 w-64 border border-gray-200 bg-white shadow-md rounded-lg p-4">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Rainfall ({years[0]}-{years[years.length - 1]})</CardTitle>
                {/* Optionally display the selected date */}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {years.map(year => (
                    <p key={year} className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{year}:</span>
                        <span className="text-indigo-900">{typeof stats[year] === 'number' ? stats[year].toFixed(2) : stats[year]}</span>
                    </p>
                ))}
            </CardContent>
        </Card>
    );
};

export default RainfallStatsCard;