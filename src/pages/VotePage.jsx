import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

export default function VotePage() {
  const { id_sondage } = useParams();
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [remainingTime, setRemainingTime] = useState("");
  const navigate=useNavigate()
  // Charger les données du sondage (sans options)
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/sondage/${id_sondage}`
        );
        setPoll(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPoll();
  }, [id_sondage]);

  // Charger les options séparément
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/sondage/options/${id_sondage}`
        );
        console.log(res.data.options)
        setOptions(res.data.options); // res.data = tableau d'options
      } catch (error) {
        console.log(error);
      }
    };

    fetchOptions();
  }, [id_sondage]);

  // Timer en temps réel
useEffect(() => {
  if (!poll) return;

  const interval = setInterval(() => {
    const now = new Date();
    const end = new Date(poll.End_time); // attention à la casse: End_time
    let diff = Math.max(0, Math.floor((end - now) / 1000)); // différence en secondes

    const days = Math.floor(diff / (24 * 3600));
    diff -= days * 24 * 3600;

    const hours = Math.floor(diff / 3600);
    diff -= hours * 3600;

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    let timeString = "";
    if (days > 0) timeString += `${days}d `;
    if (hours > 0 || days > 0) timeString += `${hours}h `;
    timeString += `${minutes}m ${seconds}s`;

    setRemainingTime(timeString);
  }, 1000);

  return () => clearInterval(interval);
}, [poll]);


  // Envoyer le vote
  const submitVote = async () => {
    if (!selectedOption) {
      alert("Please choose an option.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must log in.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/vote/insert",
        {
          id_sondage,
          id_option: selectedOption,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Vote submitted successfully! 🎉");
      navigate('/polls')
    } catch (error) {
      console.log(error);
      alert("Error submitting vote");
    }
  };

  if (!poll) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">{poll.question}</h1>

          <p className="text-gray-600 mb-6">
            🕒 Poll ends in: <span className="font-semibold">{remainingTime}</span>
          </p>

          <div className="space-y-4 mb-8">
            {options.map((opt) => (
              <label
                key={opt.id_option}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="option"
                  value={opt.id_option}
                  onChange={() => setSelectedOption(opt.id_option)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-800">{opt.label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={submitVote}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Submit Vote
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
