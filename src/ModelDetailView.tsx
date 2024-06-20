import { TModel } from "./types/schemas";
import {  useRef } from "react"

import { formatDate, formatParams } from "./utils/sysUtils";
import { NavBarOptions } from "./types/enums";
import { useLocation } from "react-router-dom";


function ModelDetailView() {

  const navBarOptions: NavBarOptions[] = [
    NavBarOptions.INTRO,
    NavBarOptions.CAPABILITIES,
    NavBarOptions.RISKS,
    NavBarOptions.EVALS,
  ];

  const location = useLocation();
  const modelData = location.state.model as TModel;

  console.log(modelData)


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


  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center bg-black overflow-auto hide-scrollbar ">
      {/* Nav Bar */}
      <div className="sticky top-0 w-full p-5 gap-5 flex justify-between items-center z-[1000] mb-6">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/75 to-transparent z-[1] "></div>
        {/* Left Side – Model Info*/}
        <div className="w-1/4 flex gap-2.5 justify-start items-center z-[10]">
          <img
            loading="lazy"
            srcSet={modelData?.background_image}
            className="shrink-0 aspect-square rounded-full w-[30px] "
          />

          <div className="flex flex-col justify-center items-start gap-0.5">
            <p className="text-surface-main">
              {modelData && modelData?.name ? modelData.name.split("/")[1] : ""}
            </p>
            <p className="text-surface-500 callout-base">
              {modelData && modelData?.author ? modelData.author : ""}
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
          <Icon
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c31ab92a4fd3645efeccc34ee16f392935732535f5c30535bc0d1075fa51c4d7?"
            className="aspect-[0.92] w-[11px]"
          />

          {/* Share Icon */}
          <Icon
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/23374506a336f27a2db17d46661c1a3759cb478ef77dd3c76958392ef94852b3?"
            className="w-2.5 aspect-[0.83]"
          />

          {/* Remove Icon */}
          <Icon
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/d00e4348b5eb774375ed982383fe536b2371afb02773dd032362e43438f93a00?"
            className="aspect-[0.92] w-[11px]"
          />

          {/* Close Icon */}
          <Icon
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/186a093a1b5a30895745f9abc67aecc81152635a0a268b0f5251519055ec5078?"
            className="w-2.5 aspect-[0.83]"
            onClick={() => window.history.back()}
          />
        </div>
      </div>

      {/* Main Section – 100VH */}
      <section className={"h-[100vh] max-w-[660px] mb-10 "}>
        <div className="w-full h-full flex flex-col items-center space-y-auto">
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
              <p className="heading-md text-surface-main ">
                {modelData?.name.split("/")[1]}
              </p>
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
                text={
                 formatParams(modelData?.size)
                }
              />

              {/* Downloads Tag */}
              <Tag
                imgSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/ca057c15afe4541dda72dcb2f8ca4f9f71c6d2b95d16f542b67d49e8075f2729?"
                text={
                 formatParams(modelData?.downloads)
                }
              />

              {/* Likes/Bookmarks Tag */}
              <Tag
                imgSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/e0bb8a4835580e7a1cfb71924c7fae68cb8d90ef93ccb81960418001d562993e?"
                text={
                  formatParams(modelData?.likes)
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-16 pb-14">
      <div>
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
                      <p className="title-base text-surface-500">
                        {displayText}
                      </p>
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
      </section>
    </div>
  );
}

interface TagProps {
  imgSrc?: string;
  text: string | number;
}

const Tag: React.FC<TagProps> = ({ imgSrc, text }) => {
  return (
    <div className="flex gap-2 py-1 pr-2.5 pl-1.5 whitespace-nowrap bg-surface-100 rounded-full justify-center items-center">
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




interface IconProps {
  src: string;
  className?: string;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({ src, className, onClick }) => (
  <div
    className="flex justify-center items-center p-1.5 bg-white bg-opacity-10 h-[30px] rounded-[93.75px] w-[30px] hover:bg-opacity-40 transition-colors duration-200"
    onClick={onClick}
  >
    <img loading="lazy" src={src} className={className} />
  </div>
);

export default ModelDetailView;
