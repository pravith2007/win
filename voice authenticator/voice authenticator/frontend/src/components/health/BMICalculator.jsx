import React, { useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');
  const [history, setHistory] = useState([]);

  const calculateBMI = () => {
    if (!height || !weight) {
      alert('Please enter height and weight');
      return;
    }

    let heightInMeters = heightUnit === 'cm' ? height / 100 : height * 0.3048;
    let weightInKg = weightUnit === 'kg' ? weight : weight * 0.453592;

    const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    let categoryText = '';
    if (bmiValue < 18.5) categoryText = 'Underweight';
    else if (bmiValue < 25) categoryText = 'Normal Weight';
    else if (bmiValue < 30) categoryText = 'Overweight';
    else categoryText = 'Obese';

    setCategory(categoryText);

    const newEntry = {
      date: new Date().toLocaleDateString(),
      bmi: bmiValue,
      category: categoryText,
      height: `${height} ${heightUnit}`,
      weight: `${weight} ${weightUnit}`
    };
    setHistory([newEntry, ...history.slice(0, 9)]);
  };

  const getBMIColor = () => {
    if (!bmi) return 'text-gray-600';
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCategoryBg = () => {
    if (!category) return 'bg-gray-50';
    if (category === 'Underweight') return 'bg-blue-50';
    if (category === 'Normal Weight') return 'bg-green-50';
    if (category === 'Overweight') return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">BMI Calculator</h3>

          <div className="space-y-6">
            {/* Height Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Height</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter height"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <select
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateBMI}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Calculate BMI
            </button>
          </div>

          {/* Result */}
          {bmi && (
            <div className={`mt-8 p-6 rounded-lg ${getCategoryBg()}`}>
              <div className="flex items-center gap-4">
                <TrendingUp className={getBMIColor()} size={32} />
                <div>
                  <p className="text-sm text-gray-600">Your BMI</p>
                  <p className={`text-4xl font-bold ${getBMIColor()}`}>{bmi}</p>
                  <p className="text-sm text-gray-700 font-semibold mt-1">{category}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BMI Chart */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">BMI Categories</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <p className="font-semibold text-gray-800">Underweight</p>
              <p className="text-sm text-gray-600">BMI below 18.5</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
              <p className="font-semibold text-gray-800">Normal Weight</p>
              <p className="text-sm text-gray-600">BMI 18.5 to 24.9</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600">
              <p className="font-semibold text-gray-800">Overweight</p>
              <p className="text-sm text-gray-600">BMI 25 to 29.9</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
              <p className="font-semibold text-gray-800">Obese</p>
              <p className="text-sm text-gray-600">BMI 30 or higher</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <p className="text-sm text-gray-700">
              BMI is a general indicator. Consult your doctor for personalized health advice.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">BMI History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Height</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">BMI</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.height}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.weight}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{entry.bmi}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entry.category === 'Normal Weight' ? 'bg-green-100 text-green-700' :
                        entry.category === 'Underweight' ? 'bg-blue-100 text-blue-700' :
                        entry.category === 'Overweight' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {entry.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
