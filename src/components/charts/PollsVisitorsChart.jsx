import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function PollsVisitorsChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mt-10">
      <h2 className="text-xl font-bold mb-1">Polls & Visitors Over Time</h2>
      <p className="text-gray-500 text-sm mb-6">
        Monthly trend of new polls created and unique visitors.
      </p>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="polls"
              stroke="#1F8EFE"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
