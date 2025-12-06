import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function DonutChart({ title, subtitle, data, colors }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-500 text-sm mb-6">{subtitle}</p>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}    
              outerRadius={100}   
              paddingAngle={5}    
              dataKey="value"     
              nameKey="name"      
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={colors[idx]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
