import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function CashflowChart({ data }) {

  if (!data) return null;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Income",
        data: data.income,
        borderColor: "green"
      },
      {
        label: "Expense",
        data: data.expense,
        borderColor: "red"
      }
    ]
  };

  return <Line data={chartData} />;
}