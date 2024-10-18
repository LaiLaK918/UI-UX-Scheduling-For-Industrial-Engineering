import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GanttChart = ({ data }) => {
  // Chuẩn bị dữ liệu cho biểu đồ Gantt
  const sortedData = data.map((row) => ({
    job: row['Công việc'],
    startTime: row['Thời gian bắt đầu'],
    processingTime: row['Thời gian gia công'],
  }));

  const labels = sortedData.map((item) => item.job);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Thời gian bắt đầu',
        data: sortedData.map((item) => item.startTime),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Thời gian gia công',
        data: sortedData.map((item) => item.processingTime),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Biểu đồ Gantt',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Công việc',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default GanttChart;
