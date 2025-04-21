// components/RainfallStatsCard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Assuming you are using Shadcn UI or a similar library

const RainfallStatsCard = ({ stats }) => {
    if (!stats || Object.keys(stats).length === 0) {
        return (
            <Card className="absolute bottom-4 left-4 z-2000 w-64 border border-gray-200 bg-white shadow-md rounded-lg p-4">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Rainfall Data</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                    No rainfall data available for the selected day.
                </CardContent>
            </Card>
        );
    }

    const selectedDay = Object.keys(stats)[0]; // Get the 'MM-DD' key
    const rainfallValues = stats[selectedDay];

    return (
        <Card className="absolute bottom-4 left-4 z-2000 w-64 border border-gray-200 bg-white shadow-md rounded-lg">
            <CardHeader>
                <CardTitle className="text-lg text-blue-600 font-semibold">Rainfall on {selectedDay}</CardTitle>
                <p className="text-sm text-gray-500 ">
                    Rainfall readings across available years.
                </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {rainfallValues.map((value, index) => (
                    <p key={index} className="flex items-center justify-between">
                        <span className="font-medium text-blue-500">Year {2005 + index}:</span> {/* Assuming data starts from 2005 and is in order */}
                        <span className="text-green-500">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                    </p>
                ))}
            </CardContent>
        </Card>
    );
};

export default RainfallStatsCard;