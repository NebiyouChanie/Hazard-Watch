import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RainfallStatsCard = ({ stats, period }) => {
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

    const formatValue = (value) => {
        if (typeof value === 'number') {
            return `${value.toFixed(2)} mm`;
        }
        return `${value} mm`;
    };

    if (period === 'daily') {
        const selectedDay = Object.keys(stats)[0];
        const rainfallValues = Array.isArray(stats[selectedDay]) ? stats[selectedDay] : [stats[selectedDay]];
        cardTitle = `Rainfall on ${selectedDay}`;
        cardDescription = "Rainfall readings across available years.";
        dataToDisplay = rainfallValues.map((value, index) => ({
            label: `Year ${2005 + index}`,
            value: formatValue(value),
        }));
    } else if (period === 'monthly') {
        const selectedMonthNumber = Object.keys(stats)[0];
        const selectedMonthName = selectedMonthNumber ? new Date(0, parseInt(selectedMonthNumber) - 1).toLocaleString('default', { month: 'long' }) : '';
        const monthData = stats[selectedMonthNumber];
        cardTitle = `Rainfall in ${selectedMonthName}`;
        cardDescription = `Rainfall for ${selectedMonthName} across available years.`;
        dataToDisplay = (Array.isArray(monthData) ? monthData : [monthData]).map((value, index) => ({
            label: `Year ${2015 + index}`,
            value: formatValue(value),
        }));
    } else if (period === 'annual') {
        cardTitle = "Annual Rainfall";
        cardDescription = "Total annual rainfall for available years.";
        dataToDisplay = Object.entries(stats).map(([year, value]) => ({
            label: `Year ${year}`,
            value: formatValue(value),
        }));
    } else if (period === 'seasonal') {
        cardTitle = "Seasonal Rainfall";
        cardDescription = "Rainfall readings for each season across available years.";
        dataToDisplay = Object.entries(stats).flatMap(([season, values]) => {
            const seasonValues = Array.isArray(values) ? values : [values];
            return seasonValues.map((value, index) => ({
                label: `${season} - Year ${2005 + index}`,
                value: formatValue(value),
            }));
        });
    }

    return (
        <Card className="absolute bottom-4 left-4 z-2000 w-64 border border-gray-200 bg-white shadow-md rounded-lg">
            <CardHeader>
                <CardTitle className="text-lg text-blue-600 font-semibold">{cardTitle}</CardTitle>
                {cardDescription && <p className="text-sm text-gray-500">{cardDescription}</p>}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {dataToDisplay.map((item) => (
                    <p key={item.label} className="flex items-center justify-between">
                        <span className="font-medium text-blue-500">{item.label}:</span>
                        <span className="text-green-500">{item.value}</span>
                    </p>
                ))}
            </CardContent>
        </Card>
    );
};

export default RainfallStatsCard;