import { UserGroupIcon } from "@heroicons/react/24/outline";

export default function DashboardStatCard({
  title,
  value,
  icon = <UserGroupIcon className="h-8 w-8 text-gray-400" />,

}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer relative">

      <p className="text-sm text-gray-500 font-medium">{title}</p>

      <div className="flex items-center justify-between mt-2">
        <h2 className="text-3xl font-bold text-gray-900">{value}</h2>

        <div className="text-gray-400">{icon}</div>
      </div>

 

    </div>
  );
}
