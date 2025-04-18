import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DataVisualization({ regionName, date, data, dates, layer }) {
  const chartData = {
    labels: dates,
    datasets: [
      {
        label: layer === "rainfall" ? "Rainfall (mm)" : "Temperature (°C)",
        data: data,
        borderColor: layer === "rainfall" ? "#3b82f6" : "#ef4444",
        backgroundColor: layer === "rainfall" ? "#93c5fd" : "#fca5a5",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="font-medium mb-4">
        {layer === "rainfall" ? "Rainfall" : "Temperature"} Data for {regionName}
      </h3>
      
      <div className="mb-4">
        <p className="text-2xl font-bold">
          {data[dates.indexOf(date)]} {layer === "rainfall" ? "mm" : "°C"}
        </p>
        <p className="text-sm text-gray-500">on {date}</p>
      </div>

      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
