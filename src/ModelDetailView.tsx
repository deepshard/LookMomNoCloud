import React from "react";
import { TModel } from "./types/schemas";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getModel } from "./api/model";
import ScrollingText from "./component/common/ScrollingText";

function ModelDetailView() {
  enum NavBarOptions {
    INTRO = "intro",
    CAPABILITIES = "capabilities",
    RISKS = "risks",
    EVALS = "evals",
  }

  const navBarOptions: NavBarOptions[] = [
    NavBarOptions.INTRO,
    NavBarOptions.CAPABILITIES,
    NavBarOptions.RISKS,
    NavBarOptions.EVALS,
  ];

  const { id } = useParams();
  const [modelData, setModelData] = useState<TModel | null>(null);
  useEffect(() => {
    getModel(id || "")
      .then((response) => {
        console.log("Model data:", response);
        setModelData(response);
      })
      .catch((error) => {
        console.error("Error fetching model data:", error);
      });
  }, [id]);
  
  const introRef = useRef(null);
  const capabilitiesRef = useRef(null);
  const risksRef = useRef(null);
  const evalsRef = useRef(null);


  const scrollToSection = (sectionName) => {
    const sectionRef = {
      intro: introRef,
      capabilities: capabilitiesRef,
      risks: risksRef,
      evals: evalsRef,
    }[sectionName];

    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  function formatDate(dateString: string | undefined) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center bg-black overflow-auto ">
      {/* Nav Bar */}
      <div className="sticky top-0 w-full p-5 gap-5 flex justify-between items-center z-[1000] mb-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black to-transparent z-[1] glass-3d"></div>
        {/* Left Side – Model Info*/}
        <div className="w-1/4 flex gap-2.5 justify-start items-center z-[10]">
          <img
            loading="lazy"
            srcSet={modelData?.background_image}
            className="shrink-0 aspect-square rounded-full w-[30px] "
          />

          <div className="flex flex-col justify-center items-start gap-0.5">
            <p className="text-surface-main">
              {
                <ScrollingText
                  text={
                    modelData && modelData?.name
                      ? modelData.name.split("/")[1]
                      : ""
                  }
                  isHovered={true}
                />
              }
            </p>
            <p className="text-surface-500 callout-base">
              {
                <ScrollingText
                  text={modelData && modelData?.author ? modelData.author : ""}
                  isHovered={true}
                />
              }
            </p>
          </div>
        </div>

        {/* Center – Model Info Options*/}
        <div className="flex items-center gap-3 text-surface-500 z-[1200] transition-colors duration-200">
          {navBarOptions.map((item, index) => {
            let displayText;
            switch (item) {
              case NavBarOptions.INTRO:
                displayText = "Introduction";
                break;
              case NavBarOptions.CAPABILITIES:
                displayText = "Capabilities";
                break;
              case NavBarOptions.RISKS:
                displayText = "Risks";
                break;
              case NavBarOptions.EVALS:
                displayText = "Evals";
                break;
              default:
                displayText = item;
            }
            return modelData && modelData[item] ? (
              <a
                key={index}
                onClick={() => scrollToSection(item)}
                className="hover:text-white transition-colors duration-200"
              >
                {displayText}
              </a>
            ) : null;
          })}
        </div>
        {/* Right Side – Icons */}
        <div className="w-1/4 flex gap-2 justify-end items-center z-[999]">
          {/* Play Icon */}
          <div className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px] hover:bg-opacity-40 transition-colors duration-200">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c31ab92a4fd3645efeccc34ee16f392935732535f5c30535bc0d1075fa51c4d7?"
              className="aspect-[0.92] w-[11px]"
            />
          </div>

          {/* Share Icon */}
          <div className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px] hover:bg-opacity-40 transition-colors duration-200">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/23374506a336f27a2db17d46661c1a3759cb478ef77dd3c76958392ef94852b3?"
              className="w-2.5 aspect-[0.83]"
            />
          </div>

          {/* Remove Icon */}
          <div className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px] hover:bg-opacity-40 transition-colors duration-200">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/d00e4348b5eb774375ed982383fe536b2371afb02773dd032362e43438f93a00?"
              className="aspect-[0.92] w-[11px]"
            />
          </div>

          {/* Close Icon */}
          <div
            className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px] hover:bg-opacity-40 transition-colors duration-200"
            onClick={() => window.history.back()}
          >
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/186a093a1b5a30895745f9abc67aecc81152635a0a268b0f5251519055ec5078?"
              className="w-2.5 aspect-[0.83]"
              onClick={() => window.history.back()}
            />
          </div>
        </div>
      </div>

      {/* Main Section – 100VH */}
      <div className="w-full h-[100vh] max-w-[660px] flex flex-col justify-between items-center space-y-auto">
        <div className="relative flex flex-col justify-start items-center">
          {/* Model's Image */}
          <div className="w-[660px] h-[408px] rounded-2xl overflow-hidden glass-3d-no-blur">
            <img
              src={modelData?.background_image}
              className=" w-full h-full "
            />
          </div>

          {/* Model's Name */}
          <div className=" -bottom-10 flex flex-col items-start gap-0.5 p-6">
            <p className="heading-md text-surface-main">{modelData?.name}</p>
            {/* <p className='title-xs text-surface-500'>by Meta</p> */}
          </div>
        </div>

        {/* Model's Info */}
        <div className="flex flex-col  items-center gap-5">
          <p className="text-surface-500">
            Created {formatDate(modelData?.createdAt)} • Last Modified{" "}
            {formatDate(modelData?.modifiedAt)}
          </p>
          <div className="flex gap-2.5 text-sm text-white text-opacity-80">
            {/* Author Tag */}
            <Tag text={modelData?.author || ""} />
            {/* Size Tag */}
            <Tag 
                text={modelData?.size
                    ? modelData.size >= 1e12
                    ? (modelData.size / 1e12).toFixed(1).replace(/\.0$/, "") + "T"
                    : modelData.size >= 1e9
                    ? (modelData.size / 1e9).toFixed(1).replace(/\.0$/, "") + "B"
                    : modelData.size >= 1e6
                    ? (modelData.size / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
                    : modelData.size >= 1e3
                    ? (modelData.size / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
                    : modelData.size
                    : "0"}
            />

            {/* Downloads Tag */}
            <Tag 
                imgSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/ca057c15afe4541dda72dcb2f8ca4f9f71c6d2b95d16f542b67d49e8075f2729?" 
                text={modelData?.downloads
                    ? modelData.downloads >= 1e12
                    ? (modelData.downloads / 1e12).toFixed(1) + "T"
                    : modelData.downloads >= 1e9
                    ? (modelData.downloads / 1e9).toFixed(1) + "B"
                    : modelData.downloads >= 1e6
                    ? (modelData.downloads / 1e6).toFixed(1) + "M"
                    : modelData.downloads >= 1e3
                    ? (modelData.downloads / 1e3).toFixed(1) + "K"
                    : modelData.downloads
                    : "0"}
            />

            {/* Likes/Bookmarks Tag */}
            <Tag 
                imgSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/e0bb8a4835580e7a1cfb71924c7fae68cb8d90ef93ccb81960418001d562993e?" 
                text={modelData?.likes
                    ? modelData.likes >= 1e12
                    ? (modelData.likes / 1e12).toFixed(1) + "T"
                    : modelData.likes >= 1e9
                    ? (modelData.likes / 1e9).toFixed(1) + "B"
                    : modelData.likes >= 1e6
                    ? (modelData.likes / 1e6).toFixed(1) + "M"
                    : modelData.likes >= 1e3
                    ? (modelData.likes / 1e3).toFixed(1) + "K"
                    : modelData.likes
                    : "0"}
                />
          </div>
        </div>
      </div>

      <div className="pb-10">
        {/* Map with all sections – Limitations, Capabilities, Risks, Evals, etc */}
        {modelData && (
          <div className="w-[660px] flex flex-col justify-start items-start gap-5">
            {navBarOptions.map((section) => {
              if (modelData[section] && modelData[section] !== "") {
                let displayText;
                let sectionRef;
                switch (section) {
                  case NavBarOptions.INTRO:
                    displayText = "Introduction";
                    sectionRef = introRef;
                    break;
                  case NavBarOptions.CAPABILITIES:
                    displayText = "Capabilities";
                    sectionRef = capabilitiesRef;
                    break;
                  case NavBarOptions.RISKS:
                    displayText = "Risks";
                    sectionRef = risksRef;
                    break;
                  case NavBarOptions.EVALS:
                    displayText = "Evals";
                    sectionRef = evalsRef;
                    break;
                  default:
                    displayText = section;
                }
                return (
                  <div key={section} ref={sectionRef}>
                    {/* Section Title */}
                    <p className="title-base text-surface-500">{displayText}</p>
                    {/* Section Text */}
                    <p className="text-surface-main body-long">
                      {modelData[section]}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface TagProps {
  imgSrc?: string;
  text: string | number;
}

const Tag: React.FC<TagProps> = ({ imgSrc, text }) => {
  return (
    <div className="flex gap-2 py-1.5 pr-2.5 pl-1.5 whitespace-nowrap bg-surface-100 rounded-full">
      {imgSrc && (
        <img
          loading="lazy"
          src={imgSrc}
          className="shrink-0 my-auto w-3.5 aspect-[1.08]"
        />
      )}
      <div>{text}</div>
    </div>
  );
};

  

export default ModelDetailView;
