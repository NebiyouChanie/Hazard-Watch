'use client'

import React, { useState, useEffect } from 'react';
import { useTimeSeriesData } from '@/hooks/useTimeSeriesData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, AxisTick } from 'recharts';
import { cn } from '@/lib/utils';

const AnalyticsDashboardPage = () => {
    const [aggregation, setAggregation] = useState('daily');
    const [selectedMonth, setSelectedMonth] = useState('03'); // Initialize with March as per the screenshot
    const { timeSeriesData, loading, error, fetchTimeSeries } = useTimeSeriesData();

    const years = Array.from({ length: 10 }, (_, i) => 2005 + i); // Array of years
    const monthNames = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April',
        '05': 'May', '06': 'June', '07': 'July', '08': 'August',
        '09': 'September', '10': 'October', '11': 'November', '12': 'December',
    };

    useEffect(() => {
        fetchTimeSeries(aggregation, 'daily_by_day', selectedMonth); // Fetch daily data for the selected month on load
    }, [fetchTimeSeries, selectedMonth]); // Added selectedMonth as a dependency

    const handleAggregationChange = (newAggregation) => {
        setAggregation(newAggregation);
        setSelectedMonth(''); // Reset selected month when aggregation changes
        if (newAggregation === 'daily') {
            setSelectedMonth('01'); // Set to first month if switching to daily
        }
    };

    const handleMonthChange = (newMonth) => {
        setSelectedMonth(newMonth === null ? '' : newMonth);
        if (aggregation === 'daily' && newMonth) {
            fetchTimeSeries(aggregation, 'daily_by_day', newMonth); // Fetch data for the selected month
        } else if (aggregation === 'monthly' && newMonth) {
            fetchTimeSeries(aggregation, 'monthly', newMonth); // Fetch data for the selected month
        }
    };

    const formatDailyTick = (tick) => {
        if (aggregation === 'daily' && tick) {
            return tick.split('-')[1]; // Show only the day
        }
        return tick;
    };

    const formatMonthTick = (tick) => {
        return tick; // Use month number for X-axis
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-white border rounded shadow-md">
                    <p className="font-semibold">{aggregation === 'monthly' && monthNames[label] ? monthNames[label] : label}</p>
                    {payload.map((item) => (
                        <p key={item.dataKey} className="text-gray-700">
                            {item.name}: {item.value ? parseFloat(item.value).toFixed(2) : 'N/A'} mm
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomTick = ({ x, y, payload }) => {
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
            </g>
        );
    };

    const monthOptions = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    if (loading) {
        return <div className="p-6">Loading time series data...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error loading time series data: {error}</div>;
    }

    let chartData = [];
    let dataKeys = [];

    if (timeSeriesData) {
        if (aggregation === 'annual') {
            chartData = Object.entries(timeSeriesData).map(([year, value]) => ({ year, value: parseFloat(value).toFixed(2) }));
            dataKeys = ['value'];
        } else if (aggregation === 'daily') {
            chartData = Object.entries(timeSeriesData)
                .filter(([timePeriod]) => timePeriod.startsWith(selectedMonth + '-'))
                .map(([timePeriod, values]) => {
                    const entry = { timePeriod };
                    values.forEach((value, index) => {
                        entry[years[index]] = parseFloat(value).toFixed(2); // Use year as key
                    });
                    return entry;
                });
            if (chartData.length > 0) {
                dataKeys = years; // Use the array of years as data keys
            }
        } else if (aggregation === 'monthly') {
            chartData = Object.entries(timeSeriesData).map(([month, values]) => {
                const entry = { timePeriod: month }; // Use month number as timePeriod
                values.forEach((value, index) => {
                    entry[years[index]] = parseFloat(value).toFixed(2); // Use year as key
                });
                return entry;
            });
            if (chartData.length > 0) {
                dataKeys = years; // Use the array of years as data keys
            }
        } else {
            // Seasonal data
            chartData = Object.entries(timeSeriesData).map(([season, values]) => {
                const entry = { timePeriod: season };
                values.forEach((value, index) => {
                    entry[years[index]] = parseFloat(value).toFixed(2); // Use year as key
                });
                return entry;
            });
            if (chartData.length > 0) {
                dataKeys = years; // Use the array of years as data keys
            }
        }
    }

    return (
        <div className="w-full">
            <Card className=" mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="aggregation-select" className="text-sm font-medium">
                                Time Aggregation:
                            </label>
                            <Select onValueChange={handleAggregationChange} defaultValue={aggregation}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select aggregation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="season">Seasonal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {aggregation === 'daily' && (
                            <div className="flex items-center space-x-2">
                                <label htmlFor="month-select" className="text-sm font-medium">
                                    Select Month:
                                </label>
                                <Select onValueChange={handleMonthChange} value={selectedMonth}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthOptions.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}> {/* Increased bottom margin further */}
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timePeriod"
                                    tickFormatter={aggregation === 'monthly' ? formatMonthTick : formatDailyTick}
                                    angle={aggregation === 'monthly' ? -30 : -30}
                                    textAnchor={aggregation === 'monthly' ? 'end' : 'end'}
                                    interval={
                                        aggregation === 'daily'
                                            ? chartData.length > 30 ? Math.ceil(chartData.length / 30) : 'preserveStartEnd'
                                            : 'preserveStartEnd' // Show all months/seasons
                                    }
                                    tick={<CustomTick />} // Use custom tick for spacing
                                >
                                    <Label
                                        value={aggregation === 'annual' ? 'Year' : (aggregation === 'daily' ? 'Day' : 'Month/Season')}
                                        offset={50} // Increased offset further
                                        position="bottom"
                                    />
                                </XAxis>
                                <YAxis>
                                    <Label value="Value (mm)" angle={-90} position="left" offset={0} />
                                </YAxis>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" align="left" wrapperStyle={{ position: 'relative', bottom: -40 }} /> {/* Moved Legend and added wrapperStyle */}
                                {dataKeys.map((year) => (
                                    <Line
                                        key={year}
                                        type="monotone"
                                        dataKey={year}
                                        stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                                        strokeWidth={2}
                                        dot={false}
                                        name={year.toString()}
                                    />
                                ))}
                                {aggregation === 'annual' && dataKeys.includes('value') && (
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                                        strokeWidth={2}
                                        dot={false}
                                        name="Annual Value"
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-500">No time series data available for the selected aggregation and month.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboardPage;