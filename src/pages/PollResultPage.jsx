import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PollResultsPage() {
  const { id_sondage } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [question, setQuestion] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noVotes, setNoVotes] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/sondage/results`, {
          id_sondage,
        });

        const results = res.data;

        if (!results || results.length === 0) {
          setNoVotes(true);
          setLoading(false);
          return;
        }

        setQuestion(results[0].question);

        const formatted = results.map((r) => ({
          id_option: r.Id_Option,
          label: r.option_text,
          vote_count: r.total,
        }));

        setData(formatted);

        const total = formatted.reduce((s, o) => s + o.vote_count, 0);
        setTotalVotes(total);

        if (total === 0) {
          setNoVotes(true);
        } else {
          setNoVotes(false);
        }
      } catch (err) {
        console.log(err);
        setNoVotes(true);
      }

      setLoading(false);
    };

    fetchResults();
  }, [id_sondage]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  const COLORS = ["#3b82f6", "#60a5fa", "#ef4444", "#f59e0b"];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 p-6 flex justify-center">
        <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-5xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Retour
          </button>

          <h1 className="text-2xl font-bold mb-2">
            Résultats du sondage : {question || `#${id_sondage}`}
          </h1>

          <p className="text-gray-600 mb-6">
            Statut :{" "}
            <span className="font-semibold text-red-500">Terminé</span> •
            <span className="ml-2 font-semibold">{totalVotes} votes</span>
          </p>

          {noVotes ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-gray-600">
                Aucun vote pour le moment 🗳️
              </p>
              <p className="text-gray-500 mt-2">
                Les résultats s’afficheront dès qu’un utilisateur vote.
              </p>
            </div>
          ) : (
            <>
              <div className="w-full h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="vote_count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      paddingAngle={3}
                      stroke="white"
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {data.map((opt, index) => {
                  const percentage = totalVotes
                    ? ((opt.vote_count / totalVotes) * 100).toFixed(1)
                    : 0;

                  return (
                    <div
                      key={opt.id_option}
                      className="flex items-center justify-between bg-gray-100 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            background: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="font-semibold">{opt.label}</span>
                      </div>

                      <span className="font-medium text-gray-700">
                        {percentage}% ({opt.vote_count} votes)
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
