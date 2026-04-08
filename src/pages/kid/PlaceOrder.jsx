import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import http from "../../api/http";

export default function PlaceOrder() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [experiment, setExperiment] = useState(null);

  useEffect(() => {
    fetchExperiment();
  }, [id]);

  const fetchExperiment = async () => {
    try {
      const res = await http.get(`/experiments/${id}`);
      setExperiment(res.data);
    } catch (error) {
      console.error("Error fetching experiment:", error);
    }
  };

  const handleOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.user_id) {
        throw new Error("Not logged in as kid");
      }

      const res = await http.post("/orders", {
        kid_id: user.user_id,
        experiment_id: Number(id),
        quantity: Number(quantity),
        notes,
      });

      const successMessage = res?.data?.message || "Order placed successfully! Confirmation email sent 📧";
      setMessage(successMessage);
      window.alert(successMessage);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to place order. Please try again.";
      setMessage(message);
      window.alert(message);
      console.error("Order error", message);
    }
  };

  if (!experiment) {
    return (
      <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
        <p className="text-slate-700">Loading experiment details...</p>
      </div>
    );
  }

  const totalPrice = experiment.price * quantity;

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
      <h2 className="text-2xl font-black text-slate-900 mb-4">Place Order 🛒</h2>

      {/* Experiment Details */}
      <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl p-4 mb-6">
        <div className="flex gap-4 mb-4">
          {experiment.image && (
            <img 
              src={experiment.image}
              alt={experiment.title} 
              className="w-24 h-24 object-cover rounded-lg" 
            />
          )}
          <div>
            <h3 className="font-bold text-xl text-slate-900">{experiment.title}</h3>
            <p className="text-slate-700">{experiment.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
          <div>
            <p><strong>Age Group:</strong> {experiment.ageGroup}</p>
            <p><strong>Difficulty:</strong> {experiment.difficulty}</p>
          </div>
          <div>
            <p><strong>Duration:</strong> {experiment.duration}</p>
            <p><strong>Price per kit:</strong> ${experiment.price}</p>
          </div>
        </div>

        <div className="mt-3">
          <p><strong>Tools Required:</strong></p>
          <div className="flex flex-wrap gap-2 mt-1">
            {experiment.tools.map((tool, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="space-y-4">
        <div className="bg-white/30 backdrop-blur-sm border border-white/40 p-4 rounded-2xl">
          <p className="text-lg font-semibold text-slate-900">Price per kit: LKR {experiment.price.toFixed(2)}</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">Total: LKR {totalPrice.toFixed(2)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-white/60 bg-white/70 p-2 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            placeholder="Any special instructions or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-20 resize-none border border-white/60 bg-white/70 p-2 rounded-xl"
          />
        </div>

        <div className="bg-white/30 backdrop-blur-sm border border-white/40 p-4 rounded-2xl">
          <p className="text-lg font-semibold text-slate-900">Total: LKR {totalPrice.toFixed(2)}</p>
        </div>

        <button
          onClick={handleOrder}
          className="bg-sky-600 text-white px-6 py-3 rounded-xl w-full hover:bg-sky-700 font-semibold transition-colors"
        >
          Confirm Order
        </button>

        {message && <p className="mt-3 text-green-600 font-semibold">{message}</p>}
      </div>
    </div>
  );
}
