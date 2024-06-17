import React from 'react'
import { TModel } from './types/schemas';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getModel } from './api/general';
import { useHomePageContext } from './context/HomePageProvider';

function ModelDetailView() {
const { showSearch } = useHomePageContext();

  const { id } = useParams();
  const [modelData, setModelData] = useState<TModel | null>(null);
  useEffect(() => {
    getModel(id || '')
      .then(response => {
        console.log('Model data:', response);
        setModelData(response);
      })
      .catch(error => {
        console.error('Error fetching model data:', error);
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
      evals: evalsRef
    }[sectionName];

    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function formatDate(dateString: string | undefined) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className='absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center bg-black overflow-auto '>

        {/* Nav Bar */}
        <div className='sticky top-0 w-full p-5 gap-5 flex justify-between items-center z-[1000] mb-10'>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black to-transparent z-[1] glass-3d"></div>
            {/* Left Side – Model Info*/}
            <div className="w-1/4 flex gap-2.5 justify-start items-center z-[10]">
                <img
                loading="lazy"
                srcSet={modelData?.background_image}
                className="shrink-0 aspect-square rounded-full w-[30px]"
                />

                <div className='flex flex-col justify-center items-start gap-0.5'>
                    <p className="text-surface-main">{modelData?.name.split('/')[1].substring(0, 20) + '...'}</p>
                    <p className="text-surface-500 callout-base">{modelData?.author.substring(0, 20) + '...'}</p>
                </div>
            </div>

            {/* Center – Model Info Options*/}
            <div className="flex items-center gap-3 text-surface-500 z-[1200] transition-colors duration-200">
                {['intro','capabilities', 'risks','evals'].map((item, index) => {
                    const displayText = item === 'intro' ? 'Introduction' :
                                        item === 'capabilities' ? 'Capabilities' :
                                        item === 'risks' ? 'Risks' :
                                        item === 'evals' ? 'Evals' : item;
                    return modelData && modelData[item] ? (
                        <a key={index} onClick={() => scrollToSection(item)} className="hover:text-white transition-colors duration-200">{displayText}</a>
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
                    onClick={() => window.location.href = '/'}
                >
                    <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/186a093a1b5a30895745f9abc67aecc81152635a0a268b0f5251519055ec5078?"
                    className="w-2.5 aspect-[0.83]"
                    />
                </div>
            </div>
        </div>

        {/* Main Section – 100VH */}
        <div className='w-full h-[100vh] max-w-[660px] flex flex-col justify-between items-center '>
            {/* DON'T REMOVE – Used for alignment purposes */}
            <div/>

            <div className='relative flex flex-col justify-start items-center'>
                {/* Model's Image */}
                <div className='w-[660px] h-[408px] glass-3d rounded-2xl overflow-hidden'>
                    <img src={modelData?.background_image} className=' w-full h-full'/>
                </div>

                {/* Model's Name */}
                <div className=' -bottom-10 flex flex-col items-start gap-0.5 p-6'>
                    <p className='heading-md text-surface-main'>{modelData?.name}</p>
                    {/* <p className='title-xs text-surface-500'>by Meta</p> */}
                </div>
            </div>
            

            {/* Model's Info */}
            <div className='flex flex-col  items-center gap-5'>
            <p className='text-surface-500'>Created {formatDate(modelData?.createdAt)} •  Last Modified: {formatDate(modelData?.modifiedAt)}</p>
                <div className="flex gap-2.5 text-sm text-white text-opacity-80">
                    {/* Author Tag */}
                    <div className="flex gap-2 py-1.5 px-2 whitespace-nowrap bg-surface-100 rounded-full">
                        {/* <img
                        loading="lazy"
                        srcSet="..."
                        className="shrink-0 aspect-square w-[17px]"
                        /> */}
                        <div>{modelData?.author}</div>
                    </div>
                    
                    {/* Size Tag */}
                    <div className="justify-center px-2.5 py-1.5 bg-surface-100 rounded-full">
                    {modelData?.size ? (modelData.size >= 1e12 ? (modelData.size / 1e12).toFixed(1) + 'T' : modelData.size >= 1e9 ? (modelData.size / 1e9).toFixed(1) + 'B' : modelData.size >= 1e6 ? (modelData.size / 1e6).toFixed(1) + 'M' : modelData.size >= 1e3 ? (modelData.size / 1e3).toFixed(1) + 'K' : modelData.size) : modelData?.size}
                    </div>

                    {/* Downloads Tag */}
                    <div className="flex gap-2 py-1.5 pr-2.5 pl-1.5 bg-surface-100 rounded-full">
                        <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/ca057c15afe4541dda72dcb2f8ca4f9f71c6d2b95d16f542b67d49e8075f2729?"
                        className="shrink-0 my-auto w-3.5 aspect-[1.08]"
                        />
                        <div>{modelData?.downloads ? (modelData.downloads >= 1e12 ? (modelData.downloads / 1e12).toFixed(1) + 'T' : modelData.downloads >= 1e9 ? (modelData.downloads / 1e9).toFixed(1) + 'B' : modelData.downloads >= 1e6 ? (modelData.downloads / 1e6).toFixed(1) + 'M' : modelData.downloads >= 1e3 ? (modelData.downloads / 1e3).toFixed(1) + 'K' : modelData.downloads) : '0'}</div>
                    </div>

                    {/* Likes/Bookmarks Tag */}
                    <div className="flex gap-2 py-1.5 pr-2.5 pl-1.5 whitespace-nowrap bg-surface-100 rounded-full">
                        <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/e0bb8a4835580e7a1cfb71924c7fae68cb8d90ef93ccb81960418001d562993e?"
                        className="shrink-0 my-auto w-3.5 aspect-[1.08]"
                        />
                        <div>{modelData?.likes ? (modelData.likes >= 1e12 ? (modelData.likes / 1e12).toFixed(1) + 'T' : modelData.likes >= 1e9 ? (modelData.likes / 1e9).toFixed(1) + 'B' : modelData.likes >= 1e6 ? (modelData.likes / 1e6).toFixed(1) + 'M' : modelData.likes >= 1e3 ? (modelData.likes / 1e3).toFixed(1) + 'K' : modelData.likes) : '0'}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className='pb-10'>

        {/* Map with all sections – Limitations, Capabilities, Risks, Evals, etc */}
        {modelData && (
            <div className='w-[660px] flex flex-col justify-start items-start gap-5'>
                {['intro', 'capabilities', 'risks'].map((section) => (
                    modelData[section] && modelData[section] !== "" && (
                        <div key={section} ref={section === 'intro' ? introRef : section === 'capabilities' ? capabilitiesRef : risksRef}>
                            {/* Section Title */}
                            <p className='title-base text-surface-500'>
                                {section === 'intro' ? "Introduction" : section === 'capabilities' ? "Capabilities" : section === 'risks' ? "Risks" : section}
                            </p>
                            {/* Section Text */}
                            <p className='text-surface-main body-long'>
                            {modelData[section]}
                            </p>
                        </div>
                    )
                ))}
            </div>
        )}
        </div>

    </div>
  )
}

export default ModelDetailView