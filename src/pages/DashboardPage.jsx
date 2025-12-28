import LayoutDashboard from "../components/layout/LayoutDashboard";
import DashboardStatCard from "../components/DashboardStatCard";
import {
  UserGroupIcon,
  ChartBarIcon,
  PlayCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import PollsVisitorsChart from "../components/charts/PollsVisitorsChart";
import DonutChart from "../components/charts/DonutChart";
import { socket } from "../socket"; // ✅ SOCKET

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [pollStatus, setPollStatus] = useState({ active: 0, finished: 0 });
  const [engagement, setEngagement] = useState({ low: 0, medium: 0, high: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const statsRes = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/stats`, {
        headers,
      });
      setStats(statsRes.data);

      const monthlyRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/monthly-stats`,
        { headers }
      );
      setChartData(monthlyRes.data);

      const pollStatusRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/poll-status`,
        { headers }
      );
      setPollStatus({
        active: Number(pollStatusRes.data.active),
        finished: Number(pollStatusRes.data.finished),
      });

      const engagementRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/engagement`,
        { headers }
      );
      setEngagement(engagementRes.data);
    } catch (err) {
      console.error("Erreur récupération stats :", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // ✅ realtime dashboard
    const onDashChanged = () => fetchStats();
    socket.on("dashboard:changed", onDashChanged);

    return () => {
      socket.off("dashboard:changed", onDashChanged);
    };
  }, [fetchStats]);

  return (
    <LayoutDashboard>
      <div className="ml-8 md:ml-0">
      <h1 className="text-2xl font-bold mb-6">Aperçu du tableau de bord</h1>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardStatCard
          title="Total des utilisateurs"
          value={stats.total_unique_voters}
          icon={<UserGroupIcon className="h-8 w-8 text-gray-400" />}
        />

        <DashboardStatCard
          title="Total des sondages"
          value={stats.total_polls}
          icon={<ChartBarIcon className="h-8 w-8 text-gray-400" />}
        />

        <DashboardStatCard
          title="Sondages actifs"
          value={stats.active_polls}
          icon={<PlayCircleIcon className="h-8 w-8 text-gray-400" />}
        />

        <DashboardStatCard
          title="Sondages terminés"
          value={stats.finished_polls}
          icon={<CheckCircleIcon className="h-8 w-8 text-gray-400" />}
        />
      </div>

      <PollsVisitorsChart data={chartData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <DonutChart
          title="Répartition des sondages"
          subtitle="Aperçu des sondages actifs et terminés."
          data={[
            { name: "Sondages actifs", value: pollStatus.active },
            { name: "Sondages terminés", value: pollStatus.finished },
          ]}
          colors={["#4F9BFF", "#8BC0FF"]}
        />

        <DonutChart
          title="Engagement des votants"
          subtitle="Niveaux d’engagement des utilisateurs ayant participé."
          data={[
            { name: "Faible engagement (≤ 2 votes)", value: engagement.low },
            { name: "Engagement moyen (3 à 10 votes)", value: engagement.medium },
            { name: "Haut engagement (> 10 votes)", value: engagement.high },
          ]}
          colors={["#2A9D8F", "#F4A261", "#E63946"]}
        />
      </div>
    </LayoutDashboard>
  );
}
