import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreatePoll() {
  const [options, setOptions] = useState(["", ""]);
  const [question, setQuestion] = useState("");
  const [categorie, setCategorie] = useState("");

  const [hours, setHours] = useState(24);
  const [minutes, setMinutes] = useState(0);

  const maxOptions = 4;
  const navigate=useNavigate()
  const addOption = () => {
    if (options.length < maxOptions) {
      setOptions([...options, ""]);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        question,
        categorie,
        durationHours: Number(hours),
        durationMinutes: Number(minutes),
        options: options.filter(o => o.trim() !== "")
      };

      const res = await axios.post(
        "http://localhost:3001/dashboard/create-poll",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Sondage créé avec succès !");
      navigate("/dashboard")

    } catch (err) {
      console.error(err);
      alert("Erreur !");
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Poll</h2>

        {/* Poll Question */}
        <div className="mb-6">
          <label className="font-semibold">Poll Question</label>
          <textarea
            className="w-full mt-2 p-3 border rounded-lg"
            placeholder="Enter your poll question..."
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          ></textarea>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="font-semibold">Category</label>
          <input
            className="w-full mt-2 p-3 border rounded-lg"
            placeholder="Enter category"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
          />
        </div>

        {/* Answer Options */}
        <div className="mb-6">
          <label className="font-semibold">Answer Options (up to 4)</label>

          {options.map((opt, index) => (
            <input
              key={index}
              className="w-full mt-2 p-3 border rounded-lg"
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChange={(e) => updateOption(index, e.target.value)}
            />
          ))}

          {options.length < maxOptions && (
            <button
              onClick={addOption}
              className="flex items-center gap-2 mt-3 px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <span className="text-xl">+</span> Add Option
            </button>
          )}
        </div>

        {/* Poll Duration */}
        <div className="mb-6">
          <label className="font-semibold">Poll Duration</label>

          <div className="flex items-center gap-3 mt-2">
            <input
              type="number"
              className="w-20 p-3 border rounded-lg"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            <span className="text-xl font-bold">:</span>
            <input
              type="number"
              className="w-20 p-3 border rounded-lg"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Create Poll
        </button>
      </div>
    </>
  );
}
