import React, { useEffect, useState } from "react";
import { Input } from "antd";

const SearchInput = ({ inputRef, search, setSearch, predictionData }) => {
  const [caseSensitivePredictiveText, setCaseSensitivePredictiveText] = useState("");

  useEffect(() => {
    updateCaseSensitivePredictiveText();
  }, [search, predictionData]);

  const updateCaseSensitivePredictiveText = () => {
    const predictiveText = predictionData?.[0]?.title || "";
    if (predictiveText && search) {
      const casedPrediction = predictiveText
        .split("")
        .map((char, i) => {
          if (i < search.length) return search[i];
          const prevChar = search[i - 1] || predictiveText[i - 1];
          return prevChar === prevChar.toUpperCase()
            ? char.toUpperCase()
            : char.toLowerCase();
        })
        .join("");
      setCaseSensitivePredictiveText(casedPrediction);
    } else {
      setCaseSensitivePredictiveText(predictiveText);
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && predictionData?.[0]?.title) {
      e.preventDefault();
      setSearch(predictionData[0].title);
    }
  };

  return (
    <div className="w-full relative">
      <Input
        ref={inputRef}
        value={search}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="-mx-[11px] h-[38px] bg-transparent text-[32px] border-none relative z-10 text-white capitalize"
      />
      <Input
        value={caseSensitivePredictiveText}
        className="-mx-[11px] h-[38px] bg-transparent text-[32px] border-none text-gray-500 absolute top-0 left-0 z-0 capitalize"
        readOnly
      />
    </div>
  );
};

export default SearchInput;