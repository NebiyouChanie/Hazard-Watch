// components/RainfallStatsCard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Assuming you are using Shadcn UI or a similar library

const RainfallStatsCard = ({ stats, period }) => {
    console.log("🚀 ~ RainfallStatsCard ~ stats:", stats)
    console.log("🚀 ~ RainfallStatsCard ~ period:", period)
    if (!stats || Object.keys(stats).length === 0) {
        return (
            <Card className="absolute bottom-4 left-4 z-2000 w-64 border border-gray-200 bg-white shadow-md rounded-lg p-4">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Rainfall Data</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                    No rainfall data available for the selected {period}.
                </CardContent>
            </Card>
        );
    }

    let cardTitle = "Rainfall Data";
    let cardDescription = "";
    let dataToDisplay = [];

    if (period === 'daily' && Object.keys(stats).length > 0) {
        const selectedDay = Object.keys(stats)[0];
        const rainfallValues = stats[selectedDay];
        cardTitle = `Rainfall on ${selectedDay}`;
        cardDescription = "Rainfall readings across available years.";
        dataToDisplay = rainfallValues.map((value, index) => ({
            label: `Year ${2005 + index}`, // Assuming data starts from 2005 and is in order
            value: value,
        }));
    } else if (period === 'monthly' && Object.keys(stats).length > 0) {
        const selectedMonthNumber = Object.keys(stats)[0];
        const selectedMonthName = selectedMonthNumber ? new Date(0, parseInt(selectedMonthNumber) - 1).toLocaleString('default', { month: 'long' }) : '';
        cardTitle = `Rainfall in ${selectedMonthName}`;
        cardDescription = `Average rainfall for ${selectedMonthName} across available years.`;
        dataToDisplay = Object.entries(stats).flatMap(([month, values]) =>
            values.map((value, index) => ({
                label: `Year ${2015 + index}`, // Assuming data starts from 2015 and is in order
                value: value,
            }))
        );
    }

    return (
        <Card className="absolute bottom-4 left-4 z-2000 w-64 border border-gray-200 bg-white shadow-md rounded-lg">
            <CardHeader>
                <CardTitle className="text-lg text-blue-600 font-semibold">{cardTitle}</CardTitle>
                {cardDescription && <p className="text-sm text-gray-500 ">{cardDescription}</p>}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {dataToDisplay.map((item) => (
                    <p key={item.label} className="flex items-center justify-between">
                        <span className="font-medium text-blue-500">{item.label}:</span>
                        <span className="text-green-500">{typeof item.value === 'number' ? item.value.toFixed(2) : item.value}</span>
                    </p>
                ))}
            </CardContent>
        </Card>
    );
};

export default RainfallStatsCard;