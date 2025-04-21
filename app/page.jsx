'use client'

import React, { useState, useEffect } from 'react';
import { useTimeSeriesData } from '@/hooks/useTimeSeriesData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { cn } from '@/lib/utils';

const AnalyticsDashboardPage = () => {
    const [aggregation, setAggregation] = useState('daily');
    const [selectedMonth, setSelectedMonth] = useState(''); // New state for selected month
    const { timeSeriesData, loading, error, fetchTimeSeries } = useTimeSeriesData();

    const years = Array.from({ length: 10 }, (_, i) => 2005 + i); // Array of years
    const monthNames = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April',
        '05': 'May', '06': 'June', '07': 'July', '08': 'August',
        '09': 'September', '10': 'October', '11': 'November', '12': 'December',
    };

    useEffect(() => {
        fetchTimeSeries(aggregation);
    }, [aggregation, fetchTimeSeries]);

    const handleAggregationChange = (newAggregation) => {
        setAggregation(newAggregation);
        setSelectedMonth(''); // Reset selected month when aggregation changes
    };

    const handleMonthChange = (newMonth) => {
        setSelectedMonth(newMonth === null ? '' : newMonth); // Handle null for "All Months"
    };

    const formatDailyTick = (tick) => {
        if (aggregation === 'daily' && tick) {
            return tick.split('-')[1]; // Show only the day
        }
        return tick;
    };

    const formatMonthTick = (tick) => {
        if (aggregation === 'monthly' && monthNames[tick]) {
            return monthNames[tick];
        }
        return tick;
    };

    const monthOptions = [
        { value: null, label: 'All Months' },
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
            chartData = Object.entries(timeSeriesData).map(([year, value]) => ({ year, value }));
            dataKeys = ['value'];
        } else if (aggregation === 'daily') {
            chartData = Object.entries(timeSeriesData)
                .filter(([timePeriod]) => !selectedMonth || timePeriod.startsWith(selectedMonth + '-'))
                .map(([timePeriod, values]) => {
                    const entry = { timePeriod };
                    values.forEach((value, index) => {
                        entry[years[index]] = value; // Use year as key
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
                    entry[years[index]] = value; // Use year as key
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
                    entry[years[index]] = value; // Use year as key
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
            <Card className="max-w-4xl mx-auto">
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
                                        <SelectValue placeholder="All Months" />
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
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timePeriod"
                                    tickFormatter={aggregation === 'monthly' ? formatMonthTick : formatDailyTick}
                                    angle={aggregation === 'monthly' ? -30 : -30}
                                    textAnchor={aggregation === 'monthly' ? 'end' : 'end'}
                                    interval={
                                        aggregation === 'daily'
                                            ? chartData.length > 30 ? Math.ceil(chartData.length / 30) : 'preserveStartEnd'
                                            : 'preserveStartEnd' // Show all months
                                    }
                                >
                                    <Label
                                        value={aggregation === 'annual' ? 'Year' : (aggregation === 'daily' ? 'Day' : 'Month/Season')}
                                        offset={0}
                                        position="bottom"
                                    />
                                </XAxis>
                                <YAxis>
                                    <Label value="Value" angle={-90} position="left" offset={0} />
                                </YAxis>
                                <Tooltip />
                                <Legend />
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