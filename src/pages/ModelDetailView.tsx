import { TModel } from "../types/schemas";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatDate, formatParams } from "../utils/sysUtils";
import { NavBarOptions } from "../types/enums";
import { useLocation } from "react-router-dom";
import { useGetHighlights, useGetModel, useGetMyModels } from "../lib/react-query/queriesAndMutations";
import Icon from "../component/Icon";
import Tag from "../component/Tag";
import useModelActions from "../hooks/modelActions/useModelActions";
import { useAppStore } from "../store/store";
import { upperFirst } from "lodash";
import { CircularProgressbar } from "react-circular-progressbar";
import { useAppWrapper } from "../context/AppWrapperProvider";

function ModelDetailView() {
  const navBarOptions: NavBarOptions[] = ["intro", "capabilities", "risks", "evals"];

  const location = useLocation();
  const { runModels, stopModel, installModel, deleteModel } = useModelActions();
  const { downloads, updateModels, sysInfo, onDeleteModel } = useAppStore();
  const { isLoadingMyModels } = useAppWrapper();
  const [modelData, setModelData] = useState<TModel | null>(location.state.model);

  const { refetch: getModel } = useGetModel(modelData);
  const { refetch: getMyModels } = useGetMyModels();
  const { refetch: getHighlights } = useGetHighlights();

  useLayoutEffect(() => {
    const modelData = location.state.model as TModel;
    if (!modelData || !modelData.createdAt || !modelData.modifiedAt) {
      getModel().then(({ data: model }) => {
        setModelData({ ...model, ...modelData });
      });
    }
  }, [location.state.model]);

  useEffect(() => {
    if (modelData && !isLoadingMyModels) {
      if (downloads[modelData.id]) {
        setModelData({ ...modelData, ...downloads[modelData.id] });
      } else {
        getModel().then(({ data: model }) => {
          model && setModelData({ ...model });
        });
      }
    }
  }, [downloads, sysInfo, isLoadingMyModels]);

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

  const getModelInfoHeader = () => {
    switch (modelData?.status) {
      case "RUNNING":
        return (
          <div className="absolute top-0 left-0 p-4 flex w-full h-full justify-between">
            <div className="running-info flex justify-center items-center px-3 py-1 rounded-sm w-[173px] h-[32px]">
              <img src={"/src/assets/icons/running-man.svg"} className="mr-2 w-[16px] h-[16px]" />
              <p className="text-surface-500 text-xs">
                https://localhost:{modelData.port}
              </p>
            </div>
            <div onClick={() => window.open(`https://google.com/search?q=${modelData.name}`)} className="running-info flex justify-center items-center px-3 py-1 rounded-sm w-[72px] h-[32px] cursor-pointer">
              <img src={"/src/assets/icons/docs.svg"} className="mr-2 w-[16px] h-[16px]" />
              <p className="text-surface-500 text-xs">
                Docs
              </p>
            </div>
          </div>
        );
      default:
        break;
    }
  }

  const getModelStatusIcon = () => {
    switch (modelData?.status) {
      case "ACKNOWLEDGED":
        return <Icon src="/src/assets/icons/install.svg" imgClassName="h-full w-full animate-spin" />;

      case "DOWNLOADING":
        return (
          <Icon>
            <div className="w-full h-full rounded-full">
              <CircularProgressbar
                value={modelData.progress || 0}
                text={`${modelData.progress}%`}
                styles={{
                  path: { stroke: "rgba(255, 255, 255, 1)" },
                  trail: { stroke: "rgba(255, 255, 255, 0.4)" },
                  text: { fill: "rgba(255, 255, 255, 0.75)", fontSize: "25px" },
                }}
              />
            </div>
          </Icon>
        );

      case "INSTALLING":
        return <Icon src="/src/assets/icons/install.svg" imgClassName="h-full w-full animate-spin" />;

      case "RUNNING":
        return (
          <Icon
            src="/src/assets/icons/stop.svg"
            imgClassName="h-[11px] w-[11px]"
            onClick={() => {
              stopModel(modelData).then((_) => {
                updateModels({
                  ...modelData,
                  status: "STOPPED",
                });
              });
            }}
          />
        );

      case "STOPPED":
        return (
          <Icon
            src="/src/assets/icons/play.svg"
            imgClassName="h-[11px] w-[11px]"
            onClick={() =>
              runModels([modelData], undefined, (updatedModel, controller) => {
                updateModels({
                  ...modelData,
                  ...updatedModel,
                });
                if (updatedModel.status === "RUNNING") {
                  controller.abort();
                }
              })
            }
          />
        );
      default:
        break;
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center bg-black overflow-auto hide-scrollbar ">
      {/* Nav Bar */}
      <div className="sticky top-0 w-full p-5 gap-5 flex justify-between items-center z-[1000] mb-6">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/75 to-transparent z-[1] "></div>
        {/* Left Side – Model Info*/}
        <div className="w-1/4 flex gap-2.5 justify-start items-center z-[10]">
          <img loading="lazy" srcSet={modelData?.backgroundImage} className="shrink-0 aspect-square rounded-full w-[30px] " />

          <div className="flex flex-col justify-center items-start gap-0.5">
            <p className="text-surface-main">{modelData && modelData?.name ? modelData.name.split("/")[1] : ""}</p>
            <p className="text-surface-500 callout-base">{modelData && modelData?.author ? modelData.author : ""}</p>
          </div>
        </div>

        {/* Center – Model Info Options*/}
        <div className="flex items-center gap-3 text-surface-500 z-[1200] transition-colors duration-200">
          {navBarOptions.map((item, index) => {
            const displayTitle = item === "intro" ? "Introduction" : upperFirst(item);
            return modelData && modelData[item] ? (
              <a key={index} onClick={() => scrollToSection(item)} className="hover:text-white transition-colors duration-200">
                {displayTitle}
              </a>
            ) : null;
          })}
        </div>

        {/* Right Side – Icons */}
        <div className="w-1/4 flex gap-2 justify-end items-center z-[999]">
          {modelData?.status && modelData?.status !== "NOT_DOWNLOADED" ? (
            <>
              {getModelStatusIcon()}

              {/* Share Icon */}
              <Icon src="/src/assets/icons/share.svg" imgClassName="h-[11px] w-[11px]" />

              {/* Remove Icon */}
              <Icon
                src="/src/assets/icons/trash.svg"
                imgClassName="h-[11px] w-[11px]"
                onClick={() => {
                  deleteModel(modelData).then((_) => {
                    onDeleteModel(modelData);
                    getMyModels();
                    getHighlights();
                  });
                }}
              />
            </>
          ) : (
            <Icon
              src="/src/assets/icons/download.svg"
              imgClassName="h-[11px] w-[11px]"
              className="w-auto flex-center gap-2 px-[24px] text-white"
              onClick={() => {
                modelData &&
                  installModel(modelData, undefined, (progress) => {
                    updateModels({
                      ...modelData,
                      ...progress,
                    });
                  });
              }}>
              <p className="text-sm">Install</p>
            </Icon>
          )}

          {/* Close Icon */}
          <Icon src="/src/assets/icons/close.svg" imgClassName="h-[11px] w-[11px]" onClick={() => window.history.back()} />
        </div>
      </div>

      {/* Main Section – 100VH */}
      <section className={"h-[100vh] max-w-[660px] mb-10 "}>
        <div className="w-full h-full flex flex-col items-center space-y-auto">
          <div className="relative flex flex-col justify-start items-center">
            {/* Model's Image */}
            <div className="w-[660px] h-[408px] rounded-2xl overflow-hidden glass-3d-no-blur">
              {getModelInfoHeader()}
              <img src={modelData?.backgroundImage} className=" w-full h-full " />
            </div>

            {/* Model's Name */}
            <div className=" -bottom-10 flex flex-col items-start gap-0.5 p-6">
              <p className="heading-md text-surface-main ">{modelData?.name.split("/")[1]}</p>
            </div>
          </div>

          {/* Model's Info */}
          <div className="flex flex-col  items-center gap-5">
            {modelData?.createdAt && modelData?.modifiedAt && (
              <p className="text-surface-500">
                Created {formatDate(modelData?.createdAt)} • Last Modified {formatDate(modelData?.modifiedAt)}
              </p>
            )}
            <div className="flex gap-2.5 text-sm text-white text-opacity-80">
              {/* Author Tag */}
              <Tag text={modelData?.author || ""} />
              {/* Size Tag */}
              <Tag text={formatParams(modelData?.size)} />

              {/* Downloads Tag */}
              <Tag imgSrc="/src/assets/icons/download-circle-fill.svg" text={formatParams(modelData?.downloads)} />

              {/* Likes/Bookmarks Tag */}
              <Tag imgSrc="/src/assets/icons/like-circle-fill.svg" text={formatParams(modelData?.likes)} />
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
                  let sectionRef;
                  const displayTitle = section === "intro" ? "Introduction" : upperFirst(section);
                  switch (section) {
                    case "intro":
                      sectionRef = introRef;
                      break;
                    case "capabilities":
                      sectionRef = capabilitiesRef;
                      break;
                    case "risks":
                      sectionRef = risksRef;
                      break;
                    case "evals":
                      sectionRef = evalsRef;
                      break;
                    default:
                      break;
                  }
                  return (
                    <div key={section} ref={sectionRef}>
                      {/* Section Title */}
                      <p className="title-base text-surface-500">{displayTitle}</p>
                      {/* Section Text */}
                      <p className="text-surface-main body-long">{modelData[section]}</p>
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

export default ModelDetailView;
