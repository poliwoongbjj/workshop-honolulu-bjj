import React from "react";

const TailwindTest = () => {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Tailwind CSS Test
      </h1>

      <p className="text-gray-700 mb-6">
        If you're seeing this text styled with a gray color and proper margin,
        Tailwind is working!
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-200 rounded-lg p-4 shadow">
          <p className="font-medium">Red Box</p>
        </div>
        <div className="bg-green-200 rounded-lg p-4 shadow">
          <p className="font-medium">Green Box</p>
        </div>
      </div>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Styled Button
      </button>
    </div>
  );
};

export default TailwindTest;
