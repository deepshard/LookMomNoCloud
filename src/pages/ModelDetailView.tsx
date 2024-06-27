import { TModel } from "../types/schemas";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatDate, formatParams , canFitOnMachine } from "../utils/sysUtils";
import { NavBarOptions } from "../types/enums";
import { useLocation } from "react-router-dom";
import { useGetHighlights, useGetModel, useGetMyModels } from "../lib/react-query/queriesAndMutations";
import { useAppStore } from "../store/store";
import { upperFirst } from "lodash";
import { CircularProgressbar } from "react-circular-progressbar";
import { useAppWrapper } from "../context/AppWrapperProvider";
import Icon from "../component/Icon";
import Tag from "../component/Tag";
import useModelActions from "../hooks/modelActions/useModelActions";
import Tooltip from "../component/common/Tooltip";
// @ts-ignore
import installIcon from "../assets/icons/install.svg";
// @ts-ignore
import stopIcon from "../assets/icons/stop.svg";
// @ts-ignore
import playIcon from "../assets/icons/play.svg";
// @ts-ignore
import shareIcon from "../assets/icons/share.svg";
// @ts-ignore
import trashIcon from "../assets/icons/trash.svg";
// @ts-ignore
import downloadIcon from "../assets/icons/download.svg";
// @ts-ignore
import closeIcon from "../assets/icons/close.svg";
// @ts-ignore
import downloadCircleIcon from "../assets/icons/download-circle-fill.svg";
// @ts-ignore
import likeCircleIcon from "../assets/icons/like-circle-fill.svg";
//@ts-ignore
import errorIcon from '../assets/icons/error.svg'
// @ts-ignore
import runningManIcon from "../assets/icons/running-man.svg";
// @ts-ignore
import docsIcon from "../assets/icons/docs.svg";
// @ts-ignore
import authorIcon from "../assets/icons/author.svg";
// @ts-ignore
import modelSizeIcon from "../assets/icons/modelsize.svg";



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
              <img src={runningManIcon} className="mr-2 w-[16px] h-[16px]" />
              <p className="text-surface-500 text-xs">https://localhost:{modelData.port}</p>
            </div>
            <div
              onClick={() => window.open(`https://google.com/search?q=${modelData.name}`)}
              className="running-info flex justify-center items-center px-3 py-1 rounded-sm w-[72px] h-[32px] cursor-pointer">
              <img src={docsIcon} className="mr-2 w-[16px] h-[16px]" />
              <p className="text-surface-500 text-xs">Docs</p>
            </div>
          </div>
        );
      default:
        break;
    }
  };

  const getModelStatusIcon = () => {
    switch (modelData?.status) {
      case "ACKNOWLEDGED":
        return <Icon src={installIcon} imgClassName="h-full w-full animate-spin" />;

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
        return <Icon src={installIcon} imgClassName="h-full w-full animate-spin" />;

      case "RUNNING":
        return (
          <Icon
            src={stopIcon}
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
            src={playIcon}
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

  const getNotDownloadedIcon = () => {
    if (canFitOnMachine(modelData?.size || 0, sysInfo?.resources.total.ram || 0, sysInfo?.resources.available.disk || 0)) {
      return (
        <Icon
          src={downloadIcon}
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
      );
    } else {
      return (
        <Tooltip
          overlayClassName="rounded-sm glass-3d"
          overlayInnerStyle={{
            color: 'surface-500',
            padding: '10px',
            fontSize: '12px',
          }}
          placement="bottom"
          color="transparent"
          title={"This model cannot fit in either the total memory or the available storage"}
        >
          <Icon
            src={errorIcon}
            imgClassName="h-[11px] w-[11px]"
            className="gap-2"
          >
          </Icon>
        </Tooltip>
      )
    }
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-bg-wdget-active">
        <div className="model-detail-navbar">
         
                  <div className="w-1/4"></div>


          <div className="flex items-center gap-3 text-surface-500 z-[1200] transition-colors duration-200">
            {navBarOptions.map((item, index) => {
              const displayTitle = item === "intro" ? "Introduction" : upperFirst(item);
              return modelData && modelData[item] ? (
                <a key={index} onClick={() => scrollToSection(item)} className="hover:text-white transition-colors duration-200 cursor-pointer">
                  {displayTitle}
                </a>
              ) : null;
            })}
          </div>

          <div className="w-1/4 flex gap-2 justify-end items-center z-[999] cursor-pointer">
            {modelData?.status && modelData?.status !== "NOT_DOWNLOADED" ? (
              <>
                {getModelStatusIcon()}

                <Icon src={shareIcon} imgClassName="h-[11px] w-[11px]" />

                {/* Remove Icon */}
                <Icon
                  src={trashIcon}
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
              <>
                {getNotDownloadedIcon()}
              </>
            )}

            <Icon src={closeIcon} imgClassName="h-[11px] w-[11px]" onClick={() => window.history.back()} />
          </div>
        </div>
      <div className="model-detail-view hide-scrollbar">

        <section className={"h-[100vh] max-w-[660px] mb-10 "}>
          <div className="w-full h-full flex flex-col items-center space-y-auto">
            <div className="relative flex flex-col justify-start items-center">
              <div className="w-[660px] h-[408px] rounded-2xl overflow-hidden glass-3d-no-blur">
                {getModelInfoHeader()}
                <img src={modelData?.backgroundImage} className=" w-full h-full " />
              </div>

              <div className=" -bottom-10 flex flex-col items-start gap-0.5 p-6">
                <p className="heading-md text-surface-main ">{modelData?.name.split("/")[1]}</p>
              </div>
            </div>

            <div className="flex flex-col  items-center gap-5">
              {modelData?.createdAt && modelData?.modifiedAt && (
                <p className="text-surface-500">
                  Created {formatDate(modelData?.createdAt)} • Last Modified {formatDate(modelData?.modifiedAt)}
                </p>
              )}
              <div className="flex gap-2.5 text-sm text-white text-opacity-80">
              <Tag imgSrc={authorIcon} text={modelData?.author || ""} />
                <Tag imgSrc={modelSizeIcon} text={formatParams(modelData?.size)} />

                <Tag imgSrc={downloadCircleIcon} text={formatParams(modelData?.downloads)} />

                <Tag imgSrc={likeCircleIcon} text={formatParams(modelData?.likes)} />
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16 pb-14">
          <div>
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
                        <p className="title-base text-surface-500">{displayTitle}</p>
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
    </div>
  );
}

export default ModelDetailView;